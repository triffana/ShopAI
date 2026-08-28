import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-[#F7F4EA] text-[#17211B] text-center my-12 rounded-2xl border border-[#DDE4DC] shadow-sm max-w-lg mx-auto">
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl mb-4">
            <AlertTriangle className="w-10 h-10 mx-auto" />
          </div>
          <h2 className="text-xl font-extrabold text-[#12372A] mb-2">Something went wrong</h2>
          <p className="text-xs text-[#66736A] mb-6 leading-relaxed max-w-md">
            An unexpected error occurred in this view. Please reload the page or try again.
          </p>
          {this.state.error?.message && (
            <div className="w-full p-3 bg-white rounded-xl border border-rose-100 text-left text-[11px] font-mono text-rose-800 mb-6 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-[#B7F34A] text-xs font-extrabold shadow-sm transition active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
