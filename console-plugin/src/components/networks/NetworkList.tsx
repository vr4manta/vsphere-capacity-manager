import * as React from 'react';
import { useNavigate } from 'react-router';
import { Page, PageSection, Title, Button, Flex, FlexItem } from '@patternfly/react-core';
import { ResourceList, Column } from '../common/ResourceList';
import { useNetworksWatch } from '@hooks/useK8sWatchResource';
import { Network } from '@vcm-types/network';
import { NETWORK_TYPE_LABEL, VCM_NAMESPACE } from '@utils/constants';

/**
 * NetworkList displays a table of all Network resources
 */
export const NetworkList: React.FC = () => {
  const navigate = useNavigate();
  const [networks, loaded, error] = useNetworksWatch();

  const handleRowClick = (network: Network) => {
    navigate(`/vcm/networks/${network.metadata.namespace || VCM_NAMESPACE}/${network.metadata.name}`);
  };

  const handleCreateClick = () => {
    navigate('/vcm/networks/new');
  };

  const columns: Column<Network>[] = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
      render: (network) => network.metadata.name || '-',
    },
    {
      title: 'Port Group',
      key: 'portGroup',
      sortable: true,
      render: (network) => network.spec.portGroupName || '-',
    },
    {
      title: 'VLAN ID',
      key: 'vlanId',
      render: (network) => network.spec.vlanId || '-',
    },
    {
      title: 'Pod',
      key: 'pod',
      render: (network) => network.spec.podName || '-',
    },
    {
      title: 'Datacenter',
      key: 'datacenter',
      sortable: true,
      render: (network) => network.spec.datacenterName || '-',
    },
    {
      title: 'CIDR',
      key: 'cidr',
      render: (network) => {
        if (network.spec.cidr) {
          return `${network.spec.gateway || ''}/${network.spec.cidr}`;
        }
        return '-';
      },
    },
    {
      title: 'IP Addresses',
      key: 'ipCount',
      render: (network) => network.spec.ipAddressCount || network.spec.ipAddresses?.length || 0,
    },
    {
      title: 'Network Type',
      key: 'networkType',
      render: (network) => {
        const typeLabel = network.metadata.labels?.[NETWORK_TYPE_LABEL];
        return typeLabel || 'default';
      },
    },
  ];

  return (
    <Page style={{ height: "100%", width: "100%" }}>
      <PageSection variant="default" style={{ width: "100%" }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Networks
            </Title>
          </FlexItem>
          <FlexItem>
            <Button variant="primary" onClick={handleCreateClick}>
              Create Network
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection style={{ width: "100%" }}>
        <ResourceList
          data={networks}
          columns={columns}
          loading={!loaded}
          error={error}
          emptyMessage="No networks found. Create a network to get started."
          keyFn={(network) => network.metadata.uid || network.metadata.name || ''}
          onRowClick={handleRowClick}
        />
      </PageSection>
    </Page>
  );
};
