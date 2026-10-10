'use client';

import { useEffect, useRef } from 'react';

// ---- Tunables ---------------------------------------------------------------
const IMAGE_SRC = '/nebula.jpg';
// Where the nebula's bright core sits on screen: [x from left, y from BOTTOM], 0..1
const NUCLEUS: [number, number] = [0.51, 0.46];
// true = same orientation your previous shader rendered (it flipped Y). Set false for the file's original orientation.
const FLIP_VERTICAL = true;
const STAR_COUNT = 420;
// How far the nucleus leans toward the cursor (0 = cursor does nothing)
const CURSOR_LEAN = 0.012;
const MAX_DPR = 2;

// ---- Background (nebula texture) -------------------------------------------
const BG_VERT = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const BG_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uTexture;
uniform vec2 uRes;
uniform float uImgAspect;
uniform float uTime;
uniform vec2 uNucleus;
uniform float uFlip;
uniform vec3 uTint;
varying vec2 vUv;

// "Cover" mapping: fills the screen without stretching the image
vec2 coverUV(vec2 uv) {
  float sa = uRes.x / uRes.y;
  vec2 s = vec2(1.0);
  if (sa > uImgAspect) { s.y = uImgAspect / sa; } else { s.x = sa / uImgAspect; }
  return (uv - 0.5) * s + 0.5;
}

void main() {
  float sa = uRes.x / uRes.y;
  vec2 p = vUv - uNucleus;
  p.x *= sa;
  float r = length(p);

  // Slow "inhale": the whole nebula drifts toward the nucleus while twisting gently
  // around it (faster near the core). Uses a smooth wave, so nothing ever winds up.
  float wave = 0.5 - 0.5 * cos(uTime * 0.045);
  float zoom = 1.0 - 0.05 * (1.0 - wave);
  float ang = 0.12 * sin(uTime * 0.045) * exp(-r * 2.2);
  float cs = cos(ang);
  float sn = sin(ang);
  p = mat2(cs, -sn, sn, cs) * p * zoom;
  p.x /= sa;

  vec2 uv = coverUV(uNucleus + p);
  if (uFlip > 0.5) { uv.y = 1.0 - uv.y; }
  vec3 col = texture2D(uTexture, uv).rgb;

  // Brightness ramps from dim (left) to bright (right)
  float lr = mix(0.30, 1.0, smoothstep(0.0, 1.0, vUv.x));
  col *= lr * 0.9;

  // Soft core glow that swells slightly as the system draws inward
  float core = smoothstep(0.5, 0.0, r);
  col += (vec3(0.14, 0.05, 0.18) + uTint * 0.04) * core * core * (0.6 + 0.4 * wave) * lr;

  // Vignette
  float vig = smoothstep(1.3, 0.3, length((vUv - 0.5) * vec2(sa, 1.0)));
  col *= mix(0.5, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

// ---- Stars spiraling into the nucleus --------------------------------------
const STAR_VERT = `
attribute vec4 aSeed; // x: start angle, y: phase, z: speed (cycles/sec), w: size
uniform float uTime;
uniform vec2 uNucleus;
uniform float uAspect;
uniform float uDpr;
uniform float uRmax;
varying float vAlpha;
varying float vX;
varying float vHeat;

void main() {
  float p = fract(aSeed.y + uTime * aSeed.z);   // 0 = born far away, 1 = reaches the nucleus
  float r = uRmax * (1.0 - p * p);              // accelerates as it falls inward
  float th = aSeed.x + 7.5 * pow(p, 1.4);       // spiral tightens toward the core
  vec2 d = vec2(cos(th), sin(th)) * r;
  vec2 uv = uNucleus + vec2(d.x / uAspect, d.y);

  gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);

  float fadeIn = smoothstep(0.0, 0.10, p);
  float fadeOut = 1.0 - smoothstep(0.86, 1.0, p);
  float twinkle = 0.75 + 0.25 * sin(uTime * (1.0 + aSeed.w) + aSeed.x * 10.0);
  vAlpha = fadeIn * fadeOut * twinkle;
  vX = clamp(uv.x, 0.0, 1.0);
  vHeat = smoothstep(0.7, 1.0, p);
  gl_PointSize = aSeed.w * uDpr * (1.0 - 0.5 * smoothstep(0.8, 1.0, p));
}
`;

const STAR_FRAG = `
precision mediump float;
uniform vec3 uTint;
varying float vAlpha;
varying float vX;
varying float vHeat;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d);
  vec3 cool = mix(vec3(0.82, 0.86, 1.0), uTint, 0.3);
  vec3 warm = vec3(1.0, 0.82, 0.62);
  vec3 col = mix(cool, warm, vHeat);
  float lr = mix(0.35, 1.0, vX);
  gl_FragColor = vec4(col, a * vAlpha * lr);
}
`;

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [0.5, 0.55, 0.97];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function NebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const makeProgram = (vs: string, fs: string, attr: string) => {
      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(prog, 0, attr);
      gl.linkProgram(prog);
      return prog;
    };

    const bgProg = makeProgram(BG_VERT, BG_FRAG, 'aPosition');
    const starProg = makeProgram(STAR_VERT, STAR_FRAG, 'aSeed');

    // Full-screen quad
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    // Star seeds: two spiral arms + some scattered field stars
    const seeds = new Float32Array(STAR_COUNT * 4);
    for (let i = 0; i < STAR_COUNT; i++) {
      const onArm = Math.random() < 0.8;
      const a0 = onArm
        ? (Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.4
        : Math.random() * Math.PI * 2;
      seeds[i * 4 + 0] = a0;
      seeds[i * 4 + 1] = Math.random();
      seeds[i * 4 + 2] = 1 / (50 + Math.random() * 45); // one inward trip every ~50-95s
      seeds[i * 4 + 3] = 1 + Math.random() * Math.random() * 2.6;
    }
    const starBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);

    const bgU = {
      texture: gl.getUniformLocation(bgProg, 'uTexture'),
      res: gl.getUniformLocation(bgProg, 'uRes'),
      imgAspect: gl.getUniformLocation(bgProg, 'uImgAspect'),
      time: gl.getUniformLocation(bgProg, 'uTime'),
      nucleus: gl.getUniformLocation(bgProg, 'uNucleus'),
      flip: gl.getUniformLocation(bgProg, 'uFlip'),
      tint: gl.getUniformLocation(bgProg, 'uTint'),
    };
    const starU = {
      time: gl.getUniformLocation(starProg, 'uTime'),
      nucleus: gl.getUniformLocation(starProg, 'uNucleus'),
      aspect: gl.getUniformLocation(starProg, 'uAspect'),
      dpr: gl.getUniformLocation(starProg, 'uDpr'),
      rmax: gl.getUniformLocation(starProg, 'uRmax'),
      tint: gl.getUniformLocation(starProg, 'uTint'),
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Sizing: render at the screen's real pixel density so it stays sharp ----
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (reduceMotion && ready) draw(performance.now());
    };

    // ---- Texture (power-of-two copy + mipmaps for clean downscaling) ----
    const texture = gl.createTexture();
    let ready = false;
    let imgAspect = 16 / 9;

    // ---- Pointer + tint state ----
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1); // +1 at top
    };

    const tint: [number, number, number] = hexToVec3('#818cf8');
    const targetTint: [number, number, number] = [...tint];
    const onAccent = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === 'string') {
        const v = hexToVec3(detail);
        targetTint[0] = v[0];
        targetTint[1] = v[1];
        targetTint[2] = v[2];
      }
    };

    let raf = 0;
    const start = performance.now();

    function draw(now: number) {
      const t = reduceMotion ? 20 : (now - start) / 1000;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      for (let i = 0; i < 3; i++) tint[i] += (targetTint[i] - tint[i]) * 0.05;

      const nx = NUCLEUS[0] + mouse.x * CURSOR_LEAN;
      const ny = NUCLEUS[1] + mouse.y * CURSOR_LEAN;
      const aspect = canvas!.width / canvas!.height;

      // 1) Nebula
      gl!.disable(gl!.BLEND);
      gl!.useProgram(bgProg);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuffer);
      gl!.enableVertexAttribArray(0);
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.uniform1i(bgU.texture, 0);
      gl!.uniform2f(bgU.res, canvas!.width, canvas!.height);
      gl!.uniform1f(bgU.imgAspect, imgAspect);
      gl!.uniform1f(bgU.time, t);
      gl!.uniform2f(bgU.nucleus, nx, ny);
      gl!.uniform1f(bgU.flip, FLIP_VERTICAL ? 1 : 0);
      gl!.uniform3f(bgU.tint, tint[0], tint[1], tint[2]);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);

      // 2) Stars (additive)
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE);
      gl!.useProgram(starProg);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, starBuffer);
      gl!.enableVertexAttribArray(0);
      gl!.vertexAttribPointer(0, 4, gl!.FLOAT, false, 0, 0);
      gl!.uniform1f(starU.time, t);
      gl!.uniform2f(starU.nucleus, nx, ny);
      gl!.uniform1f(starU.aspect, aspect);
      gl!.uniform1f(starU.dpr, dpr);
      gl!.uniform1f(starU.rmax, Math.sqrt(aspect * aspect + 1) * 0.8);
      gl!.uniform3f(starU.tint, tint[0], tint[1], tint[2]);
      gl!.drawArrays(gl!.POINTS, 0, STAR_COUNT);

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    const image = new Image();
    image.onload = () => {
      const maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE) as number, 4096);
      const pot = (n: number) => Math.min(maxTex, Math.pow(2, Math.round(Math.log2(n))));
      const tc = document.createElement('canvas');
      tc.width = pot(image.naturalWidth);
      tc.height = pot(image.naturalHeight);
      const ctx = tc.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, 0, 0, tc.width, tc.height);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      imgAspect = image.naturalWidth / image.naturalHeight;
      ready = true;
      raf = requestAnimationFrame(draw);
    };
    image.src = IMAGE_SRC;

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('embrione:accent', onAccent);

    // Pause when the tab is hidden
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (ready && !reduceMotion) raf = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('embrione:accent', onAccent);
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