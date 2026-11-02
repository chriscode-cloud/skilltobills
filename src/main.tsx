import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-[#D4F636]/10 text-[#D4F636] rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
              !
            </div>
            <h1 className="text-xl font-extrabold text-white">Something went wrong</h1>
            <p className="text-xs text-zinc-400">
              An unexpected display issue occurred. Click below to reload the app stage.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.assign("/dashboard");
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#D4F636] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#c2e42b] transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
