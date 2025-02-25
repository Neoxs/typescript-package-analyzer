import fs from "fs";
import path from "path";
import { DistInfo } from "../core/types";

/**
 * Analyzes the distribution folder of the package
 */
export function analyzeDistFolder(packageDir: string): DistInfo {
  console.log("\n📁 Analyzing distribution files...");

  const distPath = findDistDirectory(packageDir);

  if (!distPath) {
    console.warn("⚠️ Distribution directory not found");
    return { exists: false };
  }

  try {
    // File counts by type
    const jsFiles = findFiles(distPath, ".js");
    const dtsFiles = findFiles(distPath, ".d.ts");
    const mapFiles = findFiles(distPath, ".js.map");
    const dtsMapFiles = findFiles(distPath, ".d.ts.map");
    const jsonFiles = findFiles(distPath, ".json");
    const cssFiles = findFiles(distPath, ".css");
    const allFiles = findAllFiles(distPath);

    // Calculate sizes
    const jsSize = calculateFilesSize(jsFiles);
    const dtsSize = calculateFilesSize(dtsFiles);
    const mapSize = calculateFilesSize(mapFiles);
    const dtsMapSize = calculateFilesSize(dtsMapFiles);
    const otherSize = calculateFilesSize(
      allFiles.filter(
        file =>
          !file.endsWith(".js") &&
          !file.endsWith(".d.ts") &&
          !file.endsWith(".js.map") &&
          !file.endsWith(".d.ts.map")
      )
    );
    const totalSize = jsSize + dtsSize + mapSize + dtsMapSize + otherSize;

    // Check if source maps are referenced in JS files
    let sourceMapReferences = 0;
    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("sourceMappingURL")) {
        sourceMapReferences++;
      }
    });

    // Check for module types (ESM, CJS)
    let esmModules = 0;
    let cjsModules = 0;

    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("export ") || content.includes("import ")) {
        esmModules++;
      }
      if (content.includes("require(") || content.includes("module.exports")) {
        cjsModules++;
      }
    });

    return {
      exists: true,
      path: distPath,
      fileStats: {
        jsFiles: jsFiles.length,
        dtsFiles: dtsFiles.length,
        mapFiles: mapFiles.length,
        dtsMapFiles: dtsMapFiles.length,
        jsonFiles: jsonFiles.length,
        cssFiles: cssFiles.length,
        otherFiles:
          allFiles.length -
          jsFiles.length -
          dtsFiles.length -
          mapFiles.length -
          dtsMapFiles.length -
          jsonFiles.length -
          cssFiles.length,
        totalFiles: allFiles.length,
      },
      sizeStats: {
        jsSize,
        dtsSize,
        mapSize,
        dtsMapSize,
        otherSize,
        totalSize,
      },
      moduleInfo: {
        esmModules,
        cjsModules,
        sourceMapReferences,
        hasBothModuleTypes: esmModules > 0 && cjsModules > 0,
      },
    };
  } catch (error) {
    console.error(
      "❌ Error analyzing dist folder:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      exists: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Finds the distribution directory in the package
 */
export function findDistDirectory(directory: string): string | null {
  const possiblePaths = [
    path.join(directory, "dist"),
    path.join(directory, "build"),
    path.join(directory, "lib"),
    path.join(directory, "out"),
    path.join(directory, "esm"),
    path.join(directory, "cjs"),
  ];

  for (const distPath of possiblePaths) {
    if (fs.existsSync(distPath)) {
      return distPath;
    }
  }

  return null;
}

/**
 * Finds files with a specific extension in a directory and its subdirectories
 */
function findFiles(dir: string, extension: string): string[] {
  let results: string[] = [];

  function traverseDir(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDir(fullPath);
      } else if (file.endsWith(extension)) {
        results.push(fullPath);
      }
    });
  }

  traverseDir(dir);
  return results;
}

/**
 * Finds all files in a directory and its subdirectories
 */
function findAllFiles(dir: string): string[] {
  let results: string[] = [];

  function traverseDir(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDir(fullPath);
      } else {
        results.push(fullPath);
      }
    });
  }

  traverseDir(dir);
  return results;
}

/**
 * Calculates the total size of an array of files
 */
function calculateFilesSize(files: string[]): number {
  return files.reduce((total, file) => {
    return total + fs.statSync(file).size;
  }, 0);
}
