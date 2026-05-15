import * as React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Page, PageSection, Title, Button, Flex, FlexItem } from '@patternfly/react-core';
import { ResourceList, Column } from '../common/ResourceList';
import { DarkStatusBadge, NetworkTypeBadge } from '../common/StatusBadge';
import { useLeasesWatch } from '@hooks/useK8sWatchResource';
import { Lease } from '@vcm-types/lease';
import { formatTimestamp, formatCPUs, formatGB } from '@utils/formatting';
import { VCM_NAMESPACE } from '@utils/constants';
import { NAMESPACE } from '../../i18n';
import { withErrorBoundary } from '../common/WithErrorBoundary';

/**
 * LeaseList displays a table of all Lease resources
 */
const LeaseListComponent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACE);
  const [leases, loaded, error] = useLeasesWatch();

  const handleRowClick = (lease: Lease) => {
    navigate(`/vcm/leases/${lease.metadata.namespace || VCM_NAMESPACE}/${lease.metadata.name}`);
  };

  const handleCreateClick = () => {
    navigate('/vcm/leases/new');
  };

  const columns: Column<Lease>[] = [
    {
      title: t('Name'),
      key: 'name',
      sortable: true,
      render: (lease) => lease.metadata.name || '-',
    },
    {
      title: t('Phase'),
      key: 'phase',
      sortable: true,
      filterable: false,
      render: (lease) => {
        const phase = lease.status?.phase;
        if (!phase) return null;

        const statusMap: { [key: string]: 'fulfilled' | 'pending' | 'failed' } = {
          'Fulfilled': 'fulfilled',
          'Pending': 'pending',
          'Partial': 'pending',
          'Failed': 'failed',
        };

        const status = statusMap[phase] || 'pending';
        return <DarkStatusBadge status={status} label={phase.toUpperCase()} />;
      },
    },
    {
      title: t('vCPUs'),
      key: 'vcpus',
      render: (lease) => formatCPUs(lease.spec.vcpus || 0),
    },
    {
      title: t('Memory (GB)'),
      key: 'memory',
      render: (lease) => formatGB(lease.spec.memory || 0),
    },
    {
      title: t('Networks'),
      key: 'networks',
      render: (lease) => lease.spec.networks || 0,
    },
    {
      title: t('Pools'),
      key: 'pools',
      render: (lease) => lease.spec.pools || 1,
    },
    {
      title: t('Network Type'),
      key: 'networkType',
      render: (lease) => <NetworkTypeBadge networkType={lease.spec['network-type']} />,
    },
    {
      title: t('Age'),
      key: 'age',
      sortable: true,
      render: (lease) => formatTimestamp(lease.metadata.creationTimestamp),
    },
  ];

  return (
    <Page style={{ height: "100%", width: "100%" }}>
      <PageSection variant="default" style={{ width: "100%" }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {t('Leases')}
            </Title>
          </FlexItem>
          <FlexItem>
            <Button variant="primary" onClick={handleCreateClick} aria-label={t('Create Lease')}>
              {t('Create Lease')}
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection style={{ width: "100%" }}>
        <ResourceList
          data={leases}
          columns={columns}
          loading={!loaded}
          error={error}
          emptyMessage={t('No leases found.')}
          keyFn={(lease) => lease.metadata.uid || lease.metadata.name || ''}
          onRowClick={handleRowClick}
        />
      </PageSection>
    </Page>
  );
};

export const LeaseList = withErrorBoundary(LeaseListComponent);
