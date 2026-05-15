import * as React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Page,
  PageSection,
  Title,
  Card,
  CardBody,
  Grid,
  GridItem,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Divider,
  Button,
  Alert,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import { useNetworkWatch } from '@hooks/useK8sWatchResource';
import { deleteNetwork } from '@api/k8s-client';
import { LoadingBox, ErrorBox } from '../common/ResourceList';
import { NETWORK_TYPE_LABEL } from '@utils/constants';
import { NAMESPACE } from '../../i18n';

export const NetworkDetail: React.FC = () => {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACE);
  const [network, loaded, error] = useNetworkWatch(name!, namespace);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (
      !network ||
      !window.confirm(t('Are you sure you want to delete network "{{name}}"?', { name: network.metadata.name }))
    ) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteNetwork(network.metadata.name!, namespace);
      navigate('/vcm/networks');
    } catch (err: any) {
      setDeleteError(err.message || t('Failed to delete network'));
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/vcm/networks/${namespace}/${name}/edit`);
  };

  if (!loaded) {
    return <LoadingBox message={t('Loading network details...')} />;
  }

  if (error || !network) {
    return <ErrorBox error={error} title={t('Error loading network')} />;
  }

  const networkType = network.metadata.labels?.[NETWORK_TYPE_LABEL] || 'default';

  return (
    <Page style={{ height: "100%", width: "100%" }}>
      <PageSection variant="default" style={{ width: "100%" }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {network.metadata.name}
            </Title>
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
              <Button variant="primary" onClick={handleEdit}>
                {t('Edit')}
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
                {t('Delete')}
              </Button>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      {deleteError && (
        <PageSection style={{ width: "100%" }}>
          <Alert variant="danger" title={t('Delete failed')} isInline>
            {deleteError}
          </Alert>
        </PageSection>
      )}

      <PageSection style={{ flex: 1, width: "100%" }}>
        <Grid hasGutter>
          {/* Basic Information Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  {t('Basic Information')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Port Group Name')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.portGroupName || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('VLAN ID')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.vlanId || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Network Type')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Label color="blue">{networkType}</Label>
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Pod Name')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.podName || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Datacenter Name')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.datacenterName || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Subnet Type')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.subnetType || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* IPv4 Configuration Card */}
          <GridItem span={6}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  {t('IPv4 Configuration')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('CIDR')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.cidr || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Gateway')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.gateway || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Netmask')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.netmask || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Machine Network CIDR')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.machineNetworkCidr || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('IP Address Count')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.ipAddressCount || network.spec.ipAddresses?.length || 0}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* IPv6 Configuration Card */}
          <GridItem span={6}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  {t('IPv6 Configuration')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('CIDR IPv6')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.cidrIPv6 || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Gateway IPv6')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.gatewayipv6 || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('IPv6 Prefix')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.ipv6prefix || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Start IPv6 Address')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.startIPv6Address || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* IP Addresses Card */}
          {network.spec.ipAddresses && network.spec.ipAddresses.length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <Title headingLevel="h2" size="lg">
                    {t('IP Addresses ({{count}})', { count: network.spec.ipAddresses.length })}
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {network.spec.ipAddresses.map((ip, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {ip}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </GridItem>
          )}

          {/* Nameservers Card */}
          {network.spec.nameservers && network.spec.nameservers.length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <Title headingLevel="h2" size="lg">
                    {t('Nameservers ({{count}})', { count: network.spec.nameservers.length })}
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                    {network.spec.nameservers.map((ns, idx) => (
                      <Label key={idx} color="purple">
                        {ns}
                      </Label>
                    ))}
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
          )}

          {/* Additional Information Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  {t('Additional Information')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Primary Router Hostname')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.spec.primaryRouterHostname || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.metadata.namespace || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {network.metadata.creationTimestamp
                        ? new Date(network.metadata.creationTimestamp).toLocaleString()
                        : '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('UID')}</DescriptionListTerm>
                    <DescriptionListDescription
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    >
                      {network.metadata.uid || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </Page>
  );
};
