import * as React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Button } from '@patternfly/react-core';
import { ResourceList, Column } from '../common/ResourceList';
import { useNetworksWatch } from '@hooks/useK8sWatchResource';
import { Network } from '@vcm-types/network';
import { NETWORK_TYPE_LABEL, VCM_NAMESPACE } from '@utils/constants';
import { NAMESPACE } from '../../i18n';
import { withErrorBoundary } from '../common/WithErrorBoundary';

/**
 * NetworkList displays a table of all Network resources
 */
const NetworkListComponent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACE);
  const [networks, loaded, error] = useNetworksWatch();

  const handleRowClick = (network: Network) => {
    navigate(`/vcm/networks/${network.metadata.namespace || VCM_NAMESPACE}/${network.metadata.name}`);
  };

  const handleCreateClick = () => {
    navigate('/vcm/networks/new');
  };

  const columns: Column<Network>[] = [
    {
      title: t('Name'),
      key: 'name',
      sortable: true,
      render: (network) => network.metadata.name || '-',
    },
    {
      title: t('Port Group'),
      key: 'portGroup',
      sortable: true,
      render: (network) => network.spec.portGroupName || '-',
    },
    {
      title: t('VLAN ID'),
      key: 'vlanId',
      render: (network) => network.spec.vlanId || '-',
    },
    {
      title: t('Pod'),
      key: 'pod',
      render: (network) => network.spec.podName || '-',
    },
    {
      title: t('Datacenter'),
      key: 'datacenter',
      sortable: true,
      render: (network) => network.spec.datacenterName || '-',
    },
    {
      title: t('CIDR'),
      key: 'cidr',
      render: (network) => {
        if (network.spec.cidr) {
          return `${network.spec.gateway || ''}/${network.spec.cidr}`;
        }
        return '-';
      },
    },
    {
      title: t('IP Addresses'),
      key: 'ipCount',
      render: (network) => network.spec.ipAddressCount || network.spec.ipAddresses?.length || 0,
    },
    {
      title: t('Network Type'),
      key: 'networkType',
      render: (network) => {
        const typeLabel = network.metadata.labels?.[NETWORK_TYPE_LABEL];
        return typeLabel || 'default';
      },
    },
  ];

  return (
    <>
      <ListPageHeader title={t('Networks')}>
        <Button variant="primary" onClick={handleCreateClick}>
          {t('Create Network')}
        </Button>
      </ListPageHeader>
      <PageSection>
        <ResourceList
          data={networks}
          columns={columns}
          loading={!loaded}
          error={error}
          emptyMessage={t('No networks found. Create a network to get started.')}
          keyFn={(network) => network.metadata.uid || network.metadata.name || ''}
          onRowClick={handleRowClick}
        />
      </PageSection>
    </>
  );
};

export const NetworkList = withErrorBoundary(NetworkListComponent);
