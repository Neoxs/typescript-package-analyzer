#!/usr/bin/env node

/**
 * TypeScript Package Analyzer
 *
 * A comprehensive tool for analyzing TypeScript packages, providing insights on:
 * - Version history and modification times
 * - Build time and performance
 * - File count and sizes
 * - TypeScript configuration
 * - Dependency analysis and sizes
 * - Package size when published
 */

export { PackageAnalyzer } from "./core/analyzer";
export * from "./core/types";

// If this file is executed directly, handle CLI usage
if (require.main === module) {
  const { PackageAnalyzer } = require("./core/analyzer");

  // Process command line arguments
  const packagePath = process.argv[2];

  if (!packagePath) {
    console.error("❌ Error: Please provide a package path");
    console.log("Usage: npx typescript-package-analyzer <package-path>");
    process.exit(1);
  }

  // Run the analyzer
  const analyzer = new PackageAnalyzer(packagePath);
  analyzer.analyze().catch((error: Error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}
