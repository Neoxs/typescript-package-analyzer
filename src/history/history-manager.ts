import fs from "fs";
import path from "path";
import { AnalysisData } from "../core/types";
import { writeFileWithDirs } from "../utils/file-utils";

/**
 * Loads historical analysis data from the history directory
 */
export function loadHistoricalData(historyDir: string): AnalysisData[] {
  try {
    const historyFiles = fs
      .readdirSync(historyDir)
      .filter(file => file.endsWith(".json"))
      .sort(); // Sort by filename (timestamps)

    const historicalData = historyFiles.map(file => {
      const filePath = path.join(historyDir, file);
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    });

    return historicalData;
  } catch (error) {
    console.error(
      "⚠️ Failed to load historical data:",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

/**
 * Saves the current analysis data to history
 */
export async function saveHistoricalData(
  filePath: string,
  data: AnalysisData
): Promise<void> {
  try {
    writeFileWithDirs(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(
      "⚠️ Failed to save historical data:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Generates comparison data between current and previous analysis
 */
export function generateComparisonData(
  current: AnalysisData,
  previous: AnalysisData
): Record<string, any> {
  const comparison: Record<string, any> = {};

  // Compare build time
  if (
    current.buildTimeInfo.success &&
    previous.buildTimeInfo.success &&
    current.buildTimeInfo.buildTime &&
    previous.buildTimeInfo.buildTime
  ) {
    comparison.buildTimeChange =
      current.buildTimeInfo.buildTime - previous.buildTimeInfo.buildTime;
  }

  // Compare distribution size
  if (
    current.distInfo.exists &&
    previous.distInfo.exists &&
    current.distInfo.sizeStats?.totalSize &&
    previous.distInfo.sizeStats?.totalSize
  ) {
    comparison.distSizeChange =
      current.distInfo.sizeStats.totalSize -
      previous.distInfo.sizeStats.totalSize;
  }

  // Compare dependency count
  if (
    current.dependencyInfo.exists &&
    previous.dependencyInfo.exists &&
    current.dependencyInfo.dependencyCounts?.dependencies &&
    previous.dependencyInfo.dependencyCounts?.dependencies
  ) {
    comparison.dependencyCountChange =
      current.dependencyInfo.dependencyCounts.dependencies -
      previous.dependencyInfo.dependencyCounts.dependencies;
  }

  return comparison;
}
