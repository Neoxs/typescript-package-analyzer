import fs from "fs";
import path from "path";

/**
 * Finds files with a specific extension in a directory and its subdirectories
 */
export function findFilesWithExtension(
  dir: string,
  extension: string
): string[] {
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
export function findAllFiles(dir: string): string[] {
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
export function calculateFilesSize(files: string[]): number {
  return files.reduce((total, file) => {
    return total + fs.statSync(file).size;
  }, 0);
}

/**
 * Calculates the total size of a directory and its contents
 */
export function calculateDirectorySize(dirPath: string): number {
  let totalSize = 0;

  function traverseDir(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDir(fullPath);
      } else {
        totalSize += stat.size;
      }
    });
  }

  traverseDir(dirPath);
  return totalSize;
}

/**
 * Creates a directory recursively if it doesn't exist
 */
export function ensureDirectoryExists(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Writes data to a file, creating any necessary directories
 */
export function writeFileWithDirs(filePath: string, data: string): void {
  const dirPath = path.dirname(filePath);
  ensureDirectoryExists(dirPath);
  fs.writeFileSync(filePath, data);
}
