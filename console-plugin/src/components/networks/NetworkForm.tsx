import * as React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Page,
  PageSection,
  Title,
  Button,
  Alert,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Card,
  CardBody,
} from '@patternfly/react-core';
import { useNetworkWatch } from '@hooks/useK8sWatchResource';
import { createNetwork, updateNetwork } from '@api/k8s-client';
import { VCM_NAMESPACE, NETWORK_TYPE_LABEL } from '@utils/constants';
import { NAMESPACE } from '../../i18n';
import { withErrorBoundary } from '../common/WithErrorBoundary';
import type { Network } from '@vcm-types/network';

const NetworkFormComponent: React.FC = () => {
  const { name, namespace = VCM_NAMESPACE } = useParams<{ name?: string; namespace?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACE);
  const isEdit = !!name;
  const [existingNetwork, loaded] = useNetworkWatch(name!, namespace);

  // Form state
  const [metadataName, setMetadataName] = React.useState('');
  const [portGroupName, setPortGroupName] = React.useState('');
  const [vlanId, setVlanId] = React.useState('');
  const [podName, setPodName] = React.useState('');
  const [datacenterName, setDatacenterName] = React.useState('');
  const [cidr, setCidr] = React.useState('');
  const [gateway, setGateway] = React.useState('');
  const [netmask, setNetmask] = React.useState('');
  const [ipAddresses, setIpAddresses] = React.useState('');
  const [nameservers, setNameservers] = React.useState('');
  const [networkType, setNetworkType] = React.useState('single-tenant');

  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Load existing network data for edit mode
  React.useEffect(() => {
    if (isEdit && loaded && existingNetwork) {
      setMetadataName(existingNetwork.metadata.name || '');
      setPortGroupName(existingNetwork.spec.portGroupName || '');
      setVlanId(existingNetwork.spec.vlanId || '');
      setPodName(existingNetwork.spec.podName || '');
      setDatacenterName(existingNetwork.spec.datacenterName || '');
      setCidr(existingNetwork.spec.cidr?.toString() || '');
      setGateway(existingNetwork.spec.gateway || '');
      setNetmask(existingNetwork.spec.netmask || '');
      setIpAddresses(existingNetwork.spec.ipAddresses?.join('\n') || '');
      setNameservers(existingNetwork.spec.nameservers?.join('\n') || '');
      setNetworkType(
        existingNetwork.metadata.labels?.[NETWORK_TYPE_LABEL] || 'single-tenant',
      );
    }
  }, [isEdit, loaded, existingNetwork]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const ipAddressList = ipAddresses
        .split('\n')
        .map((ip) => ip.trim())
        .filter((ip) => ip.length > 0);

      const nameserverList = nameservers
        .split('\n')
        .map((ns) => ns.trim())
        .filter((ns) => ns.length > 0);

      const network: Network = {
        apiVersion: 'vspherecapacitymanager.splat.io/v1',
        kind: 'Network',
        metadata: {
          name: isEdit ? existingNetwork!.metadata.name : metadataName,
          namespace,
          labels: {
            [NETWORK_TYPE_LABEL]: networkType,
          },
        },
        spec: {
          portGroupName,
          vlanId,
          podName: podName || undefined,
          datacenterName: datacenterName || undefined,
          cidr: cidr ? parseInt(cidr) : undefined,
          gateway: gateway || undefined,
          netmask: netmask || undefined,
          ipAddresses: ipAddressList.length > 0 ? ipAddressList : undefined,
          nameservers: nameserverList.length > 0 ? nameserverList : undefined,
          ipAddressCount: ipAddressList.length || undefined,
        },
      };

      if (isEdit) {
        await updateNetwork(network, namespace);
      } else {
        await createNetwork(network, namespace);
      }

      navigate('/vcm/networks');
    } catch (err: any) {
      setSubmitError(err.message || t(`Failed to ${isEdit ? 'update' : 'create'} network`));
      setSubmitting(false);
    }
  };

  return (
    <Page style={{ height: "100%", width: "100%" }}>
      <PageSection variant="default" style={{ width: "100%" }}>
        <Title headingLevel="h1" size="2xl">
          {isEdit ? t('Edit Network') : t('Create Network')}
        </Title>
      </PageSection>

      <PageSection style={{ width: "100%" }}>
        {submitError && (
          <Alert variant="danger" title={t('Submission failed')} isInline style={{ marginBottom: '1rem' }}>
            {submitError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Card>
            <CardBody>
              <Title headingLevel="h3" size="lg">
                {t('Basic Information')}
              </Title>

              {!isEdit && (
                <FormGroup label={t('Resource Name')} isRequired fieldId="metadata-name">
                  <TextInput
                    id="metadata-name"
                    value={metadataName}
                    onChange={(_, value) => setMetadataName(value)}
                    isRequired
                  />
                </FormGroup>
              )}

              <Grid hasGutter>
                <GridItem span={6}>
                  <FormGroup label={t('Port Group Name')} isRequired fieldId="port-group">
                    <TextInput
                      id="port-group"
                      value={portGroupName}
                      onChange={(_, value) => setPortGroupName(value)}
                      isRequired
                    />
                  </FormGroup>
                </GridItem>

                <GridItem span={6}>
                  <FormGroup label={t('VLAN ID')} isRequired fieldId="vlan-id">
                    <TextInput
                      id="vlan-id"
                      value={vlanId}
                      onChange={(_, value) => setVlanId(value)}
                      isRequired
                    />
                  </FormGroup>
                </GridItem>
              </Grid>

              <Grid hasGutter>
                <GridItem span={6}>
                  <FormGroup label={t('Pod Name')} fieldId="pod-name">
                    <TextInput
                      id="pod-name"
                      value={podName}
                      onChange={(_, value) => setPodName(value)}
                    />
                  </FormGroup>
                </GridItem>

                <GridItem span={6}>
                  <FormGroup label={t('Datacenter Name')} fieldId="datacenter">
                    <TextInput
                      id="datacenter"
                      value={datacenterName}
                      onChange={(_, value) => setDatacenterName(value)}
                    />
                  </FormGroup>
                </GridItem>
              </Grid>

              <FormGroup label={t('Network Type')} isRequired fieldId="network-type">
                <select
                  id="network-type"
                  value={networkType}
                  onChange={(e) => setNetworkType(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 8px',
                    border: '1px solid #d2d2d2',
                    borderRadius: '3px',
                  }}
                >
                  <option value="">{t('Default')}</option>
                  <option value="single-tenant">{t('Single Tenant')}</option>
                  <option value="multi-tenant">{t('Multi Tenant')}</option>
                  <option value="disconnected">{t('Disconnected')}</option>
                  <option value="nested-multi-tenant">{t('Nested Multi Tenant')}</option>
                  <option value="public-ipv6">{t('Public IPv6')}</option>
                </select>
              </FormGroup>
            </CardBody>
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <CardBody>
              <Title headingLevel="h3" size="lg">
                {t('IPv4 Configuration')}
              </Title>

              <Grid hasGutter>
                <GridItem span={4}>
                  <FormGroup label={t('CIDR Prefix')} fieldId="cidr">
                    <TextInput
                      id="cidr"
                      value={cidr}
                      onChange={(_, value) => setCidr(value)}
                      type="number"
                      placeholder="24"
                    />
                  </FormGroup>
                </GridItem>

                <GridItem span={4}>
                  <FormGroup label={t('Gateway')} fieldId="gateway">
                    <TextInput
                      id="gateway"
                      value={gateway}
                      onChange={(_, value) => setGateway(value)}
                      placeholder="192.168.1.1"
                    />
                  </FormGroup>
                </GridItem>

                <GridItem span={4}>
                  <FormGroup label={t('Netmask')} fieldId="netmask">
                    <TextInput
                      id="netmask"
                      value={netmask}
                      onChange={(_, value) => setNetmask(value)}
                      placeholder="255.255.255.0"
                    />
                  </FormGroup>
                </GridItem>
              </Grid>

              <FormGroup label={t('IP Addresses')} fieldId="ip-addresses">
                <TextArea
                  id="ip-addresses"
                  value={ipAddresses}
                  onChange={(_, value) => setIpAddresses(value)}
                  rows={5}
                  placeholder="One IP address per line&#10;192.168.1.10&#10;192.168.1.11&#10;192.168.1.12"
                />
              </FormGroup>

              <FormGroup label={t('Nameservers')} fieldId="nameservers">
                <TextArea
                  id="nameservers"
                  value={nameservers}
                  onChange={(_, value) => setNameservers(value)}
                  rows={3}
                  placeholder="One nameserver per line&#10;8.8.8.8&#10;8.8.4.4"
                />
              </FormGroup>
            </CardBody>
          </Card>

          <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginTop: '2rem' }}>
            <FlexItem>
              <Button variant="link" onClick={() => navigate('/vcm/networks')}>
                {t('Cancel')}
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                variant="primary"
                type="submit"
                isLoading={submitting}
                isDisabled={!portGroupName || !vlanId || (!isEdit && !metadataName)}
              >
                {isEdit ? t('Update') : t('Create')}
              </Button>
            </FlexItem>
          </Flex>
        </Form>
      </PageSection>
    </Page>
  );
};

export const NetworkForm = withErrorBoundary(NetworkFormComponent);
