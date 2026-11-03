import { useEffect, useRef } from "react";

/*
 * Liquid Gradient from the Sideform landing (pen-editor
 * src/components/showcase/landing/LiquidGradient.tsx), itself the "Signale" Framer
 * template's shader. Shader, palette and uniforms are copied unchanged so the cover
 * matches the landing. Rendering pauses while the canvas is off screen.
 */

const VERTEX_SOURCE = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_pixelRatio;
uniform vec4 u_colors[8];
uniform int u_colors_length;
uniform float u_seed;
uniform float u_speed;
uniform float u_loop;
uniform float u_scale;
uniform float u_turbAmp;
uniform float u_turbFreq;
uniform float u_turbIter;
uniform float u_waveFreq;
uniform float u_distBias;
uniform float u_jellify;
uniform float u_ditherMode;
uniform float u_dither;
uniform float u_exposure;
uniform float u_contrast;
uniform float u_saturation;
// Halftone: dot-grid columns across the canvas (0 = off). Each cell samples the field at its
// centre and draws one dot sized and coloured by it, over black.
uniform float u_halftone;
// Smallest dot-grid cell in CSS px (0 = columns only)
uniform float u_cellPx;
uniform float u_dotMin;
uniform float u_dotMax;
// Shape: 0 = the liquid field; 1 = an eclipse, a dark disc above a glowing horizon,
// with the liquid field only adding texture
uniform float u_shape;
// Halftone ground: 0 = dots on black, >0 = the gradient itself shows between dots at this brightness
uniform float u_dotGround;

// === CONSTANTS ===
const float GOLDEN_ANGLE = 2.3999632;
const float TAU = 6.28318530;

// === PCG hash - https://www.jcgt.org/published/0009/03/02/
uvec3 hash3(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    return v;
}

// Seed
vec3 seedRandom(float seedVal) {
    uvec3 s = uvec3(
        floatBitsToUint(seedVal),
        floatBitsToUint(seedVal * 1.5 + 7.31),
        floatBitsToUint(seedVal * 2.7 + 13.37)
    );
    s = hash3(s);
    return vec3(s) / float(0xFFFFFFFFu);
}

// === COLOR SPACE UTILITIES ===
vec3 toLinear(vec3 c) {
    return pow(c, vec3(2.2));
}

vec3 toSrgb(vec3 c) {
    return pow(clamp(c, 0.0, 1.0), vec3(0.4545));
}

vec3 linearToOklab(vec3 c) {
    float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

    l = pow(max(l, 0.0), 1.0/3.0);
    m = pow(max(m, 0.0), 1.0/3.0);
    s = pow(max(s, 0.0), 1.0/3.0);

    return vec3(
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    );
}

vec3 oklabToLinear(vec3 c) {
    float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
    float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
    float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;

    l = l * l * l;
    m = m * m * m;
    s = s * s * s;

    return vec3(
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

vec3 oklabToLch(vec3 lab) {
    return vec3(lab.x, length(lab.yz), atan(lab.z, lab.y));
}

vec3 lchToOklab(vec3 lch) {
    return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

vec3 mixLch(vec3 lab0, vec3 lab1, float t) {
    vec3 lch0 = oklabToLch(lab0);
    vec3 lch1 = oklabToLch(lab1);

    if (lch0.y < 0.05) lch0.z = lch1.z;
    if (lch1.y < 0.05) lch1.z = lch0.z;

    float dh = lch1.z - lch0.z;
    if (dh > 3.14159265) dh -= 6.28318530;
    if (dh < -3.14159265) dh += 6.28318530;

    return lchToOklab(vec3(
        mix(lch0.x, lch1.x, t),
        mix(lch0.y, lch1.y, t),
        lch0.z + dh * t
    ));
}

// === PALETTE SAMPLING ===
vec3 getColor(int idx) {
    if (u_colors_length < 1) return vec3(0.0);
    int safeIdx = clamp(idx, 0, u_colors_length - 1);
    return u_colors[safeIdx].rgb;
}

vec3 paletteN(float t, int count) {
    if (count < 1) return vec3(0.0);
    if (count < 2) return toLinear(getColor(0));

    float segmentSize = 1.0 / float(count - 1);
    t = clamp(t, 0.0, 1.0);
    int idx = min(int(floor(t / segmentSize)), count - 2);
    float localT = clamp((t - float(idx) * segmentSize) / segmentSize, 0.0, 1.0);

    vec3 lab0 = linearToOklab(toLinear(getColor(idx)));
    vec3 lab1 = linearToOklab(toLinear(getColor(idx + 1)));

    return oklabToLinear(mixLch(lab0, lab1, localT));
}

// === DITHER ===
float IGN(vec2 uv) {
    return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715))));
}

float quickNoise(vec2 I) {
    return fract(sin(dot(I, vec2(12.9898, 78.233))) * 43758.5453);
}

// Dither Mode: 0=Off, 1=IGN, 2=quickNoise
float getDither(vec2 I, float mode) {
    if (mode < 0.5) return 0.5;          // 0: Off
    if (mode < 1.5) return IGN(I);       // 1: Smooth
    return quickNoise(I);                // 2: Grain
}

// === POST-PROCESS ===
vec3 softGamutMap(vec3 linearRgb) {
    float maxC = max(linearRgb.r, max(linearRgb.g, linearRgb.b));
    float minC = min(linearRgb.r, min(linearRgb.g, linearRgb.b));

    if (minC >= 0.0 && maxC <= 1.0) return linearRgb;

    vec3 lab = linearToOklab(max(linearRgb, 0.0));
    float L = clamp(lab.x, 0.0, 1.0);
    float C = length(lab.yz);
    float h = atan(lab.z, lab.y);

    float maxChroma = 0.4 * (1.0 - pow(abs(2.0 * L - 1.0), 2.0));

    if (C > maxChroma * 0.7) {
        float knee = maxChroma * 0.7;
        C = knee + (maxChroma - knee) * tanh((C - knee) / (maxChroma - knee + 0.001));
    }

    return clamp(oklabToLinear(vec3(L, C * cos(h), C * sin(h))), 0.0, 1.0);
}

vec3 applyContrastSaturation(vec3 linearRgb, float contrast, float saturation) {
    vec3 lab = linearToOklab(linearRgb);
    float C = length(lab.yz);
    float h = atan(lab.z, lab.y);

    lab.x = clamp((lab.x - 0.5) * contrast + 0.5, 0.0, 1.0);
    C *= saturation;
    lab.y = C * cos(h);
    lab.z = C * sin(h);

    return oklabToLinear(lab);
}

// Eclipse field: e is aspect-correct (x across, y up, 0 at the centre), tt is time.
// Perspective distance from the ripple centre (ellipses wider than tall)
vec2 rippleCentre(float tt) { return vec2(0.03 * sin(tt * 0.1), 0.08); }
float rippleDist(vec2 e, float tt) { return length((e - rippleCentre(tt)) * vec2(0.55, 1.3)); }

float eclipseField(vec2 e, float tt) {
    // Ripples on water (or sound waves) seen at an angle: rings flattened into ellipses, spreading out from
    // a dark centre where the drop fell. The near (lower) side of each ring catches the light.
    vec2 d2 = e - rippleCentre(tt);
    float dist = rippleDist(e, tt);
    // Water: mid blue, darker toward the bottom of the frame
    float water = 0.5 + 0.05 * e.y;
    water *= smoothstep(-1.1, -0.45, e.y) * 0.85 + 0.15;
    // The dark centre: hazy on top, firmer at the bottom
    float radius = 0.46;
    float soft = mix(0.03, 0.22, smoothstep(-0.6, 0.9, d2.y / radius));
    // The centre keeps a rounder shape than the flattened rings
    float holeDist = length(d2 * vec2(0.95, 1.2)) * 0.82;
    float hole = smoothstep(radius + soft, radius - soft, holeDist);
    float halo = exp(-max(holeDist - radius, 0.0) / 0.22);
    float v = water * (1.0 - 0.3 * halo);
    v = mix(v, 0.14 + 0.06 * d2.y, hole);
    // Rings travel outward, appear at the rim of the centre and fade as they spread
    // Thick, soft pulses, like a sound wave: a strong front and a weaker one behind it
    float spacing = 0.78;
    float phase = fract((dist - tt * 0.1 - 0.05) / spacing);
    float born = smoothstep(radius - 0.05, radius + 0.3, dist);
    float fade = exp(-max(dist - 1.0, 0.0) * 1.4);
    // Thick and bright on the near (bottom) side, thinning out like a crescent toward the far side
    float nearSide = smoothstep(0.8, -0.6, d2.y);
    float width = 0.04 + 0.22 * nearSide;
    float ring = exp(-pow(abs(phase - 0.5) / width, 3.0));
    v = max(v, ring * born * fade * (0.35 + 0.65 * nearSide));
    return v;
}

vec3 shadeValue(float v, int count) {
    vec3 col = paletteN(v, count);
    col *= u_exposure;
    col = applyContrastSaturation(col, u_contrast, u_saturation);
    col = softGamutMap(col);
    return toSrgb(col);
}

// === MAIN ===
void main() {
    vec2 pixel = v_uv * u_resolution;
    vec2 fragCoord = pixel;
    float halftone = step(0.5, u_halftone);
    // Columns set the density; u_cellPx (CSS px) is the smallest cell, so small canvases keep readable dots
    float cellPx = max(u_cellPx * u_pixelRatio, u_resolution.x / max(u_halftone, 1.0));
    vec2 cellCenter = (floor(pixel / cellPx) + 0.5) * cellPx;
    fragCoord = mix(pixel, cellCenter, halftone);
    vec2 r = u_resolution;
    vec2 p = (fragCoord * 2.0 - r) / r.y;

    int colorCount = u_colors_length;

    // Early out: no colors -> black
    if (colorCount < 1) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    float t = u_time * 0.3;

    // Map time onto a circle so animation seamlessly wraps.
    float looping = step(0.5, u_loop);
    float phase = TAU * u_time / max(u_loop, 0.01);
    float radius = u_loop * u_speed * 0.3 / TAU;
    float tA = sin(phase) * radius;
    float tB = (1.0 - cos(phase)) * radius;

    // Seed-based offsets
    vec3 seedOffset = seedRandom(u_seed);
    vec3 seedOffset2 = seedRandom(u_seed + 100.0);

    // Golden angle rotation
    float seedAngle = u_seed * GOLDEN_ANGLE;
    vec2 seedPhase = (seedOffset2.xy - 0.5) * TAU;

    // Seed-based rotation
    float cs = cos(seedAngle);
    float sn = sin(seedAngle);
    mat2 rot = mat2(cs, -sn, sn, cs);
    p = rot * p;

    // === MOUSE PUSH === (disabled: the template ships with the mouse off)
    vec2 pushField = vec2(0.0);
    p -= rot * pushField * 2.0;

    // Get dither value
    float dither = getDither(floor(fragCoord / u_pixelRatio), u_ditherMode);

    // === TURBULENCE ===
    float totalVal = 0.0;
    float totalWeight = 0.0;
    int turbIter = int(u_turbIter);

    float freq = 1.0 / max(u_turbFreq, 0.01);

    for (float i = 0.0; i < 4.0; i++) {
        float eph = i / 4.0;

        vec2 q = p * u_scale;
        float sq = eph * eph;

        if (u_jellify > 0.5) {
            q.yx *= mix(1.0, 0.5, 1.0 - exp(-sq));
        }

        float a = seedPhase.x;
        float d = seedPhase.y;

        for (int j = 2; j < 13; j++) {
            if (j >= turbIter) break;
            float fj = float(j);
            // When looping, use circular time. Otherwise original t.
            float t1 = mix(t * u_speed, tA, looping);
            float t2 = mix(t * u_speed, tB, looping);
            q += u_turbAmp * sin(q.yx / freq * fj + t1 + vec2(a, d) + seedOffset.xy * fj) / fj;
            a += cos(fj + d * 1.2 + q.x * 2.0 - t1 + seedOffset2.z + t2 * 0.3 * looping);
            d += sin(fj * q.y + a + seedOffset.z + t1 + seedOffset2.y + t2 * 0.3 * looping);
        }

        float v = 0.5 + 0.5 * sin(length(q.yx + vec2(a, d) * 0.2) * u_waveFreq + i * i + seedOffset.x);
        float weight = smoothstep(0.0, 0.5, eph) * smoothstep(1.0, 0.5, eph);
        totalVal += v * weight;
        totalWeight += weight;
    }

    float val = totalVal / totalWeight;
    val = clamp((val - 0.3) / 0.4, 0.0, 1.0);

    if (u_shape > 0.5) {
        vec2 e = (fragCoord * 2.0 - r) / r.y;
        float liquid = val;
        float v = eclipseField(e, u_time * u_speed);
        val = clamp(v + (liquid - 0.5) * 0.10, 0.0, 1.0);
    }
    val = pow(val, exp(-u_distBias));
    val = clamp(val + (dither - 0.5) * u_dither * (1.0 - halftone), 0.0, 1.0);

    vec3 col = shadeValue(val, colorCount);

    if (halftone > 0.5) {
        // Dot radius grows with the field; a faint glow keeps the ribbon's body
        float lum = clamp(dot(col, vec3(0.2126, 0.7152, 0.0722)) * 1.4, 0.0, 1.0);
        float ground01 = step(0.001, u_dotGround);
        // On a coloured ground: tiny sparks in the sky, big dots only where it glows
        float size = mix(sqrt(lum), 0.32 + 0.68 * smoothstep(0.6, 0.95, val), ground01);
        // Ripples: dots grow with distance from the centre until they nearly merge
        float spread = 0.0;
        if (u_shape > 0.5) {
            spread = smoothstep(0.6, 1.7, rippleDist((cellCenter * 2.0 - r) / r.y, u_time * u_speed));
            size = max(size, spread * 1.12);
        }
        float radius = 0.5 * cellPx * mix(u_dotMin, u_dotMax, size);
        float dist = length(pixel - cellCenter);
        float dotMask = 1.0 - smoothstep(radius - 0.75 * u_pixelRatio, radius + 0.5 * u_pixelRatio, dist);
        // On a coloured ground the dots are lighter than the field under them
        // Big outer dots take the field's colour, so merged dots read as the surface itself
        vec3 ink = mix(col, vec3(1.0), 0.7 * ground01 * (1.0 - spread));
        // The ground between dots is the smooth field at this pixel, not the cell's sample
        vec3 ground = col;
        if (u_shape > 0.5) {
            ground = shadeValue(clamp(eclipseField((pixel * 2.0 - r) / r.y, u_time * u_speed), 0.0, 1.0), colorCount);
        }
        // Gaps between merged outer dots stay dark, so the grid still reads
        float groundK = u_dotGround * (1.0 - 0.45 * spread);
        col = mix(ground * groundK, ink, dotMask) + col * lum * lum * 0.08 * (1.0 - ground01);
    }

    fragColor = vec4(col, 1.0);
}
`;

/** Colour presets: `sideform` is the landing's palette, unchanged; the others reuse the shader. */
const GRADIENTS = {
  sideform: { palette: ["#020202", "#020202", "#3c50a5", "#c0d5d0", "#ff4000", "#020202"], seed: 36, uniforms: {} },
  // Same shader, its own look (after Danil's reference): a halftone eclipse, a soft
  // dark blob above a glowing horizon on a blue field, a dot grid of 140 columns, never finer than 4px
  qure: {
    palette: ["#020818", "#04173d", "#082a6c", "#0f3f9a", "#1a57bd", "#2f8aa2", "#8fdcea", "#effcff"],
    seed: 58,
    uniforms: {
      u_scale: 0.55,
      u_exposure: 1,
      u_contrast: 1.05,
      u_shape: 1,
      u_halftone: 140,
      u_cellPx: 4,
      u_dotMin: 0.14,
      u_dotMax: 0.95,
      u_dotGround: 0.7,
    },
  },
} as const satisfies Record<
  string,
  { palette: readonly string[]; seed: number; uniforms: Record<string, number> }
>;
export type GradientName = keyof typeof GRADIENTS;

/** Seconds into the animation used for the single frame drawn under reduced motion. */
const STATIC_FRAME_TIME = 3;
const MAX_PIXEL_RATIO = 2;

const NUMBER_UNIFORMS: Record<string, number> = {
  u_speed: 1,
  u_loop: 0,
  u_scale: 0.64,
  u_turbAmp: 0.32,
  u_turbFreq: 2,
  u_turbIter: 3,
  u_waveFreq: 2.6,
  u_distBias: 0,
  u_jellify: 0,
  u_ditherMode: 1,
  u_dither: 0.07,
  u_exposure: 1.1,
  u_contrast: 1.1,
  u_saturation: 1,
  u_halftone: 0,
  u_dotMin: 0.14,
  u_dotMax: 0.82,
  u_shape: 0,
  u_cellPx: 0,
  u_dotGround: 0,
};

function hexToRgba(hex: string): [number, number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255, 1];
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV)
      console.warn("LiquidGradient shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

interface GlResources {
  buffer: WebGLBuffer | null;
  program: WebGLProgram;
  vertex: WebGLShader;
  fragment: WebGLShader;
  resolutionLocation: WebGLUniformLocation | null;
  timeLocation: WebGLUniformLocation | null;
  pixelRatioLocation: WebGLUniformLocation | null;
}

function freeResources(gl: WebGL2RenderingContext, r: GlResources) {
  gl.deleteBuffer(r.buffer);
  gl.deleteProgram(r.program);
  gl.deleteShader(r.vertex);
  gl.deleteShader(r.fragment);
}

/** Compiles the program and uploads buffers + constant uniforms. Called again after a context restore. */
function buildResources(gl: WebGL2RenderingContext, preset: GradientName): GlResources | null {
  const { palette, seed } = GRADIENTS[preset];
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // One oversized triangle covers the whole viewport.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.useProgram(program);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const colors = new Float32Array(8 * 4);
  palette.forEach((hex, i) => colors.set(hexToRgba(hex), i * 4));
  gl.uniform4fv(gl.getUniformLocation(program, "u_colors"), colors);
  gl.uniform1i(gl.getUniformLocation(program, "u_colors_length"), palette.length);
  gl.uniform1f(gl.getUniformLocation(program, "u_seed"), seed);
  const overrides: Record<string, number> = GRADIENTS[preset].uniforms;
  for (const [name, value] of Object.entries({ ...NUMBER_UNIFORMS, ...overrides })) {
    gl.uniform1f(gl.getUniformLocation(program, name), value);
  }
  return {
    buffer,
    program,
    vertex,
    fragment,
    resolutionLocation: gl.getUniformLocation(program, "u_resolution"),
    timeLocation: gl.getUniformLocation(program, "u_time"),
    pixelRatioLocation: gl.getUniformLocation(program, "u_pixelRatio"),
  };
}

/**
 * Context release is deferred one task: React StrictMode re-runs the effect on the same
 * canvas, and getContext() would hand back an already-lost context.
 */
const pendingRelease = new WeakMap<HTMLCanvasElement, ReturnType<typeof setTimeout>>();

/** Starts the gradient on `canvas`. Returns a cleanup, or null without WebGL2 (the fallback image shows). */
function startGradient(canvas: HTMLCanvasElement, preset: GradientName): (() => void) | null {
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
  } catch {
    gl = null;
  }
  if (!gl) return null;
  const context = gl;
  clearTimeout(pendingRelease.get(canvas));
  pendingRelease.delete(canvas);
  let resources = buildResources(context, preset);
  if (!resources) return null;

  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startedAt = performance.now() - STATIC_FRAME_TIME * 1000;
  let inView = false;
  let lost = false;
  let disposed = false;
  let frame = 0;

  function resize() {
    if (!resources) return;
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    context.viewport(0, 0, width, height);
    context.uniform2f(resources.resolutionLocation, width, height);
    context.uniform1f(resources.pixelRatioLocation, ratio);
  }

  function render(time: number) {
    if (!resources) return;
    context.uniform1f(resources.timeLocation, time);
    context.drawArrays(context.TRIANGLES, 0, 3);
    canvas.dataset.ready = "true";
  }

  function tick() {
    frame = 0;
    if (disposed || lost || !inView || document.hidden) return;
    render((performance.now() - startedAt) / 1000);
    frame = requestAnimationFrame(tick);
  }

  function schedule() {
    if (disposed || lost) return;
    if (reducedMotion) {
      render(STATIC_FRAME_TIME);
      return;
    }
    if (frame === 0 && inView && !document.hidden) frame = requestAnimationFrame(tick);
  }

  resize();
  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          resize();
          render((performance.now() - startedAt) / 1000);
        });
  resizeObserver?.observe(canvas);
  const intersectionObserver =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(([entry]) => {
          inView = entry?.isIntersecting ?? false;
          schedule();
        });
  if (intersectionObserver) intersectionObserver.observe(canvas);
  else inView = true;

  const onVisibility = () => schedule();
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    resources = null;
  };
  const onRestored = () => {
    if (disposed) return;
    resources = buildResources(context, preset);
    if (!resources) return;
    lost = false;
    resize();
    schedule();
  };
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  render(STATIC_FRAME_TIME);
  schedule();

  return () => {
    disposed = true;
    if (frame) cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    if (resources) freeResources(context, resources);
    resources = null;
    pendingRelease.set(
      canvas,
      setTimeout(() => {
        pendingRelease.delete(canvas);
        context.getExtension("WEBGL_lose_context")?.loseContext();
      }, 0),
    );
  };
}

/** Decorative animated gradient that fills its positioned parent. Draws nothing without WebGL2. */
export function LiquidGradient({
  className,
  preset = "sideform",
}: {
  className?: string;
  preset?: GradientName;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startGradient(canvas, preset) ?? undefined;
  }, [preset]);
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
