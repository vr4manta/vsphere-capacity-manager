import * as React from 'react';
import { useParams, useNavigate } from 'react-router';
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
  NumberInput,
} from '@patternfly/react-core';
import { useLeaseWatch } from '@hooks/useK8sWatchResource';
import { createLease, updateLease } from '@api/k8s-client';
import { VCM_NAMESPACE } from '@utils/constants';
import type { Lease } from '@vcm-types/lease';
import type { NetworkType, Toleration, TolerationOperator } from '@vcm-types/common';

export const LeaseForm: React.FC = () => {
  const { name, namespace = VCM_NAMESPACE } = useParams<{ name?: string; namespace?: string }>();
  const navigate = useNavigate();
  const isEdit = !!name;
  const [existingLease, loaded] = useLeaseWatch(name!, namespace);

  // Form state
  const [metadataName, setMetadataName] = React.useState('');
  const [vcpus, setVcpus] = React.useState<number>(0);
  const [memory, setMemory] = React.useState<number>(0);
  const [storage, setStorage] = React.useState<number>(0);
  const [networks, setNetworks] = React.useState<number>(1);
  const [pools, setPools] = React.useState<number>(1);
  const [networkType, setNetworkType] = React.useState<NetworkType>('single-tenant');
  const [requiredPool, setRequiredPool] = React.useState('');
  const [poolSelectorInput, setPoolSelectorInput] = React.useState('');
  const [boskosLeaseId, setBoskosLeaseId] = React.useState('');
  const [tolerations, setTolerations] = React.useState<Toleration[]>([]);

  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Toleration form state
  const [tolerationKey, setTolerationKey] = React.useState('');
  const [tolerationOperator, setTolerationOperator] = React.useState<TolerationOperator>('Equal');
  const [tolerationValue, setTolerationValue] = React.useState('');
  const [tolerationEffect, setTolerationEffect] = React.useState('');

  // Load existing lease data for edit mode
  React.useEffect(() => {
    if (isEdit && loaded && existingLease) {
      setMetadataName(existingLease.metadata.name || '');
      setVcpus(existingLease.spec.vcpus || 0);
      setMemory(existingLease.spec.memory || 0);
      setStorage(existingLease.spec.storage || 0);
      setNetworks(existingLease.spec.networks || 1);
      setPools(existingLease.spec.pools || 1);
      setNetworkType(existingLease.spec['network-type'] || 'single-tenant');
      setRequiredPool(existingLease.spec['required-pool'] || '');
      setBoskosLeaseId(existingLease.spec['boskos-lease-id'] || '');
      setTolerations(existingLease.spec.tolerations || []);

      // Convert poolSelector to string for display
      if (existingLease.spec.poolSelector) {
        const selectorStr = Object.entries(existingLease.spec.poolSelector)
          .map(([k, v]) => `${k}=${v}`)
          .join('\n');
        setPoolSelectorInput(selectorStr);
      }
    }
  }, [isEdit, loaded, existingLease]);

  const addToleration = () => {
    if (tolerationKey.trim() || tolerationEffect.trim()) {
      const newToleration: Toleration = {
        key: tolerationKey.trim() || undefined,
        operator: tolerationOperator,
        value: tolerationValue.trim() || undefined,
        effect: tolerationEffect.trim() || undefined,
      };
      setTolerations([...tolerations, newToleration]);
      setTolerationKey('');
      setTolerationValue('');
      setTolerationEffect('');
    }
  };

  const removeToleration = (index: number) => {
    const newTolerations = [...tolerations];
    newTolerations.splice(index, 1);
    setTolerations(newTolerations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Parse pool selector from input
      let poolSelector: { [key: string]: string } | undefined;
      if (poolSelectorInput.trim()) {
        poolSelector = {};
        poolSelectorInput
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .forEach((line) => {
            const [key, value] = line.split('=').map((s) => s.trim());
            if (key && value) {
              poolSelector![key] = value;
            }
          });
      }

      const lease: Lease = {
        apiVersion: 'vspherecapacitymanager.splat.io/v1',
        kind: 'Lease',
        metadata: {
          name: isEdit ? existingLease!.metadata.name : metadataName,
          namespace,
        },
        spec: {
          vcpus: vcpus || undefined,
          memory: memory || undefined,
          storage: storage || undefined,
          networks,
          pools: pools || 1,
          'network-type': networkType,
          'required-pool': requiredPool || undefined,
          poolSelector,
          tolerations: tolerations.length > 0 ? tolerations : undefined,
          'boskos-lease-id': boskosLeaseId || undefined,
        },
        status: isEdit
          ? existingLease!.status
          : {
              name: '',
              region: '',
              zone: '',
              server: '',
              topology: {
                datacenter: '',
                computeCluster: '',
                datastore: '',
                networks: [],
              },
              phase: 'Pending',
            },
      };

      if (isEdit) {
        await updateLease(lease, namespace);
      } else {
        await createLease(lease, namespace);
      }

      navigate('/vcm/leases');
    } catch (err: any) {
      setSubmitError(err.message || `Failed to ${isEdit ? 'update' : 'create'} lease`);
      setSubmitting(false);
    }
  };

  return (
    <Page style={{ height: "100%", width: "100%" }}>
      <PageSection variant="default" style={{ width: "100%" }}>
        <Title headingLevel="h1" size="2xl">
          {isEdit ? 'Edit Lease' : 'Create Lease'}
        </Title>
      </PageSection>

      <PageSection style={{ width: "100%" }}>
        {submitError && (
          <Alert
            variant="danger"
            title="Submission failed"
            isInline
            style={{ marginBottom: '1rem' }}
            aria-live="assertive"
          >
            {submitError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Card>
            <CardBody>
              <Title headingLevel="h3" size="lg">
                Basic Information
              </Title>

              {!isEdit && (
                <FormGroup label="Resource Name" isRequired fieldId="metadata-name">
                  <TextInput
                    id="metadata-name"
                    value={metadataName}
                    onChange={(_, value) => setMetadataName(value)}
                    isRequired
                  />
                </FormGroup>
              )}
            </CardBody>
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <CardBody>
              <Title headingLevel="h3" size="lg">
                Resource Requirements
              </Title>

              <Grid hasGutter>
                <GridItem span={6}>
                  <FormGroup label="vCPUs" fieldId="vcpus">
                    <NumberInput
                      id="vcpus"
                      value={vcpus}
                      onMinus={() => setVcpus(Math.max(0, vcpus - 1))}
                      onChange={(event) => {
                        const value = Number((event.target as HTMLInputElement).value);
                        setVcpus(value);
                      }}
                      onPlus={() => setVcpus(vcpus + 1)}
                      min={0}
                      aria-label="Number of vCPUs"
                    />
                  </FormGroup>
                </GridItem>

                <GridItem span={6}>
                  <FormGroup label="Memory (GB)" fieldId="memory">
                    <NumberInput
                      id="memory"
                      value={memory}
                      onMinus={() => setMemory(Math.max(0, memory - 1))}
                      onChange={(event) => {
                        const value = Number((event.target as HTMLInputElement).value);
                        setMemory(value);
                      }}
                      onPlus={() => setMemory(memory + 1)}
                      min={0}
                      aria-label="Memory in gigabytes"
                    />
                  </FormGroup>
                </GridItem>
              </Grid>

              <Grid hasGutter>
                <GridItem span={6}>
                  <FormGroup label="Storage (GB)" fieldId="storage">
                    <NumberInput
                      id="storage"
                      value={storage}
                      onMinus={() => setStorage(Math.max(0, storage - 1))}
                      onChange={(event) => {
                        const value = Number((event.target as HTMLInputElement).value);
                        setStorage(value);
                      }}
                      onPlus={() => setStorage(storage + 1)}
                      min={0}
                    />
                  </FormGroup>
                </GridItem>

                <GridItem span={6}>
                  <FormGroup label="Networks" isRequired fieldId="networks">
                    <NumberInput
                      id="networks"
                      value={networks}
                      onMinus={() => setNetworks(Math.max(1, networks - 1))}
                      onChange={(event) => {
                        const value = Number((event.target as HTMLInputElement).value);
                        setNetworks(value);
                      }}
                      onPlus={() => setNetworks(networks + 1)}
                      min={1}
                    />
                  </FormGroup>
                </GridItem>
              </Grid>

              <Grid hasGutter>
                <GridItem span={6}>
                  <FormGroup label="Number of Pools" fieldId="pools">
                    <NumberInput
                      id="pools"
                      value={pools}
                      onMinus={() => setPools(Math.max(1, pools - 1))}
                      onChange={(event) => {
                        const value = Number((event.target as HTMLInputElement).value);
                        setPools(value);
                      }}
                      onPlus={() => setPools(pools + 1)}
                      min={1}
                    />
                  </FormGroup>
                </GridItem>

                <GridItem span={6}>
                  <FormGroup label="Network Type" fieldId="network-type">
                    <select
                      id="network-type"
                      value={networkType}
                      onChange={(e) => setNetworkType(e.target.value as NetworkType)}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '0 8px',
                        border: '1px solid #d2d2d2',
                        borderRadius: '3px',
                      }}
                    >
                      <option value="">Default</option>
                      <option value="single-tenant">Single Tenant</option>
                      <option value="multi-tenant">Multi Tenant</option>
                      <option value="disconnected">Disconnected</option>
                      <option value="nested-multi-tenant">Nested Multi Tenant</option>
                      <option value="public-ipv6">Public IPv6</option>
                    </select>
                  </FormGroup>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <CardBody>
              <Title headingLevel="h3" size="lg">
                Pool Selection
              </Title>

              <FormGroup label="Required Pool" fieldId="required-pool">
                <TextInput
                  id="required-pool"
                  value={requiredPool}
                  onChange={(_, value) => setRequiredPool(value)}
                  placeholder="pool-name (leave empty for automatic selection)"
                />
              </FormGroup>

              <FormGroup label="Pool Selector (key=value pairs, one per line)" fieldId="pool-selector">
                <TextArea
                  id="pool-selector"
                  value={poolSelectorInput}
                  onChange={(_, value) => setPoolSelectorInput(value)}
                  rows={3}
                  placeholder="region=us-east&#10;zone=zone-1"
                />
              </FormGroup>

              <FormGroup label="Boskos Lease ID" fieldId="boskos-lease-id">
                <TextInput
                  id="boskos-lease-id"
                  value={boskosLeaseId}
                  onChange={(_, value) => setBoskosLeaseId(value)}
                  placeholder="Optional Boskos lease ID"
                />
              </FormGroup>
            </CardBody>
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <CardBody>
              <Title headingLevel="h3" size="lg">
                Tolerations
              </Title>

              <Grid hasGutter>
                <GridItem span={3}>
                  <TextInput
                    placeholder="Key (empty = all)"
                    value={tolerationKey}
                    onChange={(_, value) => setTolerationKey(value)}
                  />
                </GridItem>
                <GridItem span={2}>
                  <select
                    value={tolerationOperator}
                    onChange={(e) => setTolerationOperator(e.target.value as TolerationOperator)}
                    style={{
                      width: '100%',
                      height: '36px',
                      padding: '0 8px',
                      border: '1px solid #d2d2d2',
                      borderRadius: '3px',
                    }}
                  >
                    <option value="Equal">Equal</option>
                    <option value="Exists">Exists</option>
                  </select>
                </GridItem>
                <GridItem span={3}>
                  <TextInput
                    placeholder="Value"
                    value={tolerationValue}
                    onChange={(_, value) => setTolerationValue(value)}
                  />
                </GridItem>
                <GridItem span={2}>
                  <TextInput
                    placeholder="Effect (empty = all)"
                    value={tolerationEffect}
                    onChange={(_, value) => setTolerationEffect(value)}
                  />
                </GridItem>
                <GridItem span={2}>
                  <Button onClick={addToleration} isBlock>
                    Add
                  </Button>
                </GridItem>
              </Grid>

              {tolerations.length > 0 && (
                <Card isCompact style={{ marginTop: '8px' }}>
                  <CardBody>
                    {tolerations.map((toleration, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 0',
                          borderBottom:
                            idx < tolerations.length - 1 ? '1px solid #d2d2d2' : 'none',
                        }}
                      >
                        <span style={{ fontSize: '14px' }}>
                          {toleration.key || '(all)'}:{toleration.operator || 'Equal'}:
                          {toleration.value || '-'}:{toleration.effect || '(all)'}
                        </span>
                        <Button variant="link" isDanger onClick={() => removeToleration(idx)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              )}
            </CardBody>
          </Card>

          <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginTop: '2rem' }}>
            <FlexItem>
              <Button variant="link" onClick={() => navigate('/vcm/leases')}>
                Cancel
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                variant="primary"
                type="submit"
                isLoading={submitting}
                isDisabled={!isEdit && !metadataName}
              >
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </FlexItem>
          </Flex>
        </Form>
      </PageSection>
    </Page>
  );
};
