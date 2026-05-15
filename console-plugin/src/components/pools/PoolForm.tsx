import * as React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Page,
  PageSection,
  Title,
  EmptyState,
  EmptyStateBody,
  Button,
} from '@patternfly/react-core';
import { NAMESPACE } from '../../i18n';

/**
 * PoolForm - placeholder for pool creation/editing
 * TODO: Implement full pool form wizard
 */
export const PoolForm: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACE);

  return (
    <Page style={{ height: "100%", width: "100%" }}>
      <PageSection variant="default" style={{ width: "100%" }}>
        <Title headingLevel="h1" size="2xl">
          {t('Create Pool')}
        </Title>
      </PageSection>
      <PageSection style={{ width: "100%" }}>
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            {t('Pool Form Not Yet Implemented')}
          </Title>
          <EmptyStateBody>
            {t('The pool creation form is not yet implemented. Please use kubectl or oc to create pools.')}
          </EmptyStateBody>
          <Button variant="primary" onClick={() => navigate('/vcm/pools')}>
            {t('Back to {{resource}}', { resource: t('Pools') })}
          </Button>
        </EmptyState>
      </PageSection>
    </Page>
  );
};
