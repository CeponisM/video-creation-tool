# Audio-Visual Editor

A professional-grade web-based audio-visual editing application built with React, Redux, and Three.js. This application provides a comprehensive suite of tools for creating, editing, and exporting multimedia compositions with advanced timeline management, effects processing, and 3D rendering capabilities.

## 🚀 Features

### Core Functionality
- **Multi-layer Timeline**: Professional timeline interface with layer management, keyframe editing, and playback controls
- **3D Composition Viewer**: Real-time 3D preview using Three.js with orthographic camera and grid helpers
- **Asset Management**: Import and organize images, videos, and audio files
- **Effects Pipeline**: Built-in shader effects including blur, color correction, glow, and chromatic aberration
- **Property Animation**: Keyframe-based animation system for position, scale, rotation, and opacity
- **Export System**: Multiple export formats and quality settings

### Advanced Features
- **Expression Engine**: Custom expression evaluator for complex animations
- **Mask Editor**: Vector-based masking system for layer compositing
- **Time Remapping**: Advanced time manipulation and speed control
- **Work Area Management**: Define specific sections for focused editing
- **Shy Layer System**: Hide/show layers for better timeline organization
- **Solo/Lock System**: Isolate and protect layers during editing

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **3D Graphics**: Three.js r154
- **Styling**: SCSS with modular architecture
- **Build Tool**: Create React App with custom webpack configuration
- **Animation**: Custom keyframe interpolation system
- **File Processing**: FileReader API with drag-and-drop support

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── common/          # Reusable UI components
│   ├── layout/          # Main layout components
│   ├── panels/          # Editor panels and tools
│   └── viewer/          # 3D composition viewer
├── hooks/               # Custom React hooks
├── store/               # Redux store configuration
│   └── slices/          # Redux slices for state management
├── styles/              # SCSS stylesheets
├── utils/               # Utility functions and helpers
├── shaders/             # GLSL shaders and effects
└── workers/             # Web workers for background processing
```

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager
- Modern web browser with WebGL support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd video-creation-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to access the application

### Build for Production

```bash
npm run build
```

The optimized build will be created in the `build/` directory.

## 🎯 Core Components

### Timeline (`Timeline.tsx`)
The heart of the editing interface, providing:
- Layer-based editing with drag-and-drop reordering
- Keyframe visualization and editing
- Playback controls and scrubbing
- Work area and in/out point management
- Keyboard shortcuts for efficient editing

**Key Features:**
- Frame-accurate timeline scrubbing
- Multi-layer composition support
- Keyframe interpolation with custom easing
- Real-time preview synchronization

### Composition Viewer (`CompositionViewer.tsx`)
3D rendering engine for real-time preview:
- Three.js-based orthographic rendering
- Grid-based workspace with pan/zoom controls
- Layer transformation preview
- Real-time effect processing

**Rendering Pipeline:**
1. Scene initialization with orthographic camera
2. Layer object creation and transformation
3. Effect shader application
4. Real-time rendering with RAF loop

### Sidebar (`Sidebar.tsx`)
Asset and tool management interface:
- Project asset browser with thumbnails
- Drag-and-drop asset import
- Effects library with preview
- Preset management system

### Workspace (`Workspace.tsx`)
Main application layout orchestrating:
- Multi-panel interface with tabbed navigation
- Property editor for selected layers
- Effects panel for post-processing
- Export panel for rendering final output

## 🎨 Effects System

The application includes a comprehensive shader-based effects system:

### Available Effects

1. **Blur Effect**
   - Gaussian blur with adjustable radius
   - Optimized fragment shader implementation
   - Real-time parameter adjustment

2. **Color Correction**
   - Brightness, contrast, and saturation controls
   - HSV color space manipulation
   - Non-destructive adjustment layers

3. **Glow Effect**
   - Luminance-based glow generation
   - Threshold and intensity controls
   - Multi-pass rendering for quality

4. **Chromatic Aberration**
   - RGB channel separation effect
   - Adjustable offset parameters
   - Vintage film emulation

### Custom Shader Development

Effects are implemented using custom GLSL shaders in `effectShaders.ts`:

```typescript
export const CustomShader = {
  uniforms: {
    tDiffuse: { value: null },
    customParam: { value: 1.0 }
  },
  vertexShader: `...`,
  fragmentShader: `...`
};
```

## 🔧 State Management

The application uses Redux Toolkit with the following slices:

- **timelineSlice**: Timeline state, layers, and keyframes
- **projectSlice**: Project assets and metadata
- **effectsSlice**: Effect parameters and presets
- **uiSlice**: Interface state and user preferences
- **audioSlice**: Audio track management
- **mediaSlice**: Media asset handling

### Example State Structure

```typescript
interface RootState {
  timeline: {
    compositions: Composition[];
    currentTime: number;
    playbackState: 'playing' | 'paused' | 'stopped';
    zoom: number;
    layers: Layer[];
  };
  project: {
    assets: Asset[];
    metadata: ProjectMetadata;
  };
  // ... other slices
}
```

## 🎹 Keyboard Shortcuts

- **Space**: Play/Pause playback
- **Left/Right Arrow**: Frame-by-frame navigation
- **I**: Set in-point
- **O**: Set out-point
- **Home**: Go to beginning
- **End**: Go to end
- **Delete**: Delete selected layer/keyframe
- **Ctrl+D**: Duplicate selected layer
- **Ctrl+Z**: Undo last action
- **Ctrl+Y**: Redo last action

## 🔄 Animation System

### Keyframe Management
The animation system supports:
- Bezier curve interpolation
- Linear, ease-in, ease-out, and custom easing
- Multi-dimensional property animation
- Expression-based procedural animation

### Transform Properties
Each layer supports the following animatable properties:
- **Position**: X, Y, Z coordinates
- **Scale**: Width, height, depth scaling
- **Rotation**: Euler angle rotation
- **Opacity**: Alpha transparency
- **Anchor Point**: Transform origin

### Expression Engine
Advanced users can create procedural animations using expressions:

```javascript
// Example: Bouncing ball animation
y = bounce(time, amplitude, frequency)
x = wiggle(time, 2, 1) * 50
```

## 📤 Export System

The export system supports multiple output formats:

### Video Formats
- **MP4**: H.264 encoding with quality presets
- **WebM**: VP9 encoding for web optimization
- **MOV**: ProRes encoding for professional workflows

### Image Sequences
- **PNG**: Lossless with alpha channel support
- **JPEG**: Compressed sequences for smaller files
- **EXR**: HDR sequences for post-production

### Audio Formats
- **WAV**: Uncompressed audio
- **MP3**: Compressed audio with bitrate options
- **AAC**: High-quality compressed audio

## 🎭 Masking System

Advanced vector-based masking for complex compositions:

### Mask Types
- **Rectangle**: Basic rectangular masks
- **Ellipse**: Circular and oval masks
- **Pen Tool**: Custom bezier path masks
- **Text**: Typography-based masks

### Mask Properties
- **Feather**: Edge softening
- **Expansion**: Mask size adjustment
- **Opacity**: Mask transparency
- **Invert**: Reverse mask effect

## 🧩 Extensibility

### Custom Effects
Add new effects by implementing the shader interface:

```typescript
// Register new effect
export const MyCustomEffect = {
  uniforms: { /* ... */ },
  vertexShader: `/* GLSL code */`,
  fragmentShader: `/* GLSL code */`
};
```

### Plugin Architecture
The modular design allows for easy extension:
- Custom layer types
- Additional export formats
- Third-party effect integrations
- External asset connectors

## 🐛 Troubleshooting

### Common Issues

1. **Performance Issues**
   - Reduce timeline zoom level
   - Lower preview quality
   - Close unused effects panels

2. **Import Failures**
   - Check file format compatibility
   - Verify file size limits
   - Ensure browser codec support

3. **Rendering Problems**
   - Update graphics drivers
   - Check WebGL browser support
   - Clear browser cache

### Browser Compatibility
- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Partial support (some WebGL limitations)
- **Edge**: Full support

## 📊 Performance Optimization

### Best Practices
- Use appropriate composition sizes
- Optimize asset resolutions
- Enable layer caching when possible
- Minimize concurrent effects processing

### Memory Management
- Regular garbage collection cycles
- Texture disposal for unused assets
- Frame cache optimization
- Worker thread utilization

## 🤝 Contributing

### Development Setup
1. Follow installation instructions
2. Create feature branch from `main`
3. Implement changes with tests
4. Submit pull request with description

### Code Style
- TypeScript strict mode enabled
- ESLint configuration provided
- Prettier for code formatting
- Component-based architecture

### Testing
```bash
npm test
```

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🆘 Support

For technical support and feature requests:
- GitHub Issues for bug reports
- Discussions for feature requests
- Wiki for detailed documentation

## 🚀 Roadmap

### Upcoming Features
- [ ] Real-time collaboration
- [ ] Cloud asset storage
- [ ] Advanced color grading
- [ ] Motion tracking
- [ ] 3D text and shapes
- [ ] Audio visualization
- [ ] Plugin marketplace

### Version History
- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Enhanced effects pipeline
- **v1.2.0**: Improved timeline performance
- **v2.0.0**: 3D rendering engine (current)

---

**Built with ❤️ using React, Redux, and Three.js**