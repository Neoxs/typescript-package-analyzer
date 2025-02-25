# TypeScript Package Analyzer

A comprehensive tool for analyzing TypeScript packages and providing detailed insights into their structure, dependencies, and build performance.

## Features

✨ **In-depth Analysis**: Get detailed metrics and insights about any TypeScript package.

📊 **Comprehensive Reports**: Generate reports in multiple formats (Markdown, HTML with visualizations, JSON).

🔍 **Package Structure Analysis**: Examine distribution files, TypeScript configuration, and package metadata.

📦 **Dependency Analysis**: Analyze runtime dependencies, dev dependencies, and their sizes.

⏱️ **Build Performance**: Measure build time and track it over time.

📈 **Historical Tracking**: Compare metrics over time with historical data tracking.

🧠 **Intelligent Insights**: Get actionable insights and recommendations for improvements.

## Installation

### Global Installation

```bash
npm install -g typescript-package-analyzer
```

### Local Installation

```bash
npm install typescript-package-analyzer
```

## Usage

### Command Line

```bash
typescript-package-analyzer /path/to/typescript/package
```

Or if installed locally:

```bash
npx typescript-package-analyzer /path/to/typescript/package
```

### Programmatic Usage

```typescript
import { PackageAnalyzer } from "typescript-package-analyzer";

const analyzer = new PackageAnalyzer("/path/to/typescript/package");
analyzer
  .analyze()
  .then(() => console.log("Analysis complete!"))
  .catch(error => console.error("Error:", error));
```

## Output

The analyzer generates reports in the following directory:

```
./package-analysis/[package-name]/
```

The directory contains:

- **Markdown Report**: `[package-name]-analysis.md`
- **HTML Report**: `[package-name]-analysis.html` - includes interactive visualizations
- **JSON Report**: `[package-name]-analysis.json` - structured data for programmatic use
- **Historical Data**: `history/` directory with previous analysis results

## What Gets Analyzed

### Package Information

- Basic metadata (name, version, description, license)
- Entry points (CommonJS, ESM, TypeScript)
- Package scripts

### Version History

- Current version
- Modification times
- Git information (if available)
- NPM version history (if published)

### TypeScript Configuration

- Compiler options
- Module settings
- Declaration settings
- Strict mode configuration

### Distribution Files

- File counts by type (JS, TS declarations, source maps)
- Size analysis
- Module format detection (ESM vs CommonJS)

### Dependencies

- Runtime dependencies
- Development dependencies
- Peer dependencies
- Type definitions
- Tooling identification (build, test, lint)
- Dependency size analysis
- Transitive dependencies

### Build Performance

- Build time measurement
- Historical build time tracking

### Package Size

- Packed size (npm tarball)
- Unpacked size
- Compression ratio
- Largest files

## Development

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/typescript-package-analyzer.git
cd typescript-package-analyzer

# Install dependencies
npm install

# Build the project
npm run build
```

### Scripts

- `npm run build` - Build the project
- `npm start -- /path/to/package` - Run the analyzer
- `npm run clean` - Clean build artifacts
- `npm run lint` - Run code linting
- `npm test` - Run tests (when implemented)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
