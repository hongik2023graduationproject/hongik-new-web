import React from 'react';

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
}

/**
 * Editor component - Monaco Editor integration
 * Actual Monaco Editor will be loaded dynamically in the playground app
 */
export const Editor: React.FC<EditorProps> = ({ value, onChange, language = 'hongik', height = '100%' }) => {
  return (
    <div
      style={{ height, width: '100%' }}
      className="border border-gray-300 rounded-md bg-white overflow-hidden"
      data-testid="code-editor"
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-language={language}
        className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
        placeholder={`// Write ${language} code here...`}
      />
    </div>
  );
};
