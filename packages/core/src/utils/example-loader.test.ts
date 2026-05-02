import { describe, expect, it } from 'vitest';
import {
    ADVANCED_EXAMPLES,
    BASIC_EXAMPLES,
    INTERMEDIATE_EXAMPLES,
    getAllExamples,
    getExampleByCategory,
} from './example-loader';

describe('example-loader', () => {
    it('every example has a unique id', () => {
        const ids = getAllExamples().map((e) => e.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('every example declares a category that matches its source list', () => {
        for (const ex of BASIC_EXAMPLES) expect(ex.category).toBe('basic');
        for (const ex of INTERMEDIATE_EXAMPLES) expect(ex.category).toBe('intermediate');
        for (const ex of ADVANCED_EXAMPLES) expect(ex.category).toBe('advanced');
    });

    it('getExampleByCategory returns the right bucket', () => {
        expect(getExampleByCategory('basic')).toBe(BASIC_EXAMPLES);
        expect(getExampleByCategory('intermediate')).toBe(INTERMEDIATE_EXAMPLES);
        expect(getExampleByCategory('advanced')).toBe(ADVANCED_EXAMPLES);
    });

    it('getAllExamples concatenates the three buckets in order', () => {
        const all = getAllExamples();
        expect(all.length).toBe(
            BASIC_EXAMPLES.length + INTERMEDIATE_EXAMPLES.length + ADVANCED_EXAMPLES.length,
        );
        expect(all.slice(0, BASIC_EXAMPLES.length)).toEqual(BASIC_EXAMPLES);
    });

    it('every example carries non-empty title, description, and code', () => {
        for (const ex of getAllExamples()) {
            expect(ex.title.length).toBeGreaterThan(0);
            expect(ex.description.length).toBeGreaterThan(0);
            expect(ex.code.length).toBeGreaterThan(0);
        }
    });
});
