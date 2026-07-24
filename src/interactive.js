import chalk from 'chalk';
import enquirer from 'enquirer';
import { Scanner } from './scanner.js';
import { Analyzer } from './analyzer.js';
import { Reporter } from './reporters.js';
import ora from 'ora';

const prompt = enquirer.prompt;

export async function interactiveMode() {
  const token = process.env.GITHUB_TOKEN || '';
  
  console.log(chalk.cyan('\n🔍 Welcome to Bug Hunting Agent\n'));
  console.log(chalk.gray('A lightweight vulnerability scanner for GitHub repositories\n'));
  
  while (true) {
    const choice = await prompt([
      {
        type: 'select',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'scan', message: '🔍 Quick Vulnerability Scan' },
          { name: 'analyze', message: '🔬 Deep Research Analysis' },
          { name: 'report', message: '📊 Generate Comprehensive Report' },
          { name: 'exit', message: '❌ Exit' }
        ]
      }
    ]);
    
    if (choice.action === 'exit') {
      console.log(chalk.green('\n✨ Thanks for using Bug Hunting Agent!\n'));
      process.exit(0);
    }
    
    const repo = await prompt([{
      type: 'input',
      name: 'repository',
      message: 'Enter repository (owner/repo):',
      validate: (val) => val.includes('/') ? true : 'Format: owner/repo'
    }]);
    
    try {
      const spinner = ora('Processing...').start();
      
      if (choice.action === 'scan') {
        const scanner = new Scanner(token);
        spinner.text = 'Scanning repository...';
        const results = await scanner.scan(repo.repository);
        spinner.succeed('Scan complete!');
        displayScanResults(results);
      } else if (choice.action === 'analyze') {
        const analyzer = new Analyzer(token);
        spinner.text = 'Analyzing repository...';
        await analyzer.analyze(repo.repository, { output: `report-${Date.now()}.md` });
        spinner.succeed('Analysis complete!');
      } else if (choice.action === 'report') {
        const reporter = new Reporter(token);
        spinner.text = 'Generating report...';
        await reporter.generate(repo.repository);
        spinner.succeed('Report generated!');
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    }
    
    const cont = await prompt([{
      type: 'confirm',
      name: 'continue',
      message: 'Continue?',
      initial: true
    }]);
    
    if (!cont.continue) {
      console.log(chalk.green('\n✨ Thanks for using Bug Hunting Agent!\n'));
      process.exit(0);
    }
  }
}

function displayScanResults(results) {
  console.log(chalk.cyan('\n' + '═'.repeat(60)));
  console.log(chalk.cyan.bold('SCAN RESULTS'));
  console.log(chalk.cyan('═'.repeat(60)) + '\n');
  
  console.log(`Repository: ${results.repository}`);
  console.log(`Files Scanned: ${results.totalFiles}`);
  console.log(`Vulnerabilities Found: ${results.summary.total}\n`);
  
  console.log(chalk.red(`🔴 Critical: ${results.summary.critical}`));
  console.log(chalk.yellow(`🟠 High: ${results.summary.high}`));
  console.log(chalk.blue(`🟡 Medium: ${results.summary.medium}`));
  console.log(chalk.green(`🟢 Low: ${results.summary.low}\n`));
  
  if (results.vulnerabilities.length > 0) {
    console.log(chalk.bold('Top Findings:\n'));
    results.vulnerabilities.slice(0, 5).forEach((vuln, idx) => {
      const icon = vuln.severity === 'CRITICAL' ? '🔴' : 
                   vuln.severity === 'HIGH' ? '🟠' : 
                   vuln.severity === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`${icon} ${vuln.type} - ${vuln.file}`);
    });
    if (results.vulnerabilities.length > 5) {
      console.log(`\n...and ${results.vulnerabilities.length - 5} more\n`);
    }
  }
}