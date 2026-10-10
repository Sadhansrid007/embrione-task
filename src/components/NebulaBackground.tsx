'use client';

import { useEffect, useRef } from 'react';

export default function NebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Request full high-DPI resolution
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) return;

    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = (aPosition + 1.0) * 0.5;
        vUv.y = 1.0 - vUv.y;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      uniform float uTime;
      uniform vec2 uRes;
      varying vec2 vUv;

      void main() {
        vec2 st = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
        
        // Logarithmic spiral pull towards center core
        float dist = length(st);
        float angle = atan(st.y, st.x);
        
        // Dynamic spiral rotation influence driven by cursor distance
        float spiralStrength = uMouse.x * 0.15;
        float pullStrength = uMouse.y * 0.08;
        
        float newAngle = angle + (1.0 / (dist + 0.15)) * spiralStrength + sin(uTime * 0.3) * 0.05;
        float newDist = dist * (1.0 - pullStrength * smoothstep(0.8, 0.0, dist));

        // Reconstruct warped coordinates
        vec2 warpedSt = vec2(cos(newAngle), sin(newAngle)) * newDist;
        vec2 uv = (warpedSt * uRes.y + 0.5 * uRes) / uRes;

        vec4 texColor = texture2D(uTexture, uv);

        // Left-to-Right Gradual Brightness Ramp
        // Darker on the left (0.40) to keep text readable -> Full brightness on the right (1.10)
        float leftToRightGlow = mix(0.40, 1.10, smoothstep(0.0, 0.85, vUv.x));
        vec3 finalColor = texColor.rgb * leftToRightGlow;

        // Enhance core nucleus light pulse
        float nucleus = smoothstep(0.45, 0.0, dist);
        finalColor += vec3(0.2, 0.08, 0.25) * nucleus * (0.8 + 0.2 * sin(uTime * 1.5));

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const compileShader = (src: string, type: number) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(vsSource, gl.VERTEX_SHADER));
    gl.attachShader(program, compileShader(fsSource, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uResLoc = gl.getUniformLocation(program, 'uRes');

    const texture = gl.createTexture();
    const image = new Image();
    image.src = '/nebula.jpg';
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const startTime = performance.now();

    const render = () => {
      const time = (performance.now() - startTime) * 0.001;
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.04;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.04;

      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform2f(uMouseLoc, mouse.currentX, mouse.currentY);
      gl.uniform1f(uTimeLoc, time);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}