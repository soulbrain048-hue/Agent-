export const patterns = [
  {
    name: 'SQL Injection',
    type: 'SQL Injection',
    severity: 'CRITICAL',
    description: 'Potential SQL injection via string concatenation',
    regex: /query\s*=\s*['"]\s*\+|sql\s*['"]\s*\+|\`\s*\+.*SELECT/i
  },
  {
    name: 'XSS - dangerouslySetInnerHTML',
    type: 'XSS',
    severity: 'HIGH',
    description: 'Use of dangerouslySetInnerHTML without sanitization',
    regex: /dangerouslySetInnerHTML|innerHTML\s*=/
  },
  {
    name: 'RCE - eval()',
    type: 'RCE',
    severity: 'CRITICAL',
    description: 'Dangerous eval() function usage',
    regex: /\beval\s*\(|\bexec\s*\(/
  },
  {
    name: 'Hardcoded Credentials',
    type: 'Auth Issue',
    severity: 'CRITICAL',
    description: 'Hardcoded API keys or credentials',
    regex: /password\s*=\s*['"]/i
  },
  {
    name: 'Path Traversal',
    type: 'Path Traversal',
    severity: 'HIGH',
    description: 'Potential path traversal vulnerability',
    regex: /\.\.\s*\/|\.\.\s*\\/
  },
  {
    name: 'TODO - Security Issue',
    type: 'Logic Bug',
    severity: 'MEDIUM',
    description: 'TODO comment with security concern',
    regex: /TODO.*security|TODO.*auth|FIXME.*vuln/i
  },
  {
    name: 'Prototype Pollution',
    type: 'Prototype Pollution',
    severity: 'HIGH',
    description: 'Potential prototype pollution vulnerability',
    regex: /obj\[.*\]\s*=|for.*in.*obj|merge\(.*obj/i
  },
  {
    name: 'Weak Crypto',
    type: 'Cryptography',
    severity: 'HIGH',
    description: 'Use of weak cryptographic algorithms',
    regex: /md5|sha1|DES|RC4/i
  }
];
