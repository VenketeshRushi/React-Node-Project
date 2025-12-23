export const logError = (error: Error, errorInfo?: React.ErrorInfo) => {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    return;
  }

  // Production error logging
  // Replace with your actual error tracking service

  // Example for Sentry:
  // Sentry.captureException(error, { contexts: { react: errorInfo } });

  // Example for custom API:
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     message: error.message,
  //     stack: error.stack,
  //     componentStack: errorInfo?.componentStack,
  //     timestamp: new Date().toISOString(),
  //   }),
  // });
};
