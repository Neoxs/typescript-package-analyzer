/**
 * Core types for the TypeScript Package Analyzer
 */

// Base result interface for analyzers
export interface AnalyzerResult {
  exists: boolean;
  error?: string;
}

// Package.json analysis result
export interface PackageInfo extends AnalyzerResult {
  name?: string;
  version?: string;
  description?: string;
  author?: any;
  license?: string;
  main?: string;
  module?: string;
  types?: string;
  hasESM: boolean;
  hasCJS: boolean;
  hasTypes: boolean;
  scripts?: Record<string, string>;
  hasPrepublishScript: boolean;
  hasPrepackScript: boolean;
  hasBuildScript: boolean;
  hasTestScript: boolean;
  hasLintScript: boolean;
  hasPrettierScript: boolean;
  dependencies: number;
  devDependencies: number;
  peerDependencies: number;
  hasSourceMaps: boolean;
  sideEffects?: boolean;
  exports: boolean;
  files?: string[];
}

/**
 * Represents Git repository information for a package
 */
export interface GitInfo {
  /** Whether Git information exists */
  exists: boolean;
  /** Date of the last commit */
  lastCommitDate?: string;
  /** Total number of commits in the repository */
  commitCount?: number;
  /** List of Git tags (up to 10 most recent) */
  tags?: string[];
  /** Total number of tags in the repository */
  tagCount?: number;
  /** Current Git branch name */
  currentBranch?: string;
  /** Number of unique contributors */
  contributorsCount?: number;
}

/**
 * Represents version information from NPM package history
 */
export interface NpmVersionInfo {
  /** Package version */
  version: string;
  /** Date the version was published */
  date: string;
}

/**
 * Represents NPM package version history
 */
export interface NpmHistory {
  /** Whether NPM history information exists */
  exists: boolean;
  /** Date the package was first created on NPM */
  created?: string;
  /** Date the package was last modified on NPM */
  modified?: string;
  /** List of versions with their publication dates */
  versions?: NpmVersionInfo[];
  /** Total number of published versions */
  versionCount?: number;
}

// Version history analysis result
export interface VersionInfo extends AnalyzerResult {
  currentVersion?: string;
  packageJsonModified?: Date;
  newestFile?: {
    path: string;
    mtime: Date;
  };
  oldestFile?: {
    path: string;
    mtime: Date;
  };
  gitInfo: GitInfo;
  npmHistory: NpmHistory;
}

// TypeScript configuration analysis result
export interface TsConfigInfo extends AnalyzerResult {
  path?: string;
  target?: string;
  module?: string;
  declaration?: boolean;
  declarationMap?: boolean;
  sourceMap?: boolean;
  strict?: boolean;
  esModuleInterop?: boolean;
  skipLibCheck?: boolean;
  forceConsistentCasingInFileNames?: boolean;
  outDir?: string;
  rootDir?: string;
  composite?: boolean;
  tsBuildInfoFile?: string;
  incremental?: boolean;
  jsx?: string;
  jsxFactory?: string;
  jsxFragmentFactory?: string;
  lib?: string[];
  types?: string[];
  paths?: number;
  baseUrl?: string;
  resolveJsonModule?: boolean;
  moduleResolution?: string;
  extends?: string;
  include?: string[];
  exclude?: string[];
  references?: number;
}

// Build time analysis result
export interface BuildTimeInfo {
  success: boolean;
  buildTime?: number;
  buildTimeFormatted?: string;
  error?: string;
}

// Distribution files analysis result
export interface DistInfo extends AnalyzerResult {
  path?: string;
  fileStats?: {
    jsFiles: number;
    dtsFiles: number;
    mapFiles: number;
    dtsMapFiles: number;
    jsonFiles: number;
    cssFiles: number;
    otherFiles: number;
    totalFiles: number;
  };
  sizeStats?: {
    jsSize: number;
    dtsSize: number;
    mapSize: number;
    dtsMapSize: number;
    otherSize: number;
    totalSize: number;
  };
  moduleInfo?: {
    esmModules: number;
    cjsModules: number;
    sourceMapReferences: number;
    hasBothModuleTypes: boolean;
  };
}

// Dependencies analysis result
export interface DependencyInfo extends AnalyzerResult {
  dependencyCounts?: {
    dependencies: number;
    devDependencies: number;
    peerDependencies: number;
    typeDefinitions: number;
    total: number;
  };
  tooling?: {
    buildTools: string[];
    testingTools: string[];
    lintingTools: string[];
  };
  hasDependencyIssues: boolean;
}

// Dependency sizes analysis result
export interface DependencySizeInfo extends AnalyzerResult {
  totalSize?: number;
  dependencySizes?: Array<{
    name: string;
    size: number;
    version: string;
  }>;
  allDependenciesCount?: number;
  packageJsonDependenciesCount?: number;
  transitiveDependenciesCount?: number;
}

// Package size analysis result
export interface PackageSizeInfo {
  success: boolean;
  packedSize?: number;
  unpackedSize?: number;
  compressionRatio?: number;
  tarballPath?: string;
  tarballName?: string;
  largestFiles?: Array<{
    path: string;
    size: number;
  }>;
  error?: string;
}

// Complete analysis data
export interface AnalysisData {
  packageInfo: PackageInfo;
  versionInfo: VersionInfo;
  tsConfigInfo: TsConfigInfo;
  buildTimeInfo: BuildTimeInfo;
  distInfo: DistInfo;
  dependencyInfo: DependencyInfo;
  dependencySizeInfo: DependencySizeInfo;
  packageSizeInfo: PackageSizeInfo;
  timestamp: string;
}

// Config for the analyzer
export interface AnalyzerConfig {
  packagePath: string;
  fullPath: string;
  packageName: string;
  outputDir: string;
  historyDir: string;
}
