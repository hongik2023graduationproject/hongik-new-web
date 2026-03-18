import React from 'react';
import { Button } from './Button';

export interface HeaderProps {
  title?: string;
  onRun?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  isRunning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Hong-ik Playground',
  onRun,
  onSave,
  onShare,
  isRunning = false,
}) => {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b border-blue-800 shadow-md">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="flex gap-3">
        {onRun && (
          <Button variant="default" size="default" onClick={onRun} disabled={isRunning}>
            {isRunning ? '⏳ Running...' : '▶️ Run'}
          </Button>
        )}
        {onSave && (
          <Button variant="secondary" size="default" onClick={onSave}>
            💾 Save
          </Button>
        )}
        {onShare && (
          <Button variant="outline" size="default" onClick={onShare}>
            🔗 Share
          </Button>
        )}
      </div>
    </header>
  );
};
