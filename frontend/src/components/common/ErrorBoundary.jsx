import { Component } from 'react';
import { Card } from './Card';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {

    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <Card className="max-w-md text-center" padding="lg">
            <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--text)' }}
            >
              Something went wrong
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--text-muted)' }}
            >
              An unexpected error occurred. You can try again or reload the page.
            </p>
            {this.state.error?.message && (
              <p
                className="text-xs mb-4 font-mono break-words"
                style={{ color: 'var(--danger)' }}
              >
                {this.state.error.message}
              </p>
            )}
            <button type="button" onClick={this.handleReset} className="btn-primary">
              Try Again
            </button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
