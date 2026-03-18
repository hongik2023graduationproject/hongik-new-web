/**
 * Hong-ik Playground Core Types
 */
export interface PlaygroundState {
    code: string;
    output: string;
    isLoading: boolean;
    error: string | null;
    theme: 'light' | 'dark';
    savedExamples: Record<string, string>;
    executionHistory: ExecutionRecord[];
}
export interface ExecutionRecord {
    id: string;
    code: string;
    output: string;
    timestamp: number;
    executionTime: number;
}
export interface WasmExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    executionTime: number;
}
export interface CodeExample {
    id: string;
    title: string;
    category: 'basic' | 'intermediate' | 'advanced';
    description: string;
    code: string;
    expectedOutput?: string;
}
export interface PlaygroundConfig {
    maxExecutionTime: number;
    maxCodeLength: number;
    maxHistorySize: number;
    enableCollaboration: boolean;
    enableSharing: boolean;
}
//# sourceMappingURL=playground.d.ts.map