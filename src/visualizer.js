export class Visualizer {
  constructor(offscreenCanvas, analyserNode, options = {}) {
    this.canvas = offscreenCanvas;
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.analyser = analyserNode;

    this.options = Object.assign(
      {
        bgColor: "rgba(0,0,0,1)",
        lineWidth: 2,
        particleThreshold: 0.14,
        particleCap: 120,
        wavelengthBarHeight: 60,
        startupFlickerFrames: 45,
      },
      options
    );

    this.fftSize = this.analyser.fftSize || 2048;
    this.timeData = new Uint8Array(this.fftSize);
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

    this.particles = [];
    this._lastPeakTime = 0;
    this.time = 0;
    this.flickerFrames = this.options.startupFlickerFrames;
    this._hasAudio = false;

    // Vaporwave color palette
    this.colors = {
      pink: "#ff71ce",
      cyan: "#01cdfe",
      mint: "#05ffa1",
      purple: "#b967ff",
    };
  }

  drawFrame(waveform = "sine", frequency = 5, amplitude = 0.8) {
    const ctx = this.ctx;
    const w = this.width,
      h = this.height;

    // Solid black background
    ctx.fillStyle = this.options.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Vaporwave gradient background
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
    gradient.addColorStop(0, "rgba(255, 113, 206, 0.05)");
    gradient.addColorStop(0.5, "rgba(1, 205, 254, 0.03)");
    gradient.addColorStop(1, "rgba(185, 103, 255, 0.02)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Startup flicker
    if (this.flickerFrames > 0) {
      const flick = Math.random() * 0.3;
      ctx.fillStyle = `rgba(0,0,0,${flick})`;
      ctx.fillRect(0, 0, w, h);
      this.flickerFrames--;
    }

    // Scanlines with vaporwave colors
    ctx.strokeStyle = "rgba(255, 113, 206, 0.1)";
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Check if we have real audio data or should use generated waveform
    this.analyser.getByteTimeDomainData(this.timeData);
    let useRealAudio = false;

    // Check if audio has meaningful signal (not silence)
    let sum = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const val = (this.timeData[i] - 128) / 128;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / this.timeData.length);
    useRealAudio = rms > 0.02;

    // FFT for wavelength bars with vaporwave colors
    if (useRealAudio) {
      this.analyser.getByteFrequencyData(this.freqData);
      const barHeight = this.options.wavelengthBarHeight;
      const binStep = Math.floor(this.freqData.length / w);
      for (let x = 0; x < w; x++) {
        const idx = Math.min(this.freqData.length - 1, Math.floor(x * binStep));
        const val = this.freqData[idx] / 255;

        // Cycle through vaporwave colors based on frequency
        const colorIndex = Math.floor(x / (w / 4)) % 4;
        const colors = [
          this.colors.pink,
          this.colors.cyan,
          this.colors.mint,
          this.colors.purple,
        ];
        ctx.fillStyle = colors[colorIndex];
        ctx.globalAlpha = 0.7 + val * 0.3;
        ctx.fillRect(x, 0, 1, barHeight * val);
        ctx.globalAlpha = 1.0;
      }
    }

    // Generate or use waveform points
    const marginX = 2,
      usableW = w - 4;
    const centerY =
      (h - this.options.wavelengthBarHeight) / 2 +
      this.options.wavelengthBarHeight;
    const points = [];

    if (useRealAudio) {
      // Use real audio data with amplitude scaling
      const step = Math.max(1, Math.floor(this.timeData.length / usableW));
      for (let i = 0; i < usableW; i++) {
        const idx = Math.min(this.timeData.length - 1, Math.floor(i * step));
        const v = (this.timeData[idx] - 128) / 128;
        let y =
          centerY +
          v * ((h - this.options.wavelengthBarHeight) * 0.45 * amplitude);
        y += (Math.random() - 0.5) * 0.8;
        points.push({ x: marginX + i, y });
      }
    } else {
      // Generate synthetic waveform based on controls
      for (let i = 0; i < usableW; i++) {
        const x = (i / usableW) * Math.PI * 2 * frequency;
        let v = 0;

        switch (waveform) {
          case "sine":
            v = Math.sin(x);
            break;
          case "square":
            v = Math.sin(x) > 0 ? 1 : -1;
            break;
          case "triangle":
            v =
              2 *
                Math.abs(
                  2 * (x / (2 * Math.PI) - Math.floor(x / (2 * Math.PI) + 0.5))
                ) -
              1;
            break;
          default:
            v = Math.sin(x);
        }

        let y =
          centerY +
          v * ((h - this.options.wavelengthBarHeight) * 0.45 * amplitude);
        y += (Math.random() - 0.5) * 0.8;
        points.push({ x: marginX + i, y });
      }
    }

    // Draw waveform with vaporwave colors
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.colors.pink;
    ctx.strokeStyle = this.colors.cyan;
    ctx.lineWidth = this.options.lineWidth;
    ctx.beginPath();

    points.forEach((p, i) => {
      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2,
          cy = (prev.y + p.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
      }
    });
    ctx.stroke();

    // Add a second glow layer with different color
    ctx.shadowBlur = 25;
    ctx.shadowColor = this.colors.purple;
    ctx.stroke();
    ctx.restore();

    // Add subtle horizontal grid lines with vaporwave colors
    ctx.strokeStyle = "rgba(5, 255, 161, 0.15)";
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 1; i < gridLines; i++) {
      const y = (h / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Particles with vaporwave colors
    let particleRms;
    if (useRealAudio) {
      particleRms = rms;
    } else {
      // For generated waveforms, create artificial peaks based on waveform
      const artificialPeak = 0.3 + Math.abs(Math.sin(this.time * 2)) * 0.4;
      particleRms = artificialPeak * amplitude;
    }

    const now = performance.now();
    if (
      particleRms > this.options.particleThreshold &&
      now - this._lastPeakTime > 100
    ) {
      const particleCount = Math.min(2 + Math.floor(particleRms * 40), 15);
      this._spawnParticles(particleCount);
      this._lastPeakTime = now;
    }
    this._updateParticles();
    this._drawParticles();

    this.time += 0.02;
  }

  _spawnParticles(count) {
    const w = this.width,
      h = this.height;
    for (let i = 0; i < count; i++) {
      if (this.particles.length > this.options.particleCap) break;
      const px = w * 0.1 + Math.random() * w * 0.8;
      const py = h * 0.4 + Math.random() * h * 0.4;
      const vx = (Math.random() - 0.5) * 1.5,
        vy = -0.5 - Math.random() * 1;
      const life = 200 + Math.random() * 300,
        size = 1 + Math.random() * 3;

      // Random vaporwave color for particles
      const colors = [
        this.colors.pink,
        this.colors.cyan,
        this.colors.mint,
        this.colors.purple,
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x: px,
        y: py,
        vx,
        vy,
        life,
        age: 0,
        size,
        color,
      });
    }
  }

  _updateParticles() {
    const dt = 16;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.995;
      if (p.age > p.life) this.particles.splice(i, 1);
    }
  }

  _drawParticles() {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    this.particles.forEach((p) => {
      const t = 1 - p.age / p.life;
      const alpha = Math.max(0, Math.min(1, t));
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(p.x, p.y, p.size, p.size);

      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.restore();
  }

  setAudioState(hasAudio) {
    this._hasAudio = hasAudio;
  }
}