import { AnalysisData } from "../core/types";

/**
 * Generate insights and recommendations based on the analysis data
 */
export function generateInsights(analysisData: AnalysisData): string[] {
  const insights: string[] = [];
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

  // Package structure insights
  if (packageInfo.exists) {
    if (
      !packageInfo.hasTypes &&
      distInfo.exists &&
      distInfo.fileStats?.dtsFiles &&
      distInfo.fileStats.dtsFiles > 0
    ) {
      insights.push(
        "- Add 'types' or 'typings' field in package.json to help TypeScript users find your type definitions."
      );
    }

    if (!packageInfo.hasBuildScript) {
      insights.push(
        "- Consider adding a 'build' script in package.json for easier builds."
      );
    }

    if (!packageInfo.hasTestScript) {
      insights.push(
        "- No test script detected. Consider adding tests for better code quality."
      );
    }

    if (packageInfo.hasESM && packageInfo.hasCJS) {
      insights.push(
        "- Package provides both ESM and CommonJS entry points, which is excellent for compatibility."
      );
    } else if (!packageInfo.hasESM && packageInfo.hasCJS) {
      insights.push(
        "- Consider adding an ESM entry point (via 'module' field) for modern bundlers and environments."
      );
    }

    if (!packageInfo.exports && (packageInfo.hasESM || packageInfo.hasCJS)) {
      insights.push(
        "- Consider adding 'exports' field in package.json for better control over entry points in modern Node.js."
      );
    }
  }

  // TypeScript configuration insights
  if (tsConfigInfo.exists) {
    if (tsConfigInfo.target && tsConfigInfo.target.toLowerCase() === "es5") {
      insights.push(
        "- Consider targeting a more modern JavaScript version like ES2018 or higher for better performance and smaller bundles."
      );
    }

    if (!tsConfigInfo.strict) {
      insights.push(
        "- Enable 'strict' mode in TypeScript for stronger type-checking and better type safety."
      );
    }

    if (!tsConfigInfo.declarationMap && tsConfigInfo.declaration) {
      insights.push(
        "- Consider enabling 'declarationMap' to improve developer experience when using your library."
      );
    }

    if (!tsConfigInfo.esModuleInterop) {
      insights.push(
        "- Enable 'esModuleInterop' for better interoperability with CommonJS modules."
      );
    }
  }

  // Distribution insights
  if (distInfo.exists && distInfo.sizeStats) {
    const totalSizeInMB = distInfo.sizeStats.totalSize / (1024 * 1024);

    if (totalSizeInMB > 1) {
      insights.push(
        `- Distribution size is ${totalSizeInMB.toFixed(
          2
        )}MB, which is relatively large. Consider code-splitting or removing unused dependencies.`
      );
    }

    if (distInfo.moduleInfo?.hasBothModuleTypes) {
      insights.push(
        "- Some files contain both ESM and CommonJS module syntax. Consider standardizing to one module format per file."
      );
    }

    if (distInfo.sizeStats.mapSize && distInfo.sizeStats.jsSize) {
      const mapToJsRatio =
        distInfo.sizeStats.mapSize / distInfo.sizeStats.jsSize;
      if (mapToJsRatio > 2) {
        insights.push(
          "- Source maps are significantly larger than your code. Consider using 'cheap-module-source-map' or similar options for development."
        );
      }
    }

    if (
      distInfo.fileStats?.dtsMapFiles === 0 &&
      distInfo.fileStats?.dtsFiles > 0
    ) {
      insights.push(
        "- No declaration source maps found. Adding them improves IDE navigation to source code when using your package."
      );
    }
  }

  // Version and modification time insights
  if (versionInfo && versionInfo.exists && versionInfo.packageJsonModified) {
    // Check if package hasn't been updated in a long time
    const lastModified = versionInfo.packageJsonModified;
    const monthsAgo =
      (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsAgo > 12) {
      insights.push(
        `- Package hasn't been updated in ${Math.floor(
          monthsAgo
        )} months. Consider reviewing for outdated dependencies or deprecation.`
      );
    }

    // Check for version inconsistency
    if (
      versionInfo.npmHistory.exists &&
      versionInfo.npmHistory.versions &&
      versionInfo.npmHistory.versions.length > 0 &&
      versionInfo.npmHistory.versions[0].version !== versionInfo.currentVersion
    ) {
      insights.push(
        `- Current version (${versionInfo.currentVersion}) differs from latest published version (${versionInfo.npmHistory.versions[0].version}). The package may have unpublished changes.`
      );
    }

    // Check if the package is frequently updated
    if (
      versionInfo.npmHistory.exists &&
      versionInfo.npmHistory.versionCount &&
      versionInfo.npmHistory.versionCount > 0 &&
      versionInfo.npmHistory.created &&
      versionInfo.npmHistory.modified
    ) {
      const created = new Date(versionInfo.npmHistory.created);
      const modified = new Date(versionInfo.npmHistory.modified);
      const monthsSinceCreation =
        (modified.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const versionsPerMonth =
        versionInfo.npmHistory.versionCount / Math.max(1, monthsSinceCreation);

      if (versionsPerMonth > 3) {
        insights.push(
          `- Package is frequently updated (${versionsPerMonth.toFixed(
            1
          )} versions/month), indicating active maintenance.`
        );
      } else if (versionsPerMonth < 0.1 && monthsSinceCreation > 12) {
        insights.push(
          `- Package has infrequent updates (${versionsPerMonth.toFixed(
            2
          )} versions/month), suggesting limited maintenance.`
        );
      }
    }
  }

  // Dependency insights
  if (dependencyInfo.exists && dependencyInfo.dependencyCounts) {
    if (dependencyInfo.dependencyCounts.dependencies > 20) {
      insights.push(
        `- Package has ${dependencyInfo.dependencyCounts.dependencies} dependencies. Consider reducing dependencies to improve install time and reduce security risks.`
      );
    }

    if (
      dependencyInfo.tooling &&
      dependencyInfo.tooling.testingTools.length === 0
    ) {
      insights.push(
        "- No testing libraries detected. Consider adding tests with Jest, Mocha, or Vitest."
      );
    }

    if (
      dependencyInfo.tooling &&
      dependencyInfo.tooling.lintingTools.length === 0
    ) {
      insights.push(
        "- No linting tools detected. Consider using ESLint and Prettier for code quality."
      );
    }
  }

  // Dependency size insights
  if (
    dependencySizeInfo &&
    dependencySizeInfo.exists &&
    dependencySizeInfo.totalSize
  ) {
    const totalSizeInMB = dependencySizeInfo.totalSize / (1024 * 1024);

    if (totalSizeInMB > 100) {
      insights.push(
        `- Extremely large node_modules size (${totalSizeInMB.toFixed(
          2
        )}MB). Consider using fewer dependencies or switching to lighter alternatives.`
      );
    } else if (totalSizeInMB > 50) {
      insights.push(
        `- Large node_modules size (${totalSizeInMB.toFixed(
          2
        )}MB). Review the 'Largest Dependencies' section to identify potential reductions.`
      );
    }

    // High number of transitive dependencies
    if (
      dependencySizeInfo.transitiveDependenciesCount &&
      dependencySizeInfo.packageJsonDependenciesCount &&
      dependencySizeInfo.transitiveDependenciesCount >
        dependencySizeInfo.packageJsonDependenciesCount * 5
    ) {
      insights.push(
        `- High number of transitive dependencies (${dependencySizeInfo.transitiveDependenciesCount}). Consider dependencies with fewer sub-dependencies to reduce complexity.`
      );
    }

    // Largest dependency takes up significant portion
    if (
      dependencySizeInfo.dependencySizes &&
      dependencySizeInfo.dependencySizes.length > 0
    ) {
      const largestDep = dependencySizeInfo.dependencySizes[0];
      const largestDepPercentage =
        (largestDep.size / dependencySizeInfo.totalSize) * 100;

      if (largestDepPercentage > 25) {
        insights.push(
          `- Dependency "${
            largestDep.name
          }" accounts for ${largestDepPercentage.toFixed(
            1
          )}% of total node_modules size. Consider if this dependency is essential or could be replaced.`
        );
      }
    }
  }

  // Package size insights
  if (packageSizeInfo && packageSizeInfo.success) {
    if (packageSizeInfo.packedSize) {
      const packedSizeInMB = packageSizeInfo.packedSize / (1024 * 1024);

      if (packedSizeInMB > 1) {
        insights.push(
          `- Published package size is ${packedSizeInMB.toFixed(
            2
          )}MB, which is relatively large. Consider reviewing the 'Largest Files' section and excluding unnecessary files using the 'files' field in package.json.`
        );
      }
    }

    if (
      packageSizeInfo.compressionRatio &&
      packageSizeInfo.compressionRatio > 0.9
    ) {
      insights.push(
        "- Package has a high compression ratio, indicating it may contain already compressed assets (images, etc.) or binary files. Consider optimizing these assets before packaging."
      );
    }

    // Check if the package has many non-essential files
    if (
      packageSizeInfo.largestFiles &&
      packageSizeInfo.largestFiles.some(
        file =>
          file.path.includes("test") ||
          file.path.includes("docs") ||
          file.path.includes("example") ||
          file.path.includes(".git")
      )
    ) {
      insights.push(
        "- Package contains test, documentation, or example files that might not be needed in production. Consider using the 'files' field in package.json to include only necessary files."
      );
    }
  }

  // If no insights, add a positive note
  if (insights.length === 0) {
    insights.push(
      "- Package follows best practices for TypeScript libraries. Great job!"
    );
  }

  return insights;
}

/**
 * Categorize insights by severity
 */
export function categorizeInsights(
  insights: string[]
): Array<{ text: string; severity: string }> {
  return insights.map(insight => {
    let severity = "info";
    const text = insight.replace(/^- /, "");

    if (
      text.includes("extremely large") ||
      text.includes("high compression ratio") ||
      text.includes("hasn't been updated in") ||
      text.includes("significantly larger")
    ) {
      severity = "high";
    } else if (
      text.includes("consider") ||
      text.includes("large") ||
      text.includes("no test") ||
      text.includes("no lint")
    ) {
      severity = "medium";
    } else if (
      text.includes("excellent") ||
      text.includes("Great job") ||
      text.includes("active maintenance")
    ) {
      severity = "positive";
    }

    return { text, severity };
  });
}
