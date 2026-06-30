'use client';

import { Component, type ReactNode } from 'react';

type VisualErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type VisualErrorBoundaryState = {
  hasError: boolean;
};

// A crashed scene degrades to its poster; the page never breaks for a
// decoration.
export class VisualErrorBoundary extends Component<
  VisualErrorBoundaryProps,
  VisualErrorBoundaryState
> {
  state: VisualErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): VisualErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Visual scene crashed:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
