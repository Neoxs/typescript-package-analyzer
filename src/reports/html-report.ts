import fs from "fs";
import path from "path";
import { AnalysisData, AnalyzerConfig } from "../core/types";
import { generateInsights, categorizeInsights } from "../utils/insights-utils";
import {
  formatBytes,
  formatAuthor,
  getRelativeTimeString,
} from "../utils/format-utils";
import { writeFileWithDirs } from "../utils/file-utils";

/**
 * Generates an HTML report from the analysis data
 */
export function generateHTMLReport(
  analysisData: AnalysisData,
  config: AnalyzerConfig,
  historicalData: AnalysisData[]
): void {
  console.log("\n🌐 Generating HTML report...");

  const {
    packageInfo,
    versionInfo,
    tsConfigInfo,
    buildTimeInfo,
    distInfo,
    dependencyInfo,
    dependencySizeInfo,
    packageSizeInfo,
  } = analysisData;

  // Calculate insights and recommendations
  const insights = generateInsights(analysisData);
  const categorizedInsights = categorizeInsights(insights);

  // HTML Template
  const htmlContent = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeScript Package Analysis: ${config.packageName}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      :root {
        --primary-color: #3178c6; /* TypeScript blue */
        --primary-dark: #215732;
        --secondary-color: #f1f1f1;
        --text-color: #333;
        --light-text: #666;
        --border-color: #ddd;
        --success-color: #4caf50;
        --warning-color: #ff9800;
        --danger-color: #f44336;
        --info-color: #2196f3;
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        line-height: 1.6;
        color: var(--text-color);
        background-color: #f9f9f9;
        padding: 0;
        margin: 0;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      header {
        background-color: var(--primary-color);
        color: white;
        padding: 30px 0;
        margin-bottom: 30px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      h1 {
        font-size: 2.5rem;
        margin-bottom: 10px;
      }
      
      h2 {
        font-size: 1.8rem;
        margin: 30px 0 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--primary-color);
      }
      
      h3 {
        font-size: 1.4rem;
        margin: 25px 0 15px;
        color: var(--primary-dark);
      }
      
      p {
        margin-bottom: 15px;
      }
      
      .meta-info {
        color: var(--light-text);
        font-size: 0.95rem;
      }
      
      .card {
        background-color: white;
        border-radius: 8px;
        padding: 25px;
        margin-bottom: 25px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }
      
      .stat-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
      }
      
      .stat-title {
        font-size: 0.9rem;
        color: var(--light-text);
        margin-bottom: 5px;
      }
      
      .stat-value {
        font-size: 1.6rem;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .stat-description {
        font-size: 0.9rem;
        color: var(--light-text);
        margin-top: auto;
      }
      
      .key-value-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      
      .key-value-table td {
        padding: 8px 15px;
        border-bottom: 1px solid var(--border-color);
      }
      
      .key-value-table td:first-child {
        font-weight: 600;
        width: 30%;
      }
      
      .insights-list {
        list-style-type: none;
      }
      
      .insights-list li {
        padding: 12px 15px;
        margin-bottom: 10px;
        border-radius: 4px;
        background-color: #f8f9fa;
        border-left: 4px solid #ddd;
      }
      
      .insights-list li.severity-high {
        background-color: #fff8f7;
        border-left-color: var(--danger-color);
      }
      
      .insights-list li.severity-medium {
        background-color: #fff8ec;
        border-left-color: var(--warning-color);
      }
      
      .insights-list li.severity-info {
        background-color: #f0f7ff;
        border-left-color: var(--info-color);
      }
      
      .insights-list li.severity-positive {
        background-color: #f0fff0;
        border-left-color: var(--success-color);
      }
      
      .chart-container {
        position: relative;
        margin: 20px 0;
        height: 300px;
      }
      
      .progress-container {
        height: 12px;
        background-color: #f1f1f1;
        border-radius: 6px;
        margin: 8px 0 15px 0;
        overflow: hidden;
      }
      
      .progress-bar {
        height: 100%;
        background-color: var(--primary-color);
      }
      
      .file-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      
      .file-table th {
        background-color: #f1f1f1;
        font-weight: 600;
        text-align: left;
        padding: 10px 15px;
      }
      
      .file-table td {
        padding: 8px 15px;
        border-bottom: 1px solid var(--border-color);
      }
      
      .file-table tr:hover {
        background-color: #f9f9f9;
      }
      
      footer {
        margin-top: 50px;
        text-align: center;
        color: var(--light-text);
        padding: 20px;
        border-top: 1px solid var(--border-color);
      }
      
      /* Utility classes */
      .text-success { color: var(--success-color); }
      .text-warning { color: var(--warning-color); }
      .text-danger { color: var(--danger-color); }
      .text-info { color: var(--info-color); }
      
      /* Size donut chart CSS */
      .size-chart-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        margin: 20px 0;
      }
      
      .donut-chart {
        width: 200px;
        position: relative;
        margin: 15px;
      }
      
      .donut-chart-legend {
        list-style-type: none;
        margin-top: 15px;
      }
      
      .donut-chart-legend li {
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        margin: 5px 0;
      }
      
      .legend-color {
        width: 12px;
        height: 12px;
        display: inline-block;
        margin-right: 5px;
        border-radius: 2px;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .stat-grid {
          grid-template-columns: 1fr;
        }
        
        .key-value-table td:first-child {
          width: 40%;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="header-content">
        <h1>TypeScript Package Analysis</h1>
        <p>${
          config.packageName
        } - Generated on ${new Date().toLocaleString()}</p>
      </div>
    </header>
    
    <div class="container">
      <!-- Package summary section -->
      <section class="card">
        <h2>Package Summary</h2>
        ${
          packageInfo.exists
            ? `
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-title">Package Name</div>
            <div class="stat-value">${
              packageInfo.name || config.packageName
            }</div>
            <div class="stat-description">Current version: ${
              packageInfo.version || "N/A"
            }</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Build Time</div>
            <div class="stat-value">${
              buildTimeInfo.success
                ? buildTimeInfo.buildTimeFormatted
                : "Failed"
            }</div>
            <div class="stat-description">${
              buildTimeInfo.success ? "Successful build" : "Build error"
            }</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Package Size</div>
            <div class="stat-value">${
              packageSizeInfo?.success
                ? formatBytes(packageSizeInfo.packedSize || 0)
                : "N/A"
            }</div>
            <div class="stat-description">Packed size (npm tarball)</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Dependencies</div>
            <div class="stat-value">${
              dependencyInfo.exists
                ? dependencyInfo.dependencyCounts?.dependencies || 0
                : "N/A"
            }</div>
            <div class="stat-description">Direct runtime dependencies</div>
          </div>
        </div>
        
        <table class="key-value-table">
          <tr>
            <td>Description</td>
            <td>${packageInfo.description || "No description provided"}</td>
          </tr>
          <tr>
            <td>License</td>
            <td>${packageInfo.license || "Not specified"}</td>
          </tr>
          <tr>
            <td>Author</td>
            <td>${formatAuthor(packageInfo.author) || "Not specified"}</td>
          </tr>
          <tr>
            <td>Entry Points</td>
            <td>
              ${
                packageInfo.hasCJS
                  ? '<span class="text-success">CommonJS ✓</span>'
                  : '<span class="text-warning">CommonJS ✗</span>'
              } &nbsp;
              ${
                packageInfo.hasESM
                  ? '<span class="text-success">ESM ✓</span>'
                  : '<span class="text-warning">ESM ✗</span>'
              } &nbsp;
              ${
                packageInfo.hasTypes
                  ? '<span class="text-success">TypeScript ✓</span>'
                  : '<span class="text-warning">TypeScript ✗</span>'
              }
            </td>
          </tr>
        </table>
        `
            : "<p>Package.json not found</p>"
        }
      </section>
      
      <!-- Version & modification section -->
      ${
        versionInfo?.exists
          ? `
      <section class="card">
        <h2>Version & Modification History</h2>
        
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-title">Current Version</div>
            <div class="stat-value">${versionInfo.currentVersion}</div>
            <div class="stat-description">As defined in package.json</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Last Modified</div>
            <div class="stat-value">${
              versionInfo.packageJsonModified
                ? getRelativeTimeString(versionInfo.packageJsonModified)
                : "N/A"
            }</div>
            <div class="stat-description">package.json last updated</div>
          </div>
          
          ${
            versionInfo.npmHistory.exists
              ? `
          <div class="stat-card">
            <div class="stat-title">NPM History</div>
            <div class="stat-value">${
              versionInfo.npmHistory.versionCount || 0
            } versions</div>
            <div class="stat-description">First published ${
              versionInfo.npmHistory.created
                ? getRelativeTimeString(
                    new Date(versionInfo.npmHistory.created)
                  )
                : "N/A"
            }</div>
          </div>
          `
              : ""
          }
          
          ${
            versionInfo.gitInfo.exists
              ? `
          <div class="stat-card">
            <div class="stat-title">Git Activity</div>
            <div class="stat-value">${versionInfo.gitInfo.commitCount} commits</div>
            <div class="stat-description">From ${versionInfo.gitInfo.contributorsCount} contributors</div>
          </div>
          `
              : ""
          }
        </div>
        
        ${
          versionInfo.npmHistory.exists &&
          versionInfo.npmHistory.versions &&
          versionInfo.npmHistory.versions.length > 0
            ? `
        <h3>Recent Versions</h3>
        <table class="file-table">
          <tr>
            <th>Version</th>
            <th>Release Date</th>
          </tr>
          ${versionInfo.npmHistory.versions
            .slice(0, 5)
            .map(
              v => `
          <tr>
            <td>${v.version}</td>
            <td>${new Date(v.date).toLocaleString()}</td>
          </tr>
          `
            )
            .join("")}
        </table>
        `
            : ""
        }
        
        ${
          versionInfo.gitInfo.exists
            ? `
        <h3>Git Information</h3>
        <table class="key-value-table">
          <tr>
            <td>Current Branch</td>
            <td>${versionInfo.gitInfo.currentBranch}</td>
          </tr>
          <tr>
            <td>Last Commit</td>
            <td>${versionInfo.gitInfo.lastCommitDate}</td>
          </tr>
          <tr>
            <td>Tags</td>
            <td>${
              versionInfo.gitInfo.tags && versionInfo.gitInfo.tags.length > 0
                ? versionInfo.gitInfo.tags.join(", ")
                : "No tags"
            }</td>
          </tr>
        </table>
        `
            : ""
        }
      </section>
      `
          : ""
      }
      
      <!-- Distribution files section -->
      ${
        distInfo.exists
          ? `
      <section class="card">
        <h2>Distribution Files</h2>
        
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-title">Total Files</div>
            <div class="stat-value">${distInfo.fileStats?.totalFiles || 0}</div>
            <div class="stat-description">In ${
              distInfo.path ? path.basename(distInfo.path) : "N/A"
            }} directory</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Total Size</div>
            <div class="stat-value">${formatBytes(
              distInfo.sizeStats?.totalSize || 0
            )}</div>
            <div class="stat-description">Distribution files size</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">JavaScript Files</div>
            <div class="stat-value">${distInfo.fileStats?.jsFiles || 0}</div>
            <div class="stat-description">${formatBytes(
              distInfo.sizeStats?.jsSize || 0
            )}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">TypeScript Declarations</div>
            <div class="stat-value">${distInfo.fileStats?.dtsFiles || 0}</div>
            <div class="stat-description">${formatBytes(
              distInfo.sizeStats?.dtsSize || 0
            )}</div>
          </div>
        </div>
        
        <h3>File Distribution</h3>
        <div class="size-chart-container">
          <div class="donut-chart">
            <canvas id="filesDonutChart" width="200" height="200"></canvas>
            <ul class="donut-chart-legend">
              <li><span class="legend-color" style="background-color: #3178c6;"></span> JavaScript Files (${
                distInfo.fileStats?.jsFiles
              })</li>
              <li><span class="legend-color" style="background-color: #007acc;"></span> Declaration Files (${
                distInfo.fileStats?.dtsFiles
              })</li>
              <li><span class="legend-color" style="background-color: #549bf4;"></span> Source Maps (${
                distInfo.fileStats?.mapFiles
              })</li>
              <li><span class="legend-color" style="background-color: #8abfff;"></span> Declaration Maps (${
                distInfo.fileStats?.dtsMapFiles
              })</li>
              <li><span class="legend-color" style="background-color: #cccccc;"></span> Other Files (${
                distInfo.fileStats?.otherFiles
              })</li>
            </ul>
          </div>
          
          <div class="donut-chart">
            <canvas id="sizeDonutChart" width="200" height="200"></canvas>
            <ul class="donut-chart-legend">
              <li><span class="legend-color" style="background-color: #3178c6;"></span> JavaScript (${formatBytes(
                distInfo.sizeStats?.jsSize || 0
              )})</li>
              <li><span class="legend-color" style="background-color: #007acc;"></span> Declarations (${formatBytes(
                distInfo.sizeStats?.dtsSize || 0
              )})</li>
              <li><span class="legend-color" style="background-color: #549bf4;"></span> Source Maps (${formatBytes(
                distInfo.sizeStats?.mapSize || 0
              )})</li>
              <li><span class="legend-color" style="background-color: #8abfff;"></span> Declaration Maps (${formatBytes(
                distInfo.sizeStats?.dtsMapSize || 0
              )})</li>
              <li><span class="legend-color" style="background-color: #cccccc;"></span> Other (${formatBytes(
                distInfo.sizeStats?.otherSize || 0
              )})</li>
            </ul>
          </div>
        </div>
        
        <h3>Module Information</h3>
        <table class="key-value-table">
          <tr>
            <td>ESM Modules</td>
            <td>${distInfo.moduleInfo?.esmModules}</td>
          </tr>
          <tr>
            <td>CommonJS Modules</td>
            <td>${distInfo.moduleInfo?.cjsModules}</td>
          </tr>
          <tr>
            <td>Source Map References</td>
            <td>${distInfo.moduleInfo?.sourceMapReferences} of ${
              distInfo.fileStats?.jsFiles
            } JavaScript files</td>
          </tr>
          <tr>
            <td>Mixed Module Types</td>
            <td>${
              distInfo.moduleInfo?.hasBothModuleTypes
                ? '<span class="text-warning">Yes - Some files contain both ESM and CommonJS syntax</span>'
                : '<span class="text-success">No - Consistent module format</span>'
            }</td>
          </tr>
        </table>
      </section>
      `
          : ""
      }
      
      <!-- TypeScript configuration section -->
      ${
        tsConfigInfo.exists
          ? `
      <section class="card">
        <h2>TypeScript Configuration</h2>
        
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-title">Target</div>
            <div class="stat-value">${tsConfigInfo.target || "Not set"}</div>
            <div class="stat-description">JavaScript generation target</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Module</div>
            <div class="stat-value">${tsConfigInfo.module || "Not set"}</div>
            <div class="stat-description">Module code generation</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Strict Mode</div>
            <div class="stat-value">${
              tsConfigInfo.strict === true
                ? '<span class="text-success">Enabled</span>'
                : '<span class="text-warning">Disabled</span>'
            }</div>
            <div class="stat-description">Strict type checking</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Declarations</div>
            <div class="stat-value">${
              tsConfigInfo.declaration === true
                ? '<span class="text-success">Enabled</span>'
                : '<span class="text-warning">Disabled</span>'
            }</div>
            <div class="stat-description">Generate .d.ts files</div>
          </div>
        </div>
        
        <h3>Compiler Options</h3>
        <table class="key-value-table">
          <tr>
            <td>Declaration Maps</td>
            <td>${
              tsConfigInfo.declarationMap === true
                ? '<span class="text-success">Enabled</span>'
                : '<span class="text-warning">Disabled</span>'
            }</td>
          </tr>
          <tr>
            <td>Source Maps</td>
            <td>${
              tsConfigInfo.sourceMap === true
                ? '<span class="text-success">Enabled</span>'
                : '<span class="text-warning">Disabled</span>'
            }</td>
          </tr>
          <tr>
            <td>ES Module Interop</td>
            <td>${
              tsConfigInfo.esModuleInterop === true
                ? '<span class="text-success">Enabled</span>'
                : '<span class="text-warning">Disabled</span>'
            }</td>
          </tr>
          <tr>
            <td>Skip Lib Check</td>
            <td>${
              tsConfigInfo.skipLibCheck === true
                ? '<span class="text-success">Enabled</span>'
                : '<span class="text-warning">Disabled</span>'
            }</td>
          </tr>
          <tr>
            <td>Incremental Builds</td>
            <td>${
              tsConfigInfo.incremental === true
                ? '<span class="text-success">Enabled</span>'
                : '<span class="text-warning">Disabled</span>'
            }</td>
          </tr>
          ${
            tsConfigInfo.jsx
              ? `
          <tr>
            <td>JSX Support</td>
            <td>${tsConfigInfo.jsx}</td>
          </tr>
          `
              : ""
          }
        </table>
      </section>
      `
          : ""
      }
      
      <!-- Dependencies section -->
      ${
        dependencyInfo.exists || dependencySizeInfo?.exists
          ? `
      <section class="card">
        <h2>Dependencies</h2>
        
        <div class="stat-grid">
          ${
            dependencyInfo.exists
              ? `
          <div class="stat-card">
            <div class="stat-title">Runtime Dependencies</div>
            <div class="stat-value">${dependencyInfo.dependencyCounts?.dependencies}</div>
            <div class="stat-description">Direct dependencies</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Dev Dependencies</div>
            <div class="stat-value">${dependencyInfo.dependencyCounts?.devDependencies}</div>
            <div class="stat-description">Development dependencies</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Peer Dependencies</div>
            <div class="stat-value">${dependencyInfo.dependencyCounts?.peerDependencies}</div>
            <div class="stat-description">Peer dependencies</div>
          </div>
          `
              : ""
          }
          
          ${
            dependencySizeInfo?.exists && dependencySizeInfo.totalSize
              ? `
          <div class="stat-card">
            <div class="stat-title">node_modules Size</div>
            <div class="stat-value">${formatBytes(
              dependencySizeInfo?.totalSize || 0
            )}</div> 
            <div class="stat-description">Total installed dependencies size</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Transitive Dependencies</div>
            <div class="stat-value">${
              dependencySizeInfo.transitiveDependenciesCount
            }</div>
            <div class="stat-description">Indirect dependencies</div>
          </div>
          `
              : ""
          }
        </div>
        
        ${
          dependencyInfo.exists &&
          dependencyInfo.tooling &&
          (dependencyInfo.tooling.buildTools.length > 0 ||
            dependencyInfo.tooling.testingTools.length > 0 ||
            dependencyInfo.tooling.lintingTools.length > 0)
            ? `
        <h3>Tooling</h3>
        <table class="key-value-table">
          ${
            dependencyInfo.tooling.buildTools.length > 0
              ? `
          <tr>
            <td>Build Tools</td>
            <td>${dependencyInfo.tooling.buildTools.join(", ")}</td>
          </tr>
          `
              : ""
          }
          
          ${
            dependencyInfo.tooling.testingTools.length > 0
              ? `
          <tr>
            <td>Testing Tools</td>
            <td>${dependencyInfo.tooling.testingTools.join(", ")}</td>
          </tr>
          `
              : ""
          }
          
          ${
            dependencyInfo.tooling.lintingTools.length > 0
              ? `
          <tr>
            <td>Linting Tools</td>
            <td>${dependencyInfo.tooling.lintingTools.join(", ")}</td>
          </tr>
          `
              : ""
          }
        </table>
        `
            : ""
        }
        
        ${
          dependencySizeInfo?.exists &&
          dependencySizeInfo.dependencySizes &&
          dependencySizeInfo.dependencySizes.length > 0
            ? `
        <h3>Largest Dependencies</h3>
        <table class="file-table">
          <tr>
            <th>Package</th>
            <th>Version</th>
            <th>Size</th>
          </tr>
          ${dependencySizeInfo.dependencySizes
            .slice(0, 10)
            .map(
              dep => `
          <tr>
            <td>${dep.name}</td>
            <td>${dep.version}</td>
            <td>${formatBytes(dep.size)}</td>
          </tr>
          `
            )
            .join("")}
        </table>
        `
            : ""
        }
      </section>
      `
          : ""
      }
    <!-- Historical Data Graphs Section -->
    ${
      historicalData && historicalData.length > 1
        ? `
    <section class="card">
    <h2>Historical Data</h2>
    <div class="chart-container">
        <canvas id="buildTimeChart"></canvas>
    </div>
    <div class="chart-container">
        <canvas id="distSizeChart"></canvas>
    </div>
    <div class="chart-container">
        <canvas id="dependencyCountChart"></canvas>
    </div>
    </section>
    
    <script>
    // Global variable for historical data
    window.historicalData = ${JSON.stringify(historicalData)};
    </script>
    `
        : ""
    }

      
     <!-- Package size section -->
      ${
        packageSizeInfo?.success
          ? `
      <section class="card">
        <h2>Package Size Analysis</h2>
        
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-title">Packed Size</div>
            <div class="stat-value">${formatBytes(
              packageSizeInfo.packedSize || 0
            )}</div>
            <div class="stat-description">Size of the npm tarball</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Unpacked Size</div>
            <div class="stat-value">${formatBytes(
              packageSizeInfo.unpackedSize || 0
            )}</div>
            <div class="stat-description">Size after installation</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Compression Ratio</div>
            <div class="stat-value">${(
              (packageSizeInfo.compressionRatio || 0) * 100
            ).toFixed(1)}%</div>
            <div class="stat-description">Lower is better</div>
          </div>
        </div>
        
        <h3>Largest Files in Package</h3>
        <table class="file-table">
          <tr>
            <th>File</th>
            <th>Size</th>
          </tr>
          ${
            packageSizeInfo.largestFiles
              ?.map(
                file => `
          <tr>
            <td>${file.path}</td>
            <td>${formatBytes(file.size)}</td>
          </tr>
          `
              )
              .join("") || ""
          }
        </table>
      </section>
      `
          : ""
      }
      
      <!-- Insights section -->
      <section class="card">
        <h2>Insights and Recommendations</h2>
        
        <ul class="insights-list">
          ${categorizedInsights
            .map(
              insight => `
          <li class="severity-${insight.severity}">${insight.text}</li>
          `
            )
            .join("")}
        </ul>
      </section>
    </div>
    
    <footer>
      <p>Generated by TypeScript Package Analyzer on ${new Date().toLocaleString()}</p>
    </footer>

    <!-- Scripts for rendering charts -->
    <script>
    function initializeHistoricalCharts(historicalData) {
      // Ensure historicalData is parsed and an array
      const data = Array.isArray(historicalData) 
        ? historicalData 
        : (typeof historicalData === 'string' 
            ? JSON.parse(historicalData) 
            : []);

      // Verify data is not empty and has expected structure
      if (data.length === 0) {
        console.warn('No historical data available for charts');
        return;
      }

      // Robust data extraction with fallbacks
      const labels = data.map(item => {
        try {
          return new Date(item.timestamp || Date.now()).toLocaleDateString();
        } catch {
          return 'Unknown Date';
        }
      });

      const buildTimes = data.map(item => {
        try {
          return item.buildTimeInfo && item.buildTimeInfo.success 
            ? (item.buildTimeInfo.buildTime || 0) / 1000 
            : null;
        } catch {
          return null;
        }
      });

      const distSizes = data.map(item => {
        try {
          return item.distInfo && item.distInfo.exists && item.distInfo.sizeStats
            ? (item.distInfo.sizeStats.totalSize || 0) / (1024 * 1024) 
            : null;
        } catch {
          return null;
        }
      });

      const dependencyCounts = data.map(item => {
        try {
          return item.dependencyInfo && item.dependencyInfo.exists && item.dependencyInfo.dependencyCounts
            ? (item.dependencyInfo.dependencyCounts.dependencies || 0)
            : null;
        } catch {
          return null;
        }
      });

      // Utility function to create chart
      function createChart(elementId, label, data, borderColor, backgroundColorRGBA) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return null; // Exit if canvas not found

        // Filter out null values for better chart rendering
        const filteredData = data.filter(value => value !== null);
        const filteredLabels = labels.filter((_, index) => data[index] !== null);

        if (filteredData.length === 0) {
          console.warn('No data to display for ' + elementId);
          return null;
        }

        return new Chart(ctx, {
          type: 'line',
          data: {
            labels: filteredLabels,
            datasets: [{
              label: label,
              data: filteredData,
              borderColor: borderColor,
              backgroundColor: backgroundColorRGBA,
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true },
              tooltip: { 
                callbacks: { 
                  label: function(context) {
                    const value = context.raw;
                    switch(elementId) {
                      case 'buildTimeChart':
                        return value.toFixed(2) + ' seconds';
                      case 'distSizeChart':
                        return value.toFixed(2) + ' MB';
                      case 'dependencyCountChart':
                        return value + ' dependencies';
                      default:
                        return value.toString();
                    }
                  } 
                } 
              }
            },
            scales: {
              y: { 
                title: { 
                  display: true, 
                  text: elementId === 'buildTimeChart' ? 'Time (seconds)' 
                       : elementId === 'distSizeChart' ? 'Size (MB)' 
                       : 'Count' 
                } 
              },
              x: { title: { display: true, text: 'Date' } }
            }
          }
        });
      }

      // Create charts if data exists
      if (buildTimes.some(value => value !== null)) {
        createChart('buildTimeChart', 'Build Time (seconds)', buildTimes, '#3178c6', 'rgba(49, 120, 198, 0.2)');
      }

      if (distSizes.some(value => value !== null)) {
        createChart('distSizeChart', 'Distribution Size (MB)', distSizes, '#4caf50', 'rgba(76, 175, 80, 0.2)');
      }

      if (dependencyCounts.some(value => value !== null)) {
        createChart('dependencyCountChart', 'Dependency Count', dependencyCounts, '#ff9800', 'rgba(255, 152, 0, 0.2)');
      }
    }

    // Initialize charts when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Try parsing historical data from a global variable or script tag
      let historicalData = window.historicalData || [];
      
      // If it's a string, try to parse it
      if (typeof historicalData === 'string') {
        try {
          historicalData = JSON.parse(historicalData);
        } catch (error) {
          console.error('Failed to parse historical data:', error);
          historicalData = [];
        }
      }

      // Initialize charts with the parsed data
      initializeHistoricalCharts(historicalData);
      
      // Initialize donut charts
      drawDonutChart('filesDonutChart', [
        ${distInfo.exists ? distInfo.fileStats?.jsFiles || 0 : 0},
        ${distInfo.exists ? distInfo.fileStats?.dtsFiles || 0 : 0},
        ${distInfo.exists ? distInfo.fileStats?.mapFiles || 0 : 0},
        ${distInfo.exists ? distInfo.fileStats?.dtsMapFiles || 0 : 0},
        ${distInfo.exists ? distInfo.fileStats?.otherFiles || 0 : 0}
      ], ['#3178c6', '#007acc', '#549bf4', '#8abfff', '#cccccc']);
      
      drawDonutChart('sizeDonutChart', [
        ${distInfo.exists ? distInfo.sizeStats?.jsSize || 0 : 0},
        ${distInfo.exists ? distInfo.sizeStats?.dtsSize || 0 : 0},
        ${distInfo.exists ? distInfo.sizeStats?.mapSize || 0 : 0},
        ${distInfo.exists ? distInfo.sizeStats?.dtsMapSize || 0 : 0},
        ${distInfo.exists ? distInfo.sizeStats?.otherSize || 0 : 0}
      ], ['#3178c6', '#007acc', '#549bf4', '#8abfff', '#cccccc']);
    });
    
    // Simple donut chart rendering
    function drawDonutChart(canvasId, data, colors) {
      const canvas = document.getElementById(canvasId);
      if (!canvas || !canvas.getContext) return;
      
      const ctx = canvas.getContext('2d');
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;
      const innerRadius = radius * 0.6;
      
      // Calculate total for percentages
      const total = data.reduce((sum, val) => sum + val, 0);
      if (total === 0) return; // No data to display
      
      // Draw donut segments
      let startAngle = -Math.PI / 2; // Start from top
      
      for (let i = 0; i < data.length; i++) {
        if (data[i] === 0) continue;
        
        const sliceAngle = 2 * Math.PI * data[i] / total;
        const endAngle = startAngle + sliceAngle;
        
        // Draw the slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        
        ctx.fillStyle = colors[i];
        ctx.fill();
        
        startAngle = endAngle;
      }
      
      // Draw inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    </script>
  </body>
</html>`;

  // Save the HTML report
  const htmlReportPath = path.join(
    config.outputDir,
    `${config.packageName}-analysis.html`
  );
  writeFileWithDirs(htmlReportPath, htmlContent);

  console.log(`🌐 HTML report saved to: ${htmlReportPath}`);
}
