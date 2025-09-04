
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
          <div className="w-full max-w-lg p-8 space-y-4 bg-gray-900 rounded-2xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-red-500">Something went wrong.</h1>
            <p className="text-gray-400">
              An unexpected error occurred. Please try refreshing the page. If the problem persists, check the browser's developer console for more details.
            </p>
            {this.state.error && (
               <pre className="text-left text-sm text-red-300 bg-gray-800 p-4 rounded-lg overflow-auto">
                {this.state.error.toString()}
               </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
