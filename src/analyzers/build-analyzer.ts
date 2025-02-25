import { execSync } from "child_process";
import { BuildTimeInfo } from "../core/types";
import { formatTime } from "../utils/format-utils";

/**
 * Measures the time it takes to build the package
 */
export async function measureBuildTime(
  packageDir: string
): Promise<BuildTimeInfo> {
  console.log("\n⏱️ Measuring build time...");

  try {
    // Clean build if possible
    try {
      execSync("npm run clean", {
        cwd: packageDir,
        stdio: "ignore",
      });
      console.log("✅ Cleaned previous build artifacts");
    } catch (cleanError) {
      // Clean script might not exist, which is fine
    }

    // Run the build
    const startTime = Date.now();

    execSync("npm run build", {
      cwd: packageDir,
      stdio: "inherit",
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    const endTime = Date.now();
    const buildTime = endTime - startTime;

    console.log(`✅ Build completed in ${formatTime(buildTime)}`);

    return {
      success: true,
      buildTime: buildTime,
      buildTimeFormatted: formatTime(buildTime),
    };
  } catch (error) {
    console.error(
      "❌ Error during build:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
