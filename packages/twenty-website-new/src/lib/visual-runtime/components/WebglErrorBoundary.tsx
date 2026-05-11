'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { WebGlUnavailableError } from '../utils/visual-runtime-policy';

type WebGlErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type WebGlErrorBoundaryState = {
  hasFailed: boolean;
};

export class WebGlErrorBoundary extends Component<
  WebGlErrorBoundaryProps,
  WebGlErrorBoundaryState
> {
  state: WebGlErrorBoundaryState = { hasFailed: false };

  static getDerivedStateFromError(): WebGlErrorBoundaryState {
    return { hasFailed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      const isExpectedDenial = error instanceof WebGlUnavailableError;
      if (!isExpectedDenial) {
        console.error('WebGL visual failed:', error, info);
      }
    }
  }

  render() {
    if (this.state.hasFailed) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
