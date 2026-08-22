import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in app tree:", error, errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  // Persisted store state (not just the crashing component's own state) is
  // the most likely repeat offender — clear it so a corrupt hero/game shape
  // can't immediately re-crash the app after reload.
  handleReset = () => {
    localStorage.removeItem("hero-tracker-store");
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className={styles.container}>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.message}>
            The app hit an unexpected error and couldn't continue. Your game
            progress may be recoverable with a reload.
          </p>
          <div className={styles.actions}>
            <button className={styles.button} onClick={this.handleReload}>
              Reload
            </button>
            <button className={styles.buttonSecondary} onClick={this.handleReset}>
              Reset app data &amp; reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
