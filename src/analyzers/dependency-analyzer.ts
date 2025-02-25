import fs from "fs";
import path from "path";
import { DependencyInfo, DependencySizeInfo } from "../core/types";

/**
 * Analyzes the dependencies of the package
 */
export function analyzeDependencies(packageDir: string): DependencyInfo {
  console.log("\n📦 Analyzing dependencies...");

  const packageJsonPath = path.join(packageDir, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.warn("⚠️ package.json not found, skipping dependency analysis");
    return { exists: false, hasDependencyIssues: false };
  }

  try {
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const dependencies = packageData.dependencies || {};
    const devDependencies = packageData.devDependencies || {};
    const peerDependencies = packageData.peerDependencies || {};

    // Categorize dependencies
    const typesDeps = Object.keys(devDependencies).filter(dep =>
      dep.startsWith("@types/")
    );
    const buildTools = [
      "typescript",
      "rollup",
      "webpack",
      "esbuild",
      "babel",
      "tsc",
      "vite",
      "parcel",
      "gulp",
      "grunt",
    ].filter(tool => devDependencies[tool]);
    const testingTools = [
      "jest",
      "mocha",
      "chai",
      "jasmine",
      "vitest",
      "karma",
      "ava",
      "tap",
      "cypress",
      "playwright",
    ].filter(tool => devDependencies[tool]);
    const lintingTools = ["eslint", "tslint", "prettier", "stylelint"].filter(
      tool => devDependencies[tool]
    );

    return {
      exists: true,
      dependencyCounts: {
        dependencies: Object.keys(dependencies).length,
        devDependencies: Object.keys(devDependencies).length,
        peerDependencies: Object.keys(peerDependencies).length,
        typeDefinitions: typesDeps.length,
        total:
          Object.keys(dependencies).length +
          Object.keys(devDependencies).length +
          Object.keys(peerDependencies).length,
      },
      tooling: {
        buildTools,
        testingTools,
        lintingTools,
      },
      hasDependencyIssues: false, // Could add checks here for problematic dependencies
    };
  } catch (error) {
    console.error(
      "❌ Error analyzing dependencies:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      exists: true,
      error: error instanceof Error ? error.message : String(error),
      hasDependencyIssues: false,
    };
  }
}

/**
 * Analyzes the sizes of dependencies in node_modules
 */
export function analyzeDependencySizes(packageDir: string): DependencySizeInfo {
  console.log("\n📏 Analyzing dependency sizes...");

  const nodeModulesPath = path.join(packageDir, "node_modules");

  if (!fs.existsSync(nodeModulesPath)) {
    console.warn(
      "⚠️ node_modules not found, skipping dependency size analysis"
    );
    return { exists: false };
  }

  try {
    // Get all immediate dependencies from node_modules
    const dependencies = fs
      .readdirSync(nodeModulesPath)
      .filter(name => !name.startsWith(".") && name !== ".bin")
      .map(name => {
        const depPath = path.join(nodeModulesPath, name);

        // Handle scoped packages (@org/package)
        if (name.startsWith("@") && fs.statSync(depPath).isDirectory()) {
          return fs
            .readdirSync(depPath)
            .map(scopedPkg => {
              const scopedPath = path.join(depPath, scopedPkg);
              if (fs.statSync(scopedPath).isDirectory()) {
                return {
                  name: `${name}/${scopedPkg}`,
                  path: scopedPath,
                };
              }
              return null;
            })
            .filter(
              (item): item is { name: string; path: string } => item !== null
            );
        }

        // Handle regular packages
        if (fs.statSync(depPath).isDirectory()) {
          return { name, path: depPath };
        }

        return null;
      })
      .flat()
      .filter((item): item is { name: string; path: string } => item !== null);

    // Calculate size of each dependency
    const dependencySizes = dependencies.map(dep => {
      const size = calculateDirectorySize(dep.path);

      // Try to get the version from package.json
      let version = "unknown";
      try {
        const depPackageJson = path.join(dep.path, "package.json");
        if (fs.existsSync(depPackageJson)) {
          const depPackageData = JSON.parse(
            fs.readFileSync(depPackageJson, "utf8")
          );
          version = depPackageData.version || "unknown";
        }
      } catch (err) {
        // Skip if can't read package.json
      }

      return {
        name: dep.name,
        size,
        version,
      };
    });

    // Sort by size (largest first)
    dependencySizes.sort((a, b) => b.size - a.size);

    // Calculate total size of node_modules
    const totalSize = dependencySizes.reduce(
      (total, dep) => total + dep.size,
      0
    );

    // Get dependency count from package.json
    const packageJsonPath = path.join(packageDir, "package.json");
    let packageDependencies = 0;
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageData = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );
        packageDependencies = Object.keys(
          packageData.dependencies || {}
        ).length;
      } catch (err) {
        // Skip if can't read package.json
      }
    }

    return {
      exists: true,
      totalSize,
      dependencySizes: dependencySizes.slice(0, 20), // Top 20 largest dependencies
      allDependenciesCount: dependencySizes.length,
      packageJsonDependenciesCount: packageDependencies,
      transitiveDependenciesCount: Math.max(
        0,
        dependencySizes.length - packageDependencies
      ),
    };
  } catch (error) {
    console.error(
      "❌ Error analyzing dependency sizes:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Calculates the total size of a directory and its contents
 */
export function calculateDirectorySize(dirPath: string): number {
  let totalSize = 0;

  function traverseDir(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDir(fullPath);
      } else {
        totalSize += stat.size;
      }
    });
  }

  traverseDir(dirPath);
  return totalSize;
}
