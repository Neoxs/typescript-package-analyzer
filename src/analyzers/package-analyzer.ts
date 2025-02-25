import fs from "fs";
import path from "path";
import { PackageInfo } from "../core/types";

/**
 * Analyzes the package.json file to extract package information
 */
export function analyzePackageJson(packageDir: string): PackageInfo {
  console.log("\n📝 Analyzing package.json...");
  const packageJsonPath = path.join(packageDir, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.warn("⚠️ package.json not found");
    return {
      exists: false,
      hasESM: false,
      hasCJS: false,
      hasTypes: false,
      hasPrepublishScript: false,
      hasPrepackScript: false,
      hasBuildScript: false,
      hasTestScript: false,
      hasLintScript: false,
      hasPrettierScript: false,
      dependencies: 0,
      devDependencies: 0,
      peerDependencies: 0,
      hasSourceMaps: false,
      exports: false,
    };
  }

  try {
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Extract relevant information
    return {
      exists: true,
      name: packageData.name,
      version: packageData.version,
      description: packageData.description,
      author: packageData.author,
      license: packageData.license,
      main: packageData.main,
      module: packageData.module,
      types: packageData.types || packageData.typings,
      hasESM: !!packageData.module,
      hasCJS: !!packageData.main,
      hasTypes: !!(packageData.types || packageData.typings),
      scripts: packageData.scripts || {},
      hasPrepublishScript: !!(
        packageData.scripts && packageData.scripts.prepublish
      ),
      hasPrepackScript: !!(packageData.scripts && packageData.scripts.prepack),
      hasBuildScript: !!(packageData.scripts && packageData.scripts.build),
      hasTestScript: !!(packageData.scripts && packageData.scripts.test),
      hasLintScript: !!(
        packageData.scripts &&
        (packageData.scripts.lint || packageData.scripts.eslint)
      ),
      hasPrettierScript: !!(
        packageData.scripts && packageData.scripts.prettier
      ),
      dependencies: Object.keys(packageData.dependencies || {}).length,
      devDependencies: Object.keys(packageData.devDependencies || {}).length,
      peerDependencies: Object.keys(packageData.peerDependencies || {}).length,
      hasSourceMaps:
        packageData.publishConfig &&
        packageData.publishConfig.sourcemap === true,
      sideEffects: packageData.sideEffects,
      exports: !!packageData.exports,
      files: packageData.files || [],
    };
  } catch (error) {
    console.error(
      "❌ Error parsing package.json:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      exists: true,
      error: error instanceof Error ? error.message : String(error),
      hasESM: false,
      hasCJS: false,
      hasTypes: false,
      hasPrepublishScript: false,
      hasPrepackScript: false,
      hasBuildScript: false,
      hasTestScript: false,
      hasLintScript: false,
      hasPrettierScript: false,
      dependencies: 0,
      devDependencies: 0,
      peerDependencies: 0,
      hasSourceMaps: false,
      exports: false,
    };
  }
}
