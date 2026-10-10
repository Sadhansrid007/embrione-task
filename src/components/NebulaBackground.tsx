'use client';

import { useEffect, useRef } from 'react';

interface NebulaBackgroundProps {
  /** Optional hex tint (e.g. '#818cf8') that gently shifts the nebula mid-tones. */
  accentColor?: string;
}

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform vec3 uTint;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float stars(vec2 p, float scale, float threshold) {
  vec2 g = p * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(id);
  float on = step(threshold, h);
  vec2 offset = (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * 0.6;
  float d = length(f - offset);
  float twinkle = 0.65 + 0.35 * sin(uTime * (1.0 + h * 3.0) + h * 40.0);
  return on * smoothstep(0.09, 0.0, d) * twinkle;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  // Slow parallax from mouse + scroll
  vec2 pp = p + uMouse * 0.05 + vec2(0.0, uScroll * 0.18);
  float t = uTime * 0.035;

  // Domain-warped clouds
  vec2 q = vec2(fbm(pp * 1.6 + t), fbm(pp * 1.6 + vec2(5.2, 1.3) - t));
  float n = fbm(pp * 1.4 + 2.0 * q + vec2(t * 2.0, -t));

  vec3 deep    = vec3(0.025, 0.018, 0.065);
  vec3 violet  = vec3(0.34, 0.15, 0.60);
  vec3 magenta = vec3(0.70, 0.22, 0.56);
  vec3 warm    = vec3(1.00, 0.52, 0.24);

  vec3 col = deep;
  col = mix(col, violet, smoothstep(0.25, 0.70, n));
  col = mix(col, mix(magenta, uTint, 0.35), smoothstep(0.45, 0.88, n) * 0.8);

  // Warm glowing core
  float core = smoothstep(0.62, 0.0, length(pp - vec2(0.05, -0.04)));
  col += warm * core * core * (0.35 + 0.65 * n) * 0.6;

  // Dust lanes (darken parts of the cloud for depth)
  col *= 0.78 + 0.35 * smoothstep(0.2, 0.8, fbm(pp * 3.0 - t * 3.0));

  // Two star layers with different parallax
  float s = stars(p + uMouse * 0.02, 38.0, 0.93);
  s += stars(p * 1.0 + uMouse * 0.05 + 11.0, 18.0, 0.965) * 1.4;
  col += vec3(0.85, 0.88, 1.0) * s;

  // Vignette + gentle left-side darkening so headline text stays readable
  col *= smoothstep(1.45, 0.25, length(uv - 0.5) * 1.6);
  col *= mix(0.62, 1.0, smoothstep(0.0, 0.75, uv.x));

  gl_FragColor = vec4(col * 0.95, 1.0);
}
`;

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [0.5, 0.5, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function NebulaBackground({ accentColor = '#818cf8' }: NebulaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetTint = useRef<[number, number, number]>(hexToVec3(accentColor));

  useEffect(() => {
    targetTint.current = hexToVec3(accentColor);
  }, [accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    // Full-screen triangle
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uScroll = gl.getUniformLocation(program, 'uScroll');
    const uTint = gl.getUniformLocation(program, 'uTint');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Render below native resolution: the nebula is soft, and this keeps the GPU cost low
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.75;
      canvas.width = Math.max(2, Math.floor(window.innerWidth * scale));
      canvas.height = Math.max(2, Math.floor(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let scroll = 0;
    let scrollTarget = 0;
    const onScroll = () => {
      scrollTarget = window.scrollY / Math.max(1, window.innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tint: [number, number, number] = [...targetTint.current];

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const time = reduceMotion ? 12 : (now - start) / 1000;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      scroll += (scrollTarget - scroll) * 0.06;
      for (let i = 0; i < 3; i++) tint[i] += (targetTint.current[i] - tint[i]) * 0.05;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scroll);
      gl.uniform3f(uTint, tint[0], tint[1], tint[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    const loop = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    loop();

    // Pause when the tab is hidden
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduceMotion) loop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}