import React from 'react';
import { Button } from './Button';

export interface ConsoleProps {
  output: string;
  error?: string;
  isLoading?: boolean;
  executionTime?: number;
  onClear?: () => void;
}

export const Console: React.FC<ConsoleProps> = ({
  output,
  error,
  isLoading = false,
  executionTime = 0,
  onClear,
}) => {
  return (
    <div className="flex flex-col h-full border border-gray-300 rounded-md bg-gray-50" data-testid="console">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-gray-100">
        <span className="text-sm font-semibold">Console Output</span>
        <div className="flex items-center gap-2">
          {executionTime > 0 && <span className="text-xs text-gray-600">{executionTime.toFixed(2)}ms</span>}
          {onClear && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm" data-testid="console-output">
        {isLoading && <span className="text-blue-600">⏳ Running...</span>}
        {output && <pre className="text-gray-800 whitespace-pre-wrap">{output}</pre>}
        {error && <pre className="text-red-600 whitespace-pre-wrap">{error}</pre>}
        {!output && !error && !isLoading && <span className="text-gray-400">Ready</span>}
      </div>
    </div>
  );
};
