"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground p-8">
          <h2 className="text-xl font-bold">문제가 발생했습니다</h2>
          <p className="text-muted-foreground text-center max-w-md">
            예상치 못한 오류가 발생했습니다. 페이지를 새로고침하면 대부분의
            문제가 해결됩니다.
          </p>
          {this.state.error && (
            <pre className="text-xs text-muted-foreground bg-muted rounded p-3 max-w-md overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleReload}>새로고침</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
