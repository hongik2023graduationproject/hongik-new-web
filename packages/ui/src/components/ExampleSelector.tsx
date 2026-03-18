import React from 'react';
import type { CodeExample } from '@hongik/core';

export interface ExampleSelectorProps {
  examples: CodeExample[];
  onSelect: (example: CodeExample) => void;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({ examples, onSelect }) => {
  return (
    <div className="flex flex-col gap-2" data-testid="example-selector">
      <label className="text-sm font-semibold text-gray-700">Examples</label>
      <select
        onChange={(e) => {
          const example = examples.find((ex) => ex.id === e.target.value);
          if (example) onSelect(example);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Choose an example...</option>
        {examples.map((example) => (
          <option key={example.id} value={example.id}>
            {example.title}
          </option>
        ))}
      </select>
    </div>
  );
};
