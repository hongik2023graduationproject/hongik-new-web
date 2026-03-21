/**
 * Code formatting utilities for Hong-ik language
 */

const OPEN_BRACES = ['{'];
const CLOSE_BRACES = ['}'];
const DEDENT_KEYWORDS = ['아니면', '아니라면', '실패', '마침내'];

export function formatCode(code: string): string {
  const lines = code.split('\n');
  const formatted: string[] = [];
  let indentLevel = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      formatted.push('');
      continue;
    }

    // Decrease indent for closing braces or dedent keywords
    if (CLOSE_BRACES.some((b) => trimmed.startsWith(b))) {
      indentLevel = Math.max(0, indentLevel - 1);
    } else if (DEDENT_KEYWORDS.some((kw) => trimmed.startsWith(kw))) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formatted.push('  '.repeat(indentLevel) + trimmed);

    // Increase indent after opening braces
    if (OPEN_BRACES.some((b) => trimmed.endsWith(b))) {
      indentLevel++;
    }

  }

  return formatted.join('\n');
}

export function validateSyntax(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check balanced braces
  let braceCount = 0;
  for (const ch of code) {
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
    if (braceCount < 0) {
      errors.push('닫는 중괄호 "}"가 여는 중괄호 없이 사용되었습니다.');
      break;
    }
  }
  if (braceCount > 0) {
    errors.push(`닫히지 않은 중괄호가 ${braceCount}개 있습니다.`);
  }

  // Check unclosed strings
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comment lines
    if (line.trim().startsWith('//')) continue;

    let inString = false;
    let stringChar = '';
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (inString) {
        if (ch === '\\') {
          j++; // skip escape
        } else if (ch === stringChar) {
          inString = false;
        }
      } else {
        if (ch === '"' || ch === "'") {
          inString = true;
          stringChar = ch;
        }
      }
    }
    if (inString) {
      errors.push(`${i + 1}번째 줄: 문자열이 닫히지 않았습니다.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
