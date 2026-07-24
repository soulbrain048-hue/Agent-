import axios from 'axios';
import chalk from 'chalk';
import { patterns } from './patterns.js';

export class Scanner {
  constructor(token) {
    this.token = token;
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: token ? { Authorization: `token ${token}` } : {}
    });
  }

  async scan(repository, options = {}) {
    const vulnerabilities = [];
    
    try {
      const [owner, repo] = repository.split('/');
      console.log(chalk.gray('Fetching repository data...'));
      
      const files = await this.getRepositoryFiles(owner, repo);
      console.log(chalk.gray(`Found ${files.length} files to scan...`));
      
      for (const file of files) {
        const fileVulns = await this.scanFile(file, owner, repo);
        vulnerabilities.push(...fileVulns);
      }
      
      return {
        repository,
        timestamp: new Date().toISOString(),
        totalFiles: files.length,
        vulnerabilities: vulnerabilities.sort((a, b) => {
          const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return order[a.severity] - order[b.severity];
        }),
        summary: {
          critical: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
          high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
          medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
          low: vulnerabilities.filter(v => v.severity === 'LOW').length,
          total: vulnerabilities.length
        }
      };
    } catch (error) {
      throw new Error(`Scan failed: ${error.message}`);
    }
  }

  async getRepositoryFiles(owner, repo) {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/git/trees/HEAD`, {
        params: { recursive: 1 }
      });
      return response.data.tree
        .filter(item => item.type === 'blob')
        .slice(0, 100);
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not fetch file tree'));
      return [];
    }
  }

  async scanFile(file, owner, repo) {
    const vulnerabilities = [];
    
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/contents/${file.path}`);
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      
      for (const pattern of patterns) {
        if (pattern.regex.test(content)) {
          vulnerabilities.push({
            type: pattern.type,
            severity: pattern.severity,
            file: file.path,
            description: pattern.description,
            url: `https://github.com/${owner}/${repo}/blob/HEAD/${file.path}`
          });
        }
      }
    } catch (error) {
      // Skip file on error
    }
    
    return vulnerabilities;
  }
}