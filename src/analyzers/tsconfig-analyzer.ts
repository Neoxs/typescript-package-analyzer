import fs from "fs";
import path from "path";
import { TsConfigInfo } from "../core/types";

/**
 * Analyzes the TypeScript configuration file
 */
export function analyzeTsConfig(packageDir: string): TsConfigInfo {
  console.log("\n📝 Analyzing TypeScript configuration...");
  const tsConfigPath = findTsConfig(packageDir);

  if (!tsConfigPath) {
    console.warn("⚠️ tsconfig.json not found");
    return { exists: false };
  }

  try {
    const tsConfigData = JSON.parse(fs.readFileSync(tsConfigPath, "utf8"));
    const compilerOptions = tsConfigData.compilerOptions || {};

    return {
      exists: true,
      path: tsConfigPath,
      target: compilerOptions.target,
      module: compilerOptions.module,
      declaration: compilerOptions.declaration,
      declarationMap: compilerOptions.declarationMap,
      sourceMap: compilerOptions.sourceMap,
      strict: compilerOptions.strict,
      esModuleInterop: compilerOptions.esModuleInterop,
      skipLibCheck: compilerOptions.skipLibCheck,
      forceConsistentCasingInFileNames:
        compilerOptions.forceConsistentCasingInFileNames,
      outDir: compilerOptions.outDir,
      rootDir: compilerOptions.rootDir,
      composite: compilerOptions.composite,
      tsBuildInfoFile: compilerOptions.tsBuildInfoFile,
      incremental: compilerOptions.incremental,
      jsx: compilerOptions.jsx,
      jsxFactory: compilerOptions.jsxFactory,
      jsxFragmentFactory: compilerOptions.jsxFragmentFactory,
      lib: compilerOptions.lib,
      types: compilerOptions.types,
      paths: compilerOptions.paths
        ? Object.keys(compilerOptions.paths).length
        : 0,
      baseUrl: compilerOptions.baseUrl,
      resolveJsonModule: compilerOptions.resolveJsonModule,
      moduleResolution: compilerOptions.moduleResolution,
      extends: tsConfigData.extends,
      include: tsConfigData.include,
      exclude: tsConfigData.exclude,
      references: tsConfigData.references ? tsConfigData.references.length : 0,
    };
  } catch (error) {
    console.error(
      "❌ Error parsing tsconfig.json:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      exists: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Finds the TypeScript configuration file in the package directory
 */
export function findTsConfig(directory: string): string | null {
  const possiblePaths = [
    path.join(directory, "tsconfig.json"),
    path.join(directory, "tsconfig.build.json"),
    path.join(directory, "tsconfig.esm.json"),
  ];

  for (const configPath of possiblePaths) {
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }

  return null;
}
