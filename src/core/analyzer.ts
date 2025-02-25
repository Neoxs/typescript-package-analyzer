import path from "path";
import fs from "fs";
import { AnalysisData, AnalyzerConfig } from "./types";
import { analyzePackageJson } from "../analyzers/package-analyzer";
import { analyzeVersionHistory } from "../analyzers/version-analyzer";
import { analyzeTsConfig } from "../analyzers/tsconfig-analyzer";
import { measureBuildTime } from "../analyzers/build-analyzer";
import { analyzeDistFolder } from "../analyzers/dist-analyzer";
import { analyzeDependencies } from "../analyzers/dependency-analyzer";
import { analyzeDependencySizes } from "../analyzers/dependency-analyzer";
import { analyzePackageSize } from "../analyzers/package-size-analyzer";
import {
  loadHistoricalData,
  saveHistoricalData,
} from "../history/history-manager";
import { generateMarkdownReport } from "../reports/markdown-report";
import { generateHTMLReport } from "../reports/html-report";
import { generateJSONReport } from "../reports/json-report";

/**
 * Main analyzer class that orchestrates the analysis process
 */
export class PackageAnalyzer {
  private config: AnalyzerConfig;

  constructor(packagePath: string) {
    const fullPath = path.resolve(packagePath);
    const packageName = path.basename(fullPath);
    const outputDir = path.join(process.cwd(), "package-analysis", packageName);
    const historyDir = path.join(outputDir, "history");

    // Create output and history directories
    fs.mkdirSync(historyDir, { recursive: true });

    this.config = {
      packagePath,
      fullPath,
      packageName,
      outputDir,
      historyDir,
    };

    console.log(`📊 Analyzing TypeScript Package: ${packageName}`);
    console.log(`📂 Package path: ${fullPath}`);
    console.log(`📂 Analysis output directory: ${outputDir}`);
  }

  /**
   * Run the complete analysis process
   */
  public async analyze(): Promise<void> {
    try {
      // Perform the analysis
      const analysisData = await this.performAnalysis();

      // Save the analysis data to history
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const historyFilePath = path.join(
        this.config.historyDir,
        `analysis-${timestamp}.json`
      );

      await saveHistoricalData(historyFilePath, analysisData);
      console.log(`✅ Analysis saved to history: ${historyFilePath}`);

      // Generate reports
      this.generateReports(analysisData);
    } catch (error) {
      console.error(
        "❌ Error during analysis:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  }

  /**
   * Perform the analysis steps
   */
  private async performAnalysis(): Promise<AnalysisData> {
    // Perform all the analysis steps
    const packageInfo = analyzePackageJson(this.config.fullPath);
    const versionInfo = analyzeVersionHistory(this.config.fullPath);
    const tsConfigInfo = analyzeTsConfig(this.config.fullPath);
    const buildTimeInfo = await measureBuildTime(this.config.fullPath);
    const distInfo = analyzeDistFolder(this.config.fullPath);
    const dependencyInfo = analyzeDependencies(this.config.fullPath);
    const dependencySizeInfo = analyzeDependencySizes(this.config.fullPath);
    const packageSizeInfo = await analyzePackageSize(
      this.config.fullPath,
      this.config.outputDir
    );

    return {
      packageInfo,
      versionInfo,
      tsConfigInfo,
      buildTimeInfo,
      distInfo,
      dependencyInfo,
      dependencySizeInfo,
      packageSizeInfo,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate all reports
   */
  private generateReports(analysisData: AnalysisData): void {
    console.log("\n📊 Generating reports...");

    const historicalData = loadHistoricalData(this.config.historyDir);

    // Generate Markdown report
    generateMarkdownReport(analysisData, this.config);

    // Generate HTML report
    generateHTMLReport(analysisData, this.config, historicalData);

    // Generate JSON report
    generateJSONReport(analysisData, this.config);

    console.log(`\n✅ Analysis complete!`);
  }
}
