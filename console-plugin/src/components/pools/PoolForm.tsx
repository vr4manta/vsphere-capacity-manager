import * as React from 'react';
import { useNavigate } from 'react-router';
import {
  Page,
  PageSection,
  Title,
  EmptyState,
  EmptyStateBody,
  Button,
} from '@patternfly/react-core';

/**
 * PoolForm - placeholder for pool creation/editing
 * TODO: Implement full pool form wizard
 */
export const PoolForm: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <PageSection variant="default">
        <Title headingLevel="h1" size="2xl">
          Create Pool
        </Title>
      </PageSection>
      <PageSection>
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            Pool Form Not Yet Implemented
          </Title>
          <EmptyStateBody>
            The pool creation form is not yet implemented. Please use kubectl or oc to create
            pools.
          </EmptyStateBody>
          <Button variant="primary" onClick={() => navigate('/vcm/pools')}>
            Back to Pools
          </Button>
        </EmptyState>
      </PageSection>
    </Page>
  );
};
