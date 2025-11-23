import { Visualizer } from "./visualizer.js";
import { Bloom } from "./bloom.js";

const fileInput = document.getElementById("fileInput");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const exportBtn = document.getElementById("exportBtn");

const waveSelect = document.getElementById("waveSelect");
const freqSlider = document.getElementById("freqSlider");
const ampSlider = document.getElementById("ampSlider");

const glCanvas = document.getElementById("viz");
const offscreen = document.getElementById("viz2d");

const AUDIO_CTX = new (window.AudioContext || window.webkitAudioContext)();
let audioEl = null,
  sourceNode = null,
  analyser = null;
let vis = null,
  bloom = null;

function setupAnalyser() {
  if (analyser) return analyser;
  analyser = AUDIO_CTX.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.75;
  return analyser;
}

function initVisuals() {
  if (!bloom) bloom = new Bloom(glCanvas);
  if (!vis && analyser) vis = new Visualizer(offscreen, analyser);
}

fileInput.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (audioEl) {
    audioEl.pause();
    audioEl.src = "";
    URL.revokeObjectURL(audioEl.src);
    audioEl.remove();
    audioEl = null;
    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch {}
      sourceNode = null;
    }
  }
  const url = URL.createObjectURL(f);
  audioEl = document.createElement("audio");
  audioEl.src = url;
  audioEl.crossOrigin = "anonymous";
  const resume = () => {
    if (AUDIO_CTX.state === "suspended") AUDIO_CTX.resume();
  };
  window.addEventListener("click", resume, { once: true });
  analyser = setupAnalyser();
  sourceNode = AUDIO_CTX.createMediaElementSource(audioEl);
  sourceNode.connect(analyser);
  analyser.connect(AUDIO_CTX.destination);
  initVisuals();
  enableControls();
});

function enableControls() {
  playBtn.disabled = false;
  pauseBtn.disabled = false;
  exportBtn.disabled = false;
}

playBtn.addEventListener("click", async () => {
  if (!audioEl) return;
  if (AUDIO_CTX.state === "suspended") await AUDIO_CTX.resume();
  try {
    await audioEl.play();
  } catch (e) {
    console.warn("Playback prevented", e);
  }
});
pauseBtn.addEventListener("click", () => {
  if (audioEl) audioEl.pause();
});
exportBtn.addEventListener("click", () => {
  if (bloom) {
    const data = bloom.exportPNG();
    const a = document.createElement("a");
    a.href = data;
    a.download = "retro_oscilloscope.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
});

function loop() {
  if (vis && bloom) {
    vis.drawFrame(
      waveSelect.value,
      parseFloat(freqSlider.value),
      parseFloat(ampSlider.value)
    );
    const tmp = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(tmp);
    let s = 0;
    for (let i = 0; i < tmp.length; i++) {
      const v = (tmp[i] - 128) / 128;
      s += v * v;
    }
    const rms = Math.sqrt(s / tmp.length);
    bloom.renderFrom2DCanvas(offscreen, 1 + rms * 0.5);
  }
  requestAnimationFrame(loop);
}

loop();
