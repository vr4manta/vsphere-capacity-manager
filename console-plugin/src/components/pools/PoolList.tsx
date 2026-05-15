import * as React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Page, PageSection, Title, Button, Flex, FlexItem } from '@patternfly/react-core';
import { ResourceList, Column } from '../common/ResourceList';
import { DarkStatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { usePoolsWatch } from '@hooks/useK8sWatchResource';
import { Pool } from '@vcm-types/pool';
import { formatResourceUsage } from '@utils/formatting';
import { VCM_NAMESPACE } from '@utils/constants';
import { NAMESPACE } from '../../i18n';
import { withErrorBoundary } from '../common/WithErrorBoundary';

/**
 * PoolList displays a table of all Pool resources
 */
const PoolListComponent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACE);
  const [pools, loaded, error] = usePoolsWatch();

  const handleRowClick = (pool: Pool) => {
    navigate(`/vcm/pools/${pool.metadata.namespace || VCM_NAMESPACE}/${pool.metadata.name}`);
  };

  const handleCreateClick = () => {
    navigate('/vcm/pools/new');
  };

  const columns: Column<Pool>[] = [
    {
      title: t('Name'),
      key: 'name',
      sortable: true,
      render: (pool) => pool.metadata.name || '-',
    },
    {
      title: t('Region / Zone'),
      key: 'region',
      render: (pool) => `${pool.spec.region} / ${pool.spec.zone}`,
    },
    {
      title: t('vCPUs'),
      key: 'vcpus',
      sortable: true,
      filterable: false,
      render: (pool) => {
        const used = pool.spec.vcpus - (pool.status?.['vcpus-available'] || 0);
        return <ProgressBar used={used} total={pool.spec.vcpus} />;
      },
    },
    {
      title: t('Memory (GB)'),
      key: 'memory',
      sortable: true,
      filterable: false,
      render: (pool) => {
        const used = pool.spec.memory - (pool.status?.['memory-available'] || 0);
        return <ProgressBar used={used} total={pool.spec.memory} />;
      },
    },
    {
      title: t('Networks'),
      key: 'networks',
      render: (pool) =>
        formatResourceUsage(
          pool.status?.['network-available'] || 0,
          pool.spec.topology?.networks?.length || 0,
        ),
    },
    {
      title: t('Leases'),
      key: 'leases',
      sortable: true,
      render: (pool) => pool.status?.['lease-count'] || 0,
    },
    {
      title: t('Status'),
      key: 'status',
      filterable: false,
      render: (pool) => {
        if (pool.spec.exclude) {
          return <DarkStatusBadge status="excluded" label="EXCLUDED" />;
        }
        if (pool.spec.noSchedule) {
          return <DarkStatusBadge status="pending" label="CORDONED" />;
        }
        return <DarkStatusBadge status="active" label="ACTIVE" />;
      },
    },
  ];

  return (
    <Page style={{ height: "100%", width: "100%" }}>
      <PageSection variant="default" style={{ width: "100%" }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {t('Pools')}
            </Title>
          </FlexItem>
          <FlexItem>
            <Button variant="primary" onClick={handleCreateClick} aria-label={t('Create Pool')}>
              {t('Create Pool')}
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection style={{ width: "100%" }}>
        <ResourceList
          data={pools}
          columns={columns}
          loading={!loaded}
          error={error}
          emptyMessage={t('No pools found. Create a pool to get started.')}
          keyFn={(pool) => pool.metadata.uid || pool.metadata.name || ''}
          onRowClick={handleRowClick}
        />
      </PageSection>
    </Page>
  );
};

export const PoolList = withErrorBoundary(PoolListComponent);
