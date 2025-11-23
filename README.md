# Vaporwave Oscilloscope

A retro-futuristic audio visualizer that transforms your music into stunning vaporwave-inspired waveforms. Experience the aesthetic of 90s computer graphics with modern WebGL effects.

## Features

* Real-time audio visualization - Upload any audio file and watch it come to life
* Vaporwave color palette - Pink, cyan, mint, and purple color scheme
* Multiple waveforms - Switch between sine, square, and triangle wave visualizations
* Interactive controls - Adjust frequency, amplitude, and waveform type in real-time
* Particle effects - Dynamic particles that respond to audio peaks
* Export capability - Save your favorite visualizations as PNG images
* Retro-futuristic UI - CRT scanlines, glow effects, and terminal-style interface

## Color Palette

| Color  | HEX       | Usage                      |
| ------ | --------- | -------------------------- |
| Pink   | `#ff71ce` | Primary accents, glows     |
| Cyan   | `#01cdfe` | Text, UI elements          |
| Mint   | `#05ffa1` | Highlights, particles      |
| Purple | `#b967ff` | Borders, secondary accents |

## Quick Start

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. Load an audio file using the "LOAD AUDIO" button
4. Click PLAY to start visualization
5. Adjust controls to customize the visual experience

## Controls

### Audio Controls

* **LOAD AUDIO** - Upload any audio file (MP3, WAV, etc.)
* **PLAY/PAUSE** - Control audio playback
* **EXPORT** - Save current visualization as PNG

### Visualization Controls

* **WAVEFORM** - Switch between sine, square, and triangle waveforms
* **FREQUENCY** - Adjust the number of wave cycles displayed
* **AMPLITUDE** - Control the vertical scale of the waveform

## Project Structure

```
vaporwave-oscilloscope/
│
├── index.html       # Main application interface
├── style.css        # Vaporwave-themed styles
├── src/
│   ├── main.js      # Application entry point
│   ├── visualizer.js# Canvas-based visualization engine
│   └── bloom.js     # WebGL post-processing effects
│
└── README.md        # This file
```

## Technical Details

### Built With

* HTML5 Canvas - 2D waveform rendering
* WebGL - Real-time post-processing effects
* Web Audio API - Audio analysis and processing
* Modern JavaScript (ES6+) - Modular code architecture

### Key Components

#### visualizer.js

* Real-time audio analysis using AnalyserNode
* Waveform generation and rendering
* Particle system management
* Multi-layered glow effects

#### bloom.js

* WebGL shader-based post-processing
* Vaporwave color grading
* CRT-style scanlines and vignette effects
* Real-time intensity adjustments

## How It Works

1. **Audio Analysis**: The Web Audio API analyses frequency and time domain data
2. **Waveform Generation**: Canvas renders the audio data as customizable waveforms
3. **Particle System**: Audio peaks trigger colorful particle emissions
4. **Post-Processing**: WebGL applies vaporwave colors and glow effects
5. **Real-time Updates**: All elements update at 60fps for smooth animation

## Browser Compatibility

* Chrome 80+
* Firefox 75+
* Safari 13+
* Edge 80+

*Note: Requires WebGL and Web Audio API support*

## Customization

### Modifying Colors

Edit the CSS variables in `style.css`:

```css
:root {
    --vaporwave-pink: #ff71ce;
    --vaporwave-cyan: #01cdfe;
    --vaporwave-mint: #05ffa1;
    --vaporwave-purple: #b967ff;
}
```

### Adjusting Visual Effects

Modify parameters in `visualizer.js`:

* `particleThreshold` - Sensitivity for particle generation
* `glowStrength` - Intensity of glow effects
* `lineWidth` - Waveform thickness

### Tips for Best Results

* Use audio files with clear dynamics
* Experiment with different waveform types
* Higher amplitude values work well for electronic music
* Lower frequencies create smoother visuals

### Known Issues

* Mobile browsers may have performance limitations
* Very large audio files may cause initial loading delays
* Export resolution is limited to canvas dimensions

### Future Enhancements

* Audio spectrum analyzer mode
* Custom color palette editor
* Animated background patterns
* MIDI controller support
* Social sharing integration

## Development

### Building from Source

No build process required! This is a pure client-side application.

### Local Development

Serve the files with a local HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server
```

## License

This project is open source and available under the MIT License.

## Credits

Developed by Spectra Studios
Website: [spectrastudios.co.za](https://spectrastudios.co.za)

Special Thanks:

* Web Audio API community
* Vaporwave aesthetic pioneers
* Open source WebGL resources
* "ａｅｓｔｈｅｔｉｃｓ // デジタルレトロ // ビジュアルシンセ"