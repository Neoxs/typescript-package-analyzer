import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GitInfo, NpmHistory, VersionInfo } from "../core/types";

/**
 * Analyzes version history and modification times of the package
 */
export function analyzeVersionHistory(packageDir: string): VersionInfo {
  console.log("\n📜 Analyzing version history and modification times...");

  try {
    const packageJsonPath = path.join(packageDir, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      console.warn(
        "⚠️ package.json not found, skipping version history analysis"
      );
      return {
        exists: false,
        gitInfo: { exists: false },
        npmHistory: { exists: false },
      };
    }

    // Get current version from package.json
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const currentVersion = packageData.version || "unknown";

    // Get file modification times
    const packageJsonStat = fs.statSync(packageJsonPath);
    const packageJsonModified = packageJsonStat.mtime;

    // Try to get Git information if it's a Git repository
    let gitInfo = getGitInfo(packageDir);

    // Get NPM package version history if available
    let npmHistory = getNpmHistory(packageData.name);

    return {
      exists: true,
      currentVersion,
      packageJsonModified,
      gitInfo,
      npmHistory,
    };
  } catch (error) {
    console.error(
      "❌ Error analyzing version history:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
      gitInfo: { exists: false },
      npmHistory: { exists: false },
    };
  }
}

/**
 * Gets Git repository information
 */
function getGitInfo(packageDir: string) {
  let gitInfo: GitInfo = { exists: false };
  try {
    // Check if .git directory exists
    const gitDir = path.join(packageDir, ".git");
    if (fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory()) {
      gitInfo = {
        exists: true,
        lastCommitDate: "",
        commitCount: 0,
        tags: [],
        tagCount: 0,
        currentBranch: "",
        contributorsCount: 0,
      };

      // Get last commit date
      gitInfo.lastCommitDate = execSync("git log -1 --format=%cd", {
        cwd: packageDir,
        encoding: "utf8",
      }).trim();

      // Get commit count
      gitInfo.commitCount = parseInt(
        execSync("git rev-list --count HEAD", {
          cwd: packageDir,
          encoding: "utf8",
        }).trim(),
        10
      );

      // Get tags (potential version history)
      const tagsOutput = execSync("git tag --sort=-v:refname", {
        cwd: packageDir,
        encoding: "utf8",
      }).trim();

      const tags = tagsOutput ? tagsOutput.split(/\r?\n/) : [];
      gitInfo.tags = tags.slice(0, 10); // Only include the 10 most recent tags
      gitInfo.tagCount = tags.length;

      // Get current branch
      gitInfo.currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
        cwd: packageDir,
        encoding: "utf8",
      }).trim();

      // Get contributors count
      gitInfo.contributorsCount = parseInt(
        execSync("git log --format='%aN' | sort -u | wc -l", {
          cwd: packageDir,
          encoding: "utf8",
          shell: true as unknown as string, // Type assertion to fix the error
        }).trim(),
        10
      );
    }
  } catch (gitError) {
    // Git commands failed, can't get Git information
    console.warn(
      `⚠️ Could not get Git information: ${
        gitError instanceof Error ? gitError.message : String(gitError)
      }`
    );
  }
  return gitInfo;
}

/**
 * Gets NPM package version history
 */
function getNpmHistory(packageName: string) {
  let npmHistory: NpmHistory = { exists: false };

  if (!packageName) {
    return npmHistory;
  }

  try {
    const npmInfoOutput = execSync(`npm view ${packageName} time --json`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"], // Ignore stderr to prevent npm warnings
    });

    const npmInfo = JSON.parse(npmInfoOutput);

    // Sort versions by date
    const versionDates = Object.entries(npmInfo)
      .filter(([key]) => key !== "modified" && key !== "created")
      .sort(
        (a, b) =>
          new Date(b[1] as string).getTime() -
          new Date(a[1] as string).getTime()
      );

    npmHistory = {
      exists: true,
      created: npmInfo.created,
      modified: npmInfo.modified,
      versions: versionDates.map(([version, date]) => ({
        version,
        date: date as string,
      })),
      versionCount: versionDates.length,
    };
  } catch (npmError) {
    // npm view command failed, can't get NPM information
    // This is normal for packages that aren't published
  }

  return npmHistory;
}
