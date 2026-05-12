import * as React from 'react';
import { useNavigate } from 'react-router';
import { Page, PageSection, Title, Button, Flex, FlexItem } from '@patternfly/react-core';
import { ResourceList, Column } from '../common/ResourceList';
import { BooleanBadge } from '../common/StatusBadge';
import { SimpleCapacityBar } from '../common/CapacityGauge';
import { usePoolsWatch } from '@hooks/useK8sWatchResource';
import { Pool } from '@vcm-types/pool';
import { formatResourceUsage } from '@utils/formatting';
import { VCM_NAMESPACE } from '@utils/constants';

/**
 * PoolList displays a table of all Pool resources
 */
export const PoolList: React.FC = () => {
  const navigate = useNavigate();
  const [pools, loaded, error] = usePoolsWatch();

  const handleRowClick = (pool: Pool) => {
    navigate(`/vcm/pools/${pool.metadata.namespace || VCM_NAMESPACE}/${pool.metadata.name}`);
  };

  const handleCreateClick = () => {
    navigate('/vcm/pools/new');
  };

  const columns: Column<Pool>[] = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
      render: (pool) => pool.metadata.name || '-',
    },
    {
      title: 'Region / Zone',
      key: 'region',
      render: (pool) => `${pool.spec.region} / ${pool.spec.zone}`,
    },
    {
      title: 'vCPUs',
      key: 'vcpus',
      sortable: true,
      render: (pool) => (
        <SimpleCapacityBar
          available={pool.status?.['vcpus-available'] || 0}
          total={pool.spec.vcpus}
          showPercentage={false}
        />
      ),
    },
    {
      title: 'Memory (GB)',
      key: 'memory',
      sortable: true,
      render: (pool) => (
        <SimpleCapacityBar
          available={pool.status?.['memory-available'] || 0}
          total={pool.spec.memory}
          showPercentage={false}
        />
      ),
    },
    {
      title: 'Networks',
      key: 'networks',
      render: (pool) =>
        formatResourceUsage(
          pool.status?.['network-available'] || 0,
          pool.spec.topology?.networks?.length || 0,
        ),
    },
    {
      title: 'Leases',
      key: 'leases',
      sortable: true,
      render: (pool) => pool.status?.['lease-count'] || 0,
    },
    {
      title: 'NoSchedule',
      key: 'noSchedule',
      render: (pool) => (
        <BooleanBadge
          value={pool.spec.noSchedule || false}
          trueLabel="Disabled"
          falseLabel="Enabled"
          trueColor="orange"
          falseColor="green"
        />
      ),
    },
    {
      title: 'Excluded',
      key: 'excluded',
      render: (pool) => (
        <BooleanBadge
          value={pool.spec.exclude}
          trueLabel="Yes"
          falseLabel="No"
          trueColor="grey"
          falseColor="blue"
        />
      ),
    },
  ];

  return (
    <Page>
      <PageSection variant="default">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Pools
            </Title>
          </FlexItem>
          <FlexItem>
            <Button variant="primary" onClick={handleCreateClick}>
              Create Pool
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection>
        <ResourceList
          data={pools}
          columns={columns}
          loading={!loaded}
          error={error}
          emptyMessage="No pools found. Create a pool to get started."
          keyFn={(pool) => pool.metadata.uid || pool.metadata.name || ''}
          onRowClick={handleRowClick}
        />
      </PageSection>
    </Page>
  );
};
