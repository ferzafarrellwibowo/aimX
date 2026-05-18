'use client';

import React from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
          <div className="flex flex-col items-center gap-6 p-10 border border-white/10 rounded-2xl bg-[#0a0a0a] text-white max-w-md text-center">
            {/* Warning Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.56 20h18.88a1 1 0 00.87-1.28l-8.6-14.86a1 1 0 00-1.72 0z"
              />
            </svg>

            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-white/60">
              The game encountered an error. Try restarting.
            </p>

            <div className="flex gap-4 mt-2">
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Restart
              </button>
              <Link
                href="/"
                className="px-6 py-2.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                Back to Menu
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
