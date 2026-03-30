"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="rounded-lg p-3 bg-th-card border border-th-term-err/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-sm text-th-term-err">error</span>
            <span className="font-mono text-xs text-th-term-err">Render Error</span>
          </div>
          <p className="font-mono text-[10px] text-th-text-muted">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="font-mono text-[10px] mt-2 px-2 py-1 rounded bg-th-primary-bg text-th-primary border border-th-primary-border"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
