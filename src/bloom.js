export class Bloom {
  constructor(glCanvas) {
    this.canvas = glCanvas;
    this.gl =
      glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl");
    if (!this.gl) throw new Error("WebGL not supported");
    this._init();
  }

  _createShader(type, src) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error("Could not compile shader: " + info);
    }
    return s;
  }

  _init() {
    const gl = this.gl;
    const vsSrc = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSrc = `
      precision mediump float;
      uniform sampler2D u_tex;
      uniform float u_intensity;
      uniform vec2 u_resolution;
      varying vec2 v_uv;
      
      void main() {
        vec4 texColor = texture2D(u_tex, v_uv);
        
        // Vaporwave color processing
        float lum = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));
        
        // Create vaporwave color gradient based on luminance
        vec3 vaporColor;
        if (lum < 0.3) {
          vaporColor = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 0.443, 0.808), lum * 3.0);
        } else if (lum < 0.6) {
          vaporColor = mix(vec3(1.0, 0.443, 0.808), vec3(0.004, 0.804, 0.996), (lum - 0.3) * 3.0);
        } else {
          vaporColor = mix(vec3(0.004, 0.804, 0.996), vec3(0.725, 0.404, 1.0), (lum - 0.6) * 2.5);
        }
        
        // Add subtle scanlines
        float scanline = sin(v_uv.y * u_resolution.y * 3.14159) * 0.1 + 0.9;
        vaporColor *= scanline;
        
        // Vignette effect
        vec2 pos = v_uv - 0.5;
        float vign = 1.0 - dot(pos, pos) * 0.5;
        
        // Intensity-based brightness with vaporwave intensity
        vaporColor *= (0.8 + u_intensity * 0.6);
        
        gl_FragColor = vec4(vaporColor * vign, 1.0);
      }
    `;

    const vs = this._createShader(gl.VERTEX_SHADER, vsSrc);
    const fs = this._createShader(gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      throw new Error(
        "Failed to link WebGL program: " + gl.getProgramInfoLog(prog)
      );
    this.program = prog;
    gl.useProgram(this.program);

    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const a_pos = gl.getAttribLocation(this.program, "a_pos");
    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.u_tex = gl.getUniformLocation(this.program, "u_tex");
    this.u_intensity = gl.getUniformLocation(this.program, "u_intensity");
    this.u_resolution = gl.getUniformLocation(this.program, "u_resolution");
    gl.uniform1i(this.u_tex, 0);
  }

  renderFrom2DCanvas(canvas2d, intensity = 1.0) {
    const gl = this.gl;
    const w = this.canvas.width,
      h = this.canvas.height;
    gl.viewport(0, 0, w, h);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      canvas2d
    );
    gl.useProgram(this.program);
    gl.uniform1f(this.u_intensity, intensity);
    gl.uniform2f(this.u_resolution, w, h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  exportPNG() {
    return this.canvas.toDataURL("image/png");
  }
}