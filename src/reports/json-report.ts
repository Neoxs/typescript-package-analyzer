import fs from "fs";
import path from "path";
import { AnalysisData, AnalyzerConfig } from "../core/types";
import { generateInsights } from "../utils/insights-utils";

/**
 * Generates a JSON report from the analysis data
 */
export function generateJSONReport(
  analysisData: AnalysisData,
  config: AnalyzerConfig
): void {
  console.log("\n📊 Generating JSON report...");

  // Calculate insights
  const insights = generateInsights(analysisData);

  // Create a report object with metadata
  const reportData = {
    packageName: config.packageName,
    generatedAt: new Date().toISOString(),
    analysisData,
    insights,
  };

  // Save the report
  const reportPath = path.join(
    config.outputDir,
    `${config.packageName}-analysis.json`
  );
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  console.log(`📊 JSON report saved to: ${reportPath}`);
}
