import path from "path";
import fs from "fs";
import { AnalysisData, AnalyzerConfig } from "../core/types";
import { generateInsights } from "../utils/insights-utils";
import { formatBytes, formatTime } from "../utils/format-utils";

/**
 * Generates a Markdown report from the analysis data
 */
export function generateMarkdownReport(
  analysisData: AnalysisData,
  config: AnalyzerConfig
): void {
  console.log("\n📝 Generating Markdown report...");

  const {
    packageInfo,
    versionInfo,
    tsConfigInfo,
    buildTimeInfo,
    distInfo,
    dependencyInfo,
    dependencySizeInfo,
    packageSizeInfo,
  } = analysisData;

  // Calculate insights and recommendations
  const insights = generateInsights(analysisData);

  // Build the report text
  let reportText = `
# TypeScript Package Analysis: ${config.packageName}
Generated on: ${new Date().toLocaleString()}

## 📦 Package Summary
${
  packageInfo?.exists
    ? `
- **Name**: ${packageInfo.name || config.packageName}
- **Version**: ${packageInfo.version || "N/A"}
- **Description**: ${packageInfo.description || "N/A"}
- **License**: ${packageInfo.license || "N/A"}
`
    : "- Package.json not found"
}

## 📅 Version & Modification Information
${
  versionInfo?.exists
    ? `
- **Current Version**: ${versionInfo.currentVersion || "N/A"}
- **Package.json Last Modified**: ${
        versionInfo.packageJsonModified
          ? versionInfo.packageJsonModified.toLocaleString()
          : "N/A"
      }
${
  versionInfo.newestFile && versionInfo.newestFile.path
    ? `- **Newest File**: ${versionInfo.newestFile.path} (${
        versionInfo.newestFile.mtime
          ? versionInfo.newestFile.mtime.toLocaleString()
          : "N/A"
      })`
    : "- **Newest File**: N/A"
}
${
  versionInfo.oldestFile && versionInfo.oldestFile.path
    ? `- **Oldest File**: ${versionInfo.oldestFile.path} (${
        versionInfo.oldestFile.mtime
          ? versionInfo.oldestFile.mtime.toLocaleString()
          : "N/A"
      })`
    : "- **Oldest File**: N/A"
}

${
  versionInfo.gitInfo?.exists
    ? `
### Git Information
- **Last Commit**: ${versionInfo.gitInfo.lastCommitDate || "N/A"}
- **Current Branch**: ${versionInfo.gitInfo.currentBranch || "N/A"}
- **Commit Count**: ${versionInfo.gitInfo.commitCount || "N/A"}
- **Contributors**: ${versionInfo.gitInfo.contributorsCount || "N/A"}
- **Tags**: ${versionInfo.gitInfo.tagCount || "0"} (${
        (versionInfo.gitInfo.tags || []).join(", ") || "N/A"
      })
`
    : ""
}

${
  versionInfo.npmHistory?.exists
    ? `
### NPM Version History
- **Initially Published**: ${
        versionInfo.npmHistory.created
          ? new Date(versionInfo.npmHistory.created).toLocaleString()
          : "N/A"
      }
- **Last Published**: ${
        versionInfo.npmHistory.modified
          ? new Date(versionInfo.npmHistory.modified).toLocaleString()
          : "N/A"
      }
- **Version Count**: ${versionInfo.npmHistory.versionCount || "0"}
- **Recent Versions**: 
${
  (versionInfo.npmHistory.versions || [])
    .slice(0, 5)
    .map(
      v =>
        `  - ${v.version || "unknown"}: ${
          v.date ? new Date(v.date).toLocaleString() : "N/A"
        }`
    )
    .join("\n") || "  - No version history available"
}
`
    : ""
}
`
    : "- Version history information not available"
}

## 🔧 Build Information
${
  buildTimeInfo?.success
    ? `
- **Build Time**: ${buildTimeInfo.buildTimeFormatted || "N/A"}
- **Build Script**: ${
        packageInfo?.exists && packageInfo.hasBuildScript
          ? "Present"
          : "Not found"
      }
`
    : `- **Build Failed**: ${buildTimeInfo?.error || "Unknown error"}`
}

## 📊 Distribution Files
${
  distInfo?.exists
    ? `
- **Distribution Directory**: ${path.basename(distInfo.path || "") || "N/A"}
- **Total Files**: ${distInfo.fileStats?.totalFiles || 0}
- **Total Size**: ${formatBytes(distInfo.sizeStats?.totalSize || 0)}

### File Breakdown
- JavaScript Files: ${distInfo.fileStats?.jsFiles || 0} (${formatBytes(
        distInfo.sizeStats?.jsSize || 0
      )})
- TypeScript Declaration Files: ${
        distInfo.fileStats?.dtsFiles || 0
      } (${formatBytes(distInfo.sizeStats?.dtsSize || 0)})
- Source Map Files: ${distInfo.fileStats?.mapFiles || 0} (${formatBytes(
        distInfo.sizeStats?.mapSize || 0
      )})
- Declaration Map Files: ${distInfo.fileStats?.dtsMapFiles || 0} (${formatBytes(
        distInfo.sizeStats?.dtsMapSize || 0
      )})
- Other Files: ${distInfo.fileStats?.otherFiles || 0} (${formatBytes(
        distInfo.sizeStats?.otherSize || 0
      )})

### Module Information
- ESM Modules: ${distInfo.moduleInfo?.esmModules || 0}
- CommonJS Modules: ${distInfo.moduleInfo?.cjsModules || 0}
- Source Map References: ${distInfo.moduleInfo?.sourceMapReferences || 0}
`
    : "- Distribution directory not found"
}

## ⚙️ TypeScript Configuration
${
  tsConfigInfo?.exists
    ? `
- **Target**: ${tsConfigInfo.target || "Not specified"}
- **Module**: ${tsConfigInfo.module || "Not specified"}
- **Declaration**: ${tsConfigInfo.declaration === true ? "Yes" : "No"}
- **Declaration Maps**: ${tsConfigInfo.declarationMap === true ? "Yes" : "No"}
- **Source Maps**: ${tsConfigInfo.sourceMap === true ? "Yes" : "No"}
- **Strict Mode**: ${tsConfigInfo.strict === true ? "Yes" : "No"}
- **JSX Support**: ${tsConfigInfo.jsx ? "Yes" : "No"}
- **Paths Mappings**: ${
        typeof tsConfigInfo.paths === "number" ? tsConfigInfo.paths : "None"
      }
- **References**: ${
        typeof tsConfigInfo.references === "number"
          ? tsConfigInfo.references
          : "None"
      }
- **Incremental Builds**: ${tsConfigInfo.incremental === true ? "Yes" : "No"}
`
    : "- TypeScript configuration not found"
}

## 📚 Dependencies
${
  dependencyInfo?.exists
    ? `
- **Runtime Dependencies**: ${
        dependencyInfo.dependencyCounts?.dependencies || 0
      }
- **Development Dependencies**: ${
        dependencyInfo.dependencyCounts?.devDependencies || 0
      }
- **Peer Dependencies**: ${
        dependencyInfo.dependencyCounts?.peerDependencies || 0
      }
- **Type Definitions**: ${dependencyInfo.dependencyCounts?.typeDefinitions || 0}

### Tooling
- **Build Tools**: ${
        (dependencyInfo.tooling?.buildTools || []).join(", ") || "None detected"
      }
- **Testing Tools**: ${
        (dependencyInfo.tooling?.testingTools || []).join(", ") ||
        "None detected"
      }
- **Linting Tools**: ${
        (dependencyInfo.tooling?.lintingTools || []).join(", ") ||
        "None detected"
      }
`
    : "- Dependency information not available"
}

## 📦 Dependency Size Analysis
${
  dependencySizeInfo?.exists
    ? `
- **Total node_modules Size**: ${formatBytes(dependencySizeInfo.totalSize || 0)}
- **Direct Dependencies**: ${
        dependencySizeInfo.packageJsonDependenciesCount || 0
      }
- **Transitive Dependencies**: ${
        dependencySizeInfo.transitiveDependenciesCount || 0
      }
- **Total Installed Dependencies**: ${
        dependencySizeInfo.allDependenciesCount || 0
      }

### Largest Dependencies:
${
  (dependencySizeInfo.dependencySizes || [])
    .slice(0, 10)
    .map(
      dep =>
        `- ${dep.name || "Unknown"} (${
          dep.version || "Unknown"
        }): ${formatBytes(dep.size || 0)}`
    )
    .join("\n") || "- No dependency size information available"
}
`
    : "- Dependency size analysis failed or was skipped"
}

## 📦 Package Size Analysis
${
  packageSizeInfo?.success
    ? `
- **Packed Size (npm tarball)**: ${formatBytes(packageSizeInfo.packedSize || 0)}
- **Unpacked Size**: ${formatBytes(packageSizeInfo.unpackedSize || 0)}
- **Compression Ratio**: ${(
        (packageSizeInfo.compressionRatio || 0) * 100
      ).toFixed(1)}%
- **Tarball Location**: ${packageSizeInfo.tarballPath || "N/A"}

### Largest Files in Package:
${
  (packageSizeInfo.largestFiles || [])
    .map(file => `- ${file.path || "Unknown"}: ${formatBytes(file.size || 0)}`)
    .join("\n") || "- No file size information available"
}
`
    : "- Package size analysis failed or was skipped"
}

## 📊 Performance Metrics
- Total Distribution Size: ${
    distInfo?.exists ? formatBytes(distInfo.sizeStats?.totalSize || 0) : "N/A"
  }
- Type Definitions Size: ${
    distInfo?.exists ? formatBytes(distInfo.sizeStats?.dtsSize || 0) : "N/A"
  }
- Source Maps Size: ${
    distInfo?.exists
      ? formatBytes(
          (distInfo.sizeStats?.mapSize || 0) +
            (distInfo.sizeStats?.dtsMapSize || 0)
        )
      : "N/A"
  }
- JavaScript to TypeScript Ratio: ${
    distInfo?.exists &&
    (distInfo.fileStats?.dtsFiles || 0) > 0 &&
    (distInfo.sizeStats?.dtsSize || 0) > 0
      ? (
          (distInfo.sizeStats?.jsSize || 0) / (distInfo.sizeStats?.dtsSize || 1)
        ).toFixed(2) + ":1"
      : "N/A"
  }
- Build Time: ${
    buildTimeInfo?.success ? buildTimeInfo.buildTimeFormatted || "N/A" : "N/A"
  }

## 💡 Insights and Recommendations
${(insights || []).join("\n") || "No insights available."}
`;

  // Save the report
  const reportPath = path.join(
    config.outputDir,
    `${config.packageName}-analysis.md`
  );
  fs.writeFileSync(reportPath, reportText);

  console.log(`📝 Markdown report saved to: ${reportPath}`);
}
