#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { Scanner } from './src/scanner.js';
import { Analyzer } from './src/analyzer.js';
import { Reporter } from './src/reporters.js';
import { interactiveMode } from './src/interactive.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const VERSION = '1.0.0';

console.log(chalk.cyan.bold('\n🔍 Bug Hunting Agent v' + VERSION));
console.log(chalk.cyan('━'.repeat(60)) + '\n');

program
  .name('bug-hunting-agent')
  .description('Deep research-based bug hunting CLI tool')
  .version(VERSION);

program
  .command('scan <repository>')
  .description('Quick vulnerability scan')
  .option('-f, --format <type>', 'Output format', 'console')
  .action(async (repository, options) => {
    try {
      const scanner = new Scanner(process.env.GITHUB_TOKEN);
      console.log(chalk.yellow(`\n📍 Scanning: ${repository}`));
      const results = await scanner.scan(repository, options);
      
      if (options.format === 'json') {
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log(chalk.green(`\n✅ Found ${results.summary.total} vulnerabilities`));
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('analyze <repository>')
  .description('Deep research analysis')
  .option('-o, --output <file>', 'Save results to file')
  .action(async (repository, options) => {
    try {
      const analyzer = new Analyzer(process.env.GITHUB_TOKEN);
      console.log(chalk.yellow(`\n🔬 Analyzing: ${repository}`));
      const findings = await analyzer.analyze(repository, options);
      console.log(chalk.green(`✅ Analysis complete! Found ${findings.length} issues`));
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('report <repository>')
  .description('Generate report')
  .option('-f, --format <type>', 'Format (markdown, json)', 'markdown')
  .option('-o, --output <file>', 'Output file')
  .action(async (repository, options) => {
    try {
      const reporter = new Reporter(process.env.GITHUB_TOKEN);
      console.log(chalk.yellow(`\n📊 Generating report...`));
      await reporter.generate(repository, options);
      console.log(chalk.green('✅ Report generated!'));
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

if (process.argv.length === 2) {
  interactiveMode().catch(error => {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  });
} else {
  program.parse(process.argv);
}