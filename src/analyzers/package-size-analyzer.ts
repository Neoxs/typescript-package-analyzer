import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { PackageSizeInfo } from "../core/types";
import { formatBytes } from "../utils/format-utils";

/**
 * Analyzes the size of the package when published
 */
export async function analyzePackageSize(
  packageDir: string,
  outputDir: string
): Promise<PackageSizeInfo> {
  console.log("\n📦 Analyzing package size...");

  // Create a temporary directory for packing
  const tempPackDir = path.join(outputDir, "pack-analysis");
  fs.mkdirSync(tempPackDir, { recursive: true });

  try {
    // Run npm pack
    console.log("Running npm pack...");
    const packOutput = execSync(`npm pack --pack-destination=${tempPackDir}`, {
      cwd: packageDir,
      encoding: "utf8",
    }).trim();

    // Get the tarball filename from the output
    const tarballName = packOutput.split(/\r?\n/).pop() || "";
    const tarballPath = path.join(tempPackDir, tarballName);

    if (!fs.existsSync(tarballPath)) {
      throw new Error(`Tarball file ${tarballPath} not found after npm pack`);
    }

    // Get size of the tarball
    const packedSize = fs.statSync(tarballPath).size;

    // Get unpacked size estimate (using unpacked size calc based on npm pack behavior)
    // First, list files that would be included in the package
    const filesOutput = execSync("npm pack --dry-run", {
      cwd: packageDir,
      encoding: "utf8",
    });

    // Extract the file list from the output
    const fileList = filesOutput
      .split(/\r?\n/)
      .filter(line => line.startsWith("npm notice"))
      .map(line => {
        const match = line.match(/npm notice\s+(.*?)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

    // Calculate total size of all included files
    let unpackedSize = 0;
    const includedFiles: Array<{ path: string; size: number }> = [];

    fileList.forEach(filePath => {
      try {
        const fullFilePath = path.join(packageDir, filePath);
        if (fs.existsSync(fullFilePath) && fs.statSync(fullFilePath).isFile()) {
          const fileSize = fs.statSync(fullFilePath).size;
          unpackedSize += fileSize;
          includedFiles.push({ path: filePath, size: fileSize });
        }
      } catch (err) {
        // Skip files that can't be analyzed
      }
    });

    // Sort files by size (largest first)
    includedFiles.sort((a, b) => b.size - a.size);

    // Compression ratio
    const compressionRatio = unpackedSize > 0 ? packedSize / unpackedSize : 0;

    console.log(`✅ Package size analysis complete`);
    console.log(`📦 Packed size: ${formatBytes(packedSize)}`);
    console.log(`📂 Unpacked size: ${formatBytes(unpackedSize)}`);
    console.log(
      `🔄 Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`
    );

    return {
      success: true,
      packedSize,
      unpackedSize,
      compressionRatio,
      tarballPath,
      tarballName,
      largestFiles: includedFiles.slice(0, 10), // Top 10 largest files
    };
  } catch (error) {
    console.error(
      "❌ Error analyzing package size:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
