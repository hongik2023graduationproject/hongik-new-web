import { describe, expect, it } from 'vitest';
import { formatCode, validateSyntax } from './code-formatter';

describe('formatCode', () => {
    it('preserves a single line as-is', () => {
        expect(formatCode('출력("안녕")')).toBe('출력("안녕")');
    });

    it('indents the body of a block opened with a colon', () => {
        const input = `함수 인사(이름):
리턴 "안녕, " + 이름`;
        const expected = `함수 인사(이름):
    리턴 "안녕, " + 이름`;
        expect(formatCode(input)).toBe(expected);
    });

    it('dedents continuation keywords (아니면, 실패, 마침내)', () => {
        const input = `만약 x > 0:
출력("양수")
아니면:
출력("음수 또는 0")`;
        const formatted = formatCode(input);
        // 아니면 must sit at the same indent level as 만약, not nested under it.
        expect(formatted).toBe(`만약 x > 0:
    출력("양수")
아니면:
    출력("음수 또는 0")`);
    });

    it('keeps blank lines blank (does not indent them)', () => {
        const input = `함수 a():
리턴 1

함수 b():
리턴 2`;
        const formatted = formatCode(input);
        // Blank line in the middle stays empty, not '    '.
        const lines = formatted.split('\n');
        expect(lines[2]).toBe('');
    });

    it('never produces negative indent even when dedent keywords appear at top level', () => {
        // Top-level dedent keyword should clamp to 0, not throw or produce weird whitespace.
        const formatted = formatCode('아니면:\n리턴 1');
        expect(formatted.startsWith('아니면:')).toBe(true);
    });
});

describe('validateSyntax', () => {
    it('returns valid for balanced, fully-closed code', () => {
        const result = validateSyntax('함수 f() {\n  리턴 "ok"\n}');
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
    });

    it('flags unclosed braces', () => {
        const result = validateSyntax('함수 f() {\n  리턴 "ok"');
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('닫히지 않은'))).toBe(true);
    });

    it('flags an unmatched closing brace', () => {
        const result = validateSyntax('}');
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('여는 중괄호 없이'))).toBe(true);
    });

    it('flags an unclosed string literal with the line number', () => {
        const result = validateSyntax('정수 x = 1\n출력("열림');
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('2번째 줄'))).toBe(true);
    });

    it('ignores braces and quotes inside line comments', () => {
        // The leading // means the line should be skipped by the unclosed-string check.
        const result = validateSyntax('// "이건 주석 안의 문자열');
        expect(result.valid).toBe(true);
    });
});
