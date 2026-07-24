import chalk from 'chalk';
import { Scanner } from './scanner.js';
import fs from 'fs/promises';

export class Reporter {
  constructor(token) {
    this.scanner = new Scanner(token);
  }

  async generate(repository, options = {}) {
    try {
      const scanResults = await this.scanner.scan(repository, options);
      
      let report;
      if (options.format === 'json') {
        report = JSON.stringify(scanResults, null, 2);
      } else {
        report = this.generateMarkdownReport(scanResults);
      }
      
      const outputPath = options.output || `report-${Date.now()}.md`;
      await fs.writeFile(outputPath, report, 'utf8');
      
      this.displaySummary(scanResults);
      
      return { success: true, path: outputPath };
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  generateMarkdownReport(results) {
    let report = `# 🔍 Bug Hunting Report\n\n`;
    report += `**Repository**: ${results.repository}\n`;
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Files Scanned**: ${results.totalFiles}\n\n`;
    
    report += `## Summary\n\n`;
    report += `| Severity | Count |\n`;
    report += `|----------|-------|\n`;
    report += `| 🔴 Critical | ${results.summary.critical} |\n`;
    report += `| 🟠 High | ${results.summary.high} |\n`;
    report += `| 🟡 Medium | ${results.summary.medium} |\n`;
    report += `| 🟢 Low | ${results.summary.low} |\n`;
    report += `| **Total** | **${results.summary.total}** |\n\n`;
    
    if (results.vulnerabilities.length > 0) {
      report += `## Findings\n\n`;
      results.vulnerabilities.forEach((vuln, idx) => {
        report += `### ${idx + 1}. ${vuln.type}\n\n`;
        report += `**Severity**: ${vuln.severity}  \n`;
        report += `**File**: \`${vuln.file}\`  \n`;
        report += `**Description**: ${vuln.description}  \n`;
        report += `**URL**: [View File](${vuln.url})  \n\n`;
      });
    } else {
      report += `## Status\n\n✅ No vulnerabilities found!\n\n`;
    }
    
    return report;
  }

  displaySummary(results) {
    console.log(chalk.cyan('\n' + '═'.repeat(60)));
    console.log(chalk.cyan.bold('REPORT SUMMARY'));
    console.log(chalk.cyan('═'.repeat(60)) + '\n');
    
    console.log(`Repository: ${results.repository}`);
    console.log(`Files Scanned: ${results.totalFiles}`);
    console.log(`Total Vulnerabilities: ${results.summary.total}\n`);
    
    console.log(chalk.red(`🔴 Critical: ${results.summary.critical}`));
    console.log(chalk.yellow(`🟠 High: ${results.summary.high}`));
    console.log(chalk.blue(`🟡 Medium: ${results.summary.medium}`));
    console.log(chalk.green(`🟢 Low: ${results.summary.low}\n`));
  }
}
