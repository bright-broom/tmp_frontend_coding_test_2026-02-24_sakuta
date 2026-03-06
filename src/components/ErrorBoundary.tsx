'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              エラーが発生しました
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              予期しないエラーが発生しました。ページを再読み込みしてください。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              ページを再読み込み
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer">
                  エラー詳細（開発モード）
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({
  title = 'データの読み込みに失敗しました',
  onRetry
}: {
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-8 bg-red-50 rounded-xl">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-800 mb-1">{title}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            再試行
          </button>
        )}
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`} />
  );
}

export function LoadingState({ message = '読み込み中...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-500 mt-3">{message}</p>
    </div>
  );
}
