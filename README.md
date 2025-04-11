# XIMacro

An offline macro editor for Final Fantasy XI (FFXI) built with Electron and React.

Website: [https://xim.1337707.xyz](https://xim.1337707.xyz)

## Features

-   🎮 Offline macro editing for Final Fantasy XI
-   🚀 Built with modern technologies (Electron, React, TypeScript)
-   🎨 Beautiful UI with Tailwind CSS
-   🔧 Native performance with C/C++ components

## Installation

> **Note**: An executable installer will be available soon for easy installation on Windows.

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ximacro.git
cd ximacro
```

2. Install dependencies:

```bash
pnpm install
```

3. Build native components:

```bash
pnpm run build:binaries
```

## Development

To start the development server:

```bash
pnpm start
```

This will run both the Tailwind CSS compiler in watch mode and start the Electron application.

## Building

To create a production build:

```bash
# Package the application
pnpm run package

# Create distributable
pnpm run make
```

## Scripts

-   `pnpm start` - Start the development server
-   `pnpm run package` - Package the application
-   `pnpm run make` - Create distributable
-   `pnpm run lint` - Run ESLint
-   `pnpm run build:binaries` - Build native components
-   `pnpm run build:binaries:clean` - Clean and rebuild native components

## Versioning

XIMacro follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (MAJOR.MINOR.PATCH):

-   **MAJOR** version (first digit):

    -   Incompatible API changes
    -   Breaking changes requiring user code modifications
    -   Example: Changing macro file format or keyboard input handling

-   **MINOR** version (second digit):

    -   New functionality in a backward-compatible manner
    -   New features that don't break existing functionality
    -   Example: Adding new macro types or export formats

-   **PATCH** version (third digit):
    -   Backward-compatible bug fixes
    -   Fixes that don't add new features
    -   Example: Fixing crashes or UI layout issues

When a higher digit is incremented, all lower digits reset to 0 (e.g., 0.1.0 → 0.2.0).

## TODO

-   [ ] Create Windows installer (.exe)
-   [ ] Add auto-update functionality
-   [ ] Create installation documentation
-   [ ] Add user guide

## License

MIT License - see LICENSE file for details

## Author

Jay Simons ([@designly](https://1337707.xyz))

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
