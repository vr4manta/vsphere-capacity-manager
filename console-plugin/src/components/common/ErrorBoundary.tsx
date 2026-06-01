import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  EmptyStateBody,
  Title,
  Button,
  Page,
  PageSection,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { NAMESPACE } from '../../i18n';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * ErrorBoundary catches React component errors and displays a fallback UI
 * This prevents the entire plugin from crashing when a component fails
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.hash = '/vcm/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onReset: () => void;
}

/**
 * ErrorFallback displays a user-friendly error message when a component crashes
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { t } = useTranslation(NAMESPACE);

  return (
    <Page style={{ height: '100%', width: '100%' }}>
      <PageSection variant="default" style={{ width: '100%' }}>
        <EmptyState>
          <ExclamationCircleIcon
            style={{ fontSize: '3rem', color: 'var(--pf-t--global--color--status--danger--default)' }}
          />
          <Title headingLevel="h1" size="lg">
            {t('Something went wrong')}
          </Title>
          <EmptyStateBody>
            {t('An unexpected error occurred in the vSphere Capacity Manager plugin.')}
            <br />
            <br />
            {error && (
              <details style={{ textAlign: 'left', marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  {t('Error details')}
                </summary>
                <pre
                  style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxWidth: '600px',
                  }}
                >
                  {error.toString()}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </EmptyStateBody>
          <Button variant="primary" onClick={onReset}>
            {t('Return to Dashboard')}
          </Button>
        </EmptyState>
      </PageSection>
    </Page>
  );
};
