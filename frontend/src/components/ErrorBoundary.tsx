import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center bg-background px-4'>
          <div className='max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8'>
            <div className='flex items-center justify-center size-12 mx-auto bg-destructive/10 rounded-full mb-4'>
              <AlertTriangle className='size-6 text-destructive' />
            </div>

            <h1 className='text-2xl font-bold text-foreground text-center mb-2'>
              Oops! Something went wrong
            </h1>

            <p className='text-muted-foreground text-center mb-6'>
              We're sorry for the inconvenience. The application encountered an
              unexpected error.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className='mb-6 p-4 bg-muted rounded-lg border border-border'>
                <summary className='cursor-pointer font-medium text-sm text-foreground mb-2'>
                  Error Details (Dev Only)
                </summary>
                <pre className='text-xs text-destructive overflow-auto mt-2'>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className='flex flex-col gap-3'>
              <Button
                onClick={this.resetError}
                className='w-full rounded-lg font-semibold'
              >
                Try Again
              </Button>

              <div className='flex flex-col sm:flex-row gap-3'>
                <Button
                  onClick={() => window.location.reload()}
                  variant='secondary'
                  className='flex-1 rounded-lg font-semibold'
                >
                  Refresh Page
                </Button>

                <Button
                  onClick={() => (window.location.href = "/")}
                  variant='outline'
                  className='flex-1 rounded-lg font-semibold'
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
