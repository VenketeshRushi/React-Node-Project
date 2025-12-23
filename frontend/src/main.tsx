// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import RootProvider from "./providers/RootProvider.tsx";
import ErrorBoundary from "./components/ErrorBoundary";

const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error("Application Error:", { error, errorInfo });

  // Send to your error tracking service (Sentry, LogRocket, etc
  // fetch('/api/log-error', {
  //   method: 'POST',
  //   body: JSON.stringify({ error: error.message, stack: error.stack })
  // });
};

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <ErrorBoundary onError={handleError}>
    <RootProvider>
      <App />
    </RootProvider>
  </ErrorBoundary>
  // </StrictMode>
);
