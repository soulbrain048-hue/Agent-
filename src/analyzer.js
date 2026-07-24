import chalk from 'chalk';
import { Scanner } from './scanner.js';
import fs from 'fs/promises';

export class Analyzer {
  constructor(token) {
    this.scanner = new Scanner(token);
  }

  async analyze(repository, options = {}) {
    const findings = [];
    
    try {
      const scanResults = await this.scanner.scan(repository, options);
      
      for (const vuln of scanResults.vulnerabilities) {
        findings.push({
          id: `VULN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: vuln.type,
          severity: vuln.severity,
          file: vuln.file,
          description: vuln.description,
          cvss: this.calculateCVSS(vuln.severity),
          recommendation: this.getRecommendation(vuln.type),
          url: vuln.url,
          timestamp: new Date().toISOString()
        });
      }
      
      if (options.output) {
        const report = this.generateReport(findings);
        await fs.writeFile(options.output, report, 'utf8');
        console.log(chalk.green(`✅ Report saved: ${options.output}`));
      }
      
      return findings;
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  generateReport(findings) {
    let report = '# 🔍 Deep Analysis Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    const bySeverity = {};
    findings.forEach(f => {
      if (!bySeverity[f.severity]) bySeverity[f.severity] = [];
      bySeverity[f.severity].push(f);
    });
    
    for (const [severity, items] of Object.entries(bySeverity)) {
      report += `## ${severity} (${items.length})\n\n`;
      items.forEach((item, idx) => {
        report += `### ${idx + 1}. ${item.type}\n`;
        report += `- **File**: ${item.file}\n`;
        report += `- **CVSS**: ${item.cvss}\n`;
        report += `- **Fix**: ${item.recommendation}\n\n`;
      });
    }
    
    return report;
  }

  calculateCVSS(severity) {
    const scores = { CRITICAL: 9.0, HIGH: 7.0, MEDIUM: 5.0, LOW: 3.0 };
    return scores[severity] || 0;
  }

  getRecommendation(type) {
    const recommendations = {
      'SQL Injection': 'Use parameterized queries and prepared statements',
      'XSS': 'Sanitize user input, implement CSP headers',
      'RCE': 'Avoid eval(), use safe APIs only',
      'Auth Issue': 'Remove hardcoded credentials, use secrets manager',
      'Path Traversal': 'Validate and sanitize file paths',
      'Prototype Pollution': 'Validate object properties, use Object.create(null)',
      'Cryptography': 'Use SHA-256 or stronger algorithms',
      'Logic Bug': 'Review and test edge cases'
    };
    return recommendations[type] || 'Review vulnerability immediately';
  }
}