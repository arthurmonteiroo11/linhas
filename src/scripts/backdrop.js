const MAX_DPR = 1.5;
const CELL_CSS_PX = 11;
const COLOR_LERP = 0.04;
const INK = '#16171a';
const PAPER = '#efebe3';

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_scroll;
uniform float u_cell;
uniform vec3 u_paper;
uniform vec3 u_color;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  const float angle = 0.2618;
  mat2 screen = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 grid = screen * gl_FragCoord.xy / u_cell;
  vec2 id = floor(grid);
  vec2 local = fract(grid) - 0.5;

  float field = fbm(id * 0.055 + vec2(u_time * 0.015, u_scroll * 1.6));
  float radius = smoothstep(0.48, 0.82, field) * 0.42;
  float edge = 1.2 / u_cell;
  float dot = 1.0 - smoothstep(radius - edge, radius + edge, length(local));

  gl_FragColor = vec4(mix(u_paper, u_color, dot * 0.38), 1.0);
}
`;

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
};

const createProgram = (gl) => {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
};

const createFullscreenTriangle = (gl, program) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
};

const scrollProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
};

const currentLineColor = () => document.documentElement.dataset.lineColor || INK;

export const initBackdrop = ({ animate = true } = {}) => {
  const canvas = document.createElement('canvas');
  canvas.className = 'backdrop';
  canvas.setAttribute('aria-hidden', 'true');

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;

  let program;
  try {
    program = createProgram(gl);
  } catch {
    return;
  }

  gl.useProgram(program);
  createFullscreenTriangle(gl, program);
  document.body.prepend(canvas);

  const uniform = (name) => gl.getUniformLocation(program, name);
  const u = {
    res: uniform('u_res'),
    time: uniform('u_time'),
    scroll: uniform('u_scroll'),
    cell: uniform('u_cell'),
    paper: uniform('u_paper'),
    color: uniform('u_color'),
  };

  gl.uniform3fv(u.paper, hexToRgb(PAPER));

  const color = hexToRgb(currentLineColor());
  let target = color.slice();
  let frame = 0;
  let visible = true;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.cell, CELL_CSS_PX * dpr);
  };

  const draw = (time) => {
    for (let i = 0; i < 3; i++) color[i] += (target[i] - color[i]) * COLOR_LERP;
    gl.uniform3fv(u.color, color);
    gl.uniform1f(u.time, time / 1000);
    gl.uniform1f(u.scroll, scrollProgress());
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (time) => {
    frame = visible ? requestAnimationFrame(loop) : 0;
    draw(time);
  };

  const start = () => {
    if (animate && !frame) frame = requestAnimationFrame(loop);
  };

  resize();
  draw(0);
  start();

  window.addEventListener('resize', () => {
    resize();
    if (!animate) draw(0);
  });

  window.addEventListener('linhas:linha', (event) => {
    target = hexToRgb(event.detail.color || INK);
    if (!animate) {
      color.splice(0, 3, ...target);
      draw(0);
    }
  });

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) start();
  });

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    canvas.remove();
  });
};