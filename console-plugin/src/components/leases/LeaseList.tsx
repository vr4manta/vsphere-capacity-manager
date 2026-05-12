import * as React from 'react';
import { useNavigate } from 'react-router';
import { Page, PageSection, Title, Button, Flex, FlexItem } from '@patternfly/react-core';
import { ResourceList, Column } from '../common/ResourceList';
import { StatusBadge, NetworkTypeBadge } from '../common/StatusBadge';
import { useLeasesWatch } from '@hooks/useK8sWatchResource';
import { Lease } from '@vcm-types/lease';
import { formatTimestamp, formatCPUs, formatGB } from '@utils/formatting';
import { VCM_NAMESPACE } from '@utils/constants';

/**
 * LeaseList displays a table of all Lease resources
 */
export const LeaseList: React.FC = () => {
  const navigate = useNavigate();
  const [leases, loaded, error] = useLeasesWatch();

  const handleRowClick = (lease: Lease) => {
    navigate(`/vcm/leases/${lease.metadata.namespace || VCM_NAMESPACE}/${lease.metadata.name}`);
  };

  const handleCreateClick = () => {
    navigate('/vcm/leases/new');
  };

  const columns: Column<Lease>[] = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
      render: (lease) => lease.metadata.name || '-',
    },
    {
      title: 'Phase',
      key: 'phase',
      sortable: true,
      render: (lease) => <StatusBadge phase={lease.status?.phase} />,
    },
    {
      title: 'vCPUs',
      key: 'vcpus',
      render: (lease) => formatCPUs(lease.spec.vcpus || 0),
    },
    {
      title: 'Memory',
      key: 'memory',
      render: (lease) => formatGB(lease.spec.memory || 0),
    },
    {
      title: 'Networks',
      key: 'networks',
      render: (lease) => lease.spec.networks || 0,
    },
    {
      title: 'Pools',
      key: 'pools',
      render: (lease) => lease.spec.pools || 1,
    },
    {
      title: 'Network Type',
      key: 'networkType',
      render: (lease) => <NetworkTypeBadge networkType={lease.spec['network-type']} />,
    },
    {
      title: 'Age',
      key: 'age',
      sortable: true,
      render: (lease) => formatTimestamp(lease.metadata.creationTimestamp),
    },
  ];

  return (
    <Page>
      <PageSection variant="default">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Leases
            </Title>
          </FlexItem>
          <FlexItem>
            <Button variant="primary" onClick={handleCreateClick}>
              Create Lease
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection>
        <ResourceList
          data={leases}
          columns={columns}
          loading={!loaded}
          error={error}
          emptyMessage="No leases found. Create a lease to allocate resources."
          keyFn={(lease) => lease.metadata.uid || lease.metadata.name || ''}
          onRowClick={handleRowClick}
        />
      </PageSection>
    </Page>
  );
};
