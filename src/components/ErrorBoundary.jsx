import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/20 rounded-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-gray-400 mb-4">
                An error occurred while rendering this component. This might be due to missing data or a configuration issue.
              </p>
            </div>
            
            {this.props.showDetails && this.state.error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-400/20 rounded-lg text-left">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Error Details:</h3>
                <pre className="text-xs text-red-300 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full px-4 py-2 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300 flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;