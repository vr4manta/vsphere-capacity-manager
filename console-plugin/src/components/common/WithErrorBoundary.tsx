import * as React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Higher-order component that wraps a component with ErrorBoundary
 * Usage: export const MyComponent = withErrorBoundary(MyComponentImpl);
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
