import * as React from 'react';
import { useParams, useNavigate } from 'react-router';
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
  Label,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { usePoolWatch, useLeasesWatch } from '@hooks/useK8sWatchResource';
import { deletePool } from '@api/k8s-client';
import { CapacityGauge } from '../common/CapacityGauge';
import { BooleanBadge } from '../common/StatusBadge';
import { LoadingBox, ErrorBox } from '../common/ResourceList';
import { formatResourceUsage } from '@utils/formatting';
import type { Lease } from '@vcm-types/lease';
import type { Taint } from '@vcm-types/common';

export const PoolDetail: React.FC = () => {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const navigate = useNavigate();
  const [pool, loaded, error] = usePoolWatch(name!, namespace);
  const [leases] = useLeasesWatch(namespace);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Filter leases that use this pool
  const poolLeases = React.useMemo(() => {
    if (!pool || !leases) return [];
    return leases.filter((lease: Lease) => {
      // Check if this pool is assigned to the lease
      const poolInfo = lease.status?.poolInfo || [];
      return poolInfo.some((p) => p.name === pool.spec.name);
    });
  }, [pool, leases]);

  const handleDelete = async () => {
    if (!pool || !window.confirm(`Are you sure you want to delete pool "${pool.metadata.name}"?`)) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deletePool(pool.metadata.name!, namespace);
      navigate('/vcm/pools');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete pool');
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/vcm/pools/${namespace}/${name}/edit`);
  };

  if (!loaded) {
    return <LoadingBox message="Loading pool details..." />;
  }

  if (error || !pool) {
    return <ErrorBox error={error} title="Error loading pool" />;
  }

  return (
    <Page>
      <PageSection variant="default">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {pool.metadata.name}
            </Title>
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
              <Button variant="primary" onClick={handleEdit}>
                Edit
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
                Delete
              </Button>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      {deleteError && (
        <PageSection>
          <Alert variant="danger" title="Delete failed" isInline>
            {deleteError}
          </Alert>
        </PageSection>
      )}

      <PageSection>
        <Grid hasGutter>
          {/* Overview Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  Overview
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Name</DescriptionListTerm>
                    <DescriptionListDescription>{pool.spec.name}</DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Short Name</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.shortName || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Server</DescriptionListTerm>
                    <DescriptionListDescription>{pool.spec.server}</DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Region / Zone</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.region} / {pool.spec.zone}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Excluded</DescriptionListTerm>
                    <DescriptionListDescription>
                      <BooleanBadge value={pool.spec.exclude} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>NoSchedule</DescriptionListTerm>
                    <DescriptionListDescription>
                      <BooleanBadge
                        value={pool.spec.noSchedule || false}
                        trueLabel="Disabled"
                        falseLabel="Enabled"
                        trueColor="orange"
                        falseColor="green"
                      />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Overcommit Ratio</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.overCommitRatio}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Active Leases</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.status?.['lease-count'] || 0}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* Capacity Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  Capacity
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <Grid hasGutter>
                  <GridItem span={4}>
                    <CapacityGauge
                      available={pool.status?.['vcpus-available'] || 0}
                      total={pool.spec.vcpus}
                      label="vCPUs"
                    />
                  </GridItem>
                  <GridItem span={4}>
                    <CapacityGauge
                      available={pool.status?.['memory-available'] || 0}
                      total={pool.spec.memory}
                      label="Memory (GB)"
                    />
                  </GridItem>
                  <GridItem span={4}>
                    <CapacityGauge
                      available={pool.status?.['datastore-available'] || 0}
                      total={pool.spec.storage}
                      label="Storage (GB)"
                    />
                  </GridItem>
                </Grid>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '3Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Networks</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatResourceUsage(
                        pool.status?.['network-available'] || 0,
                        pool.spec.topology?.networks?.length || 0,
                      )}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* Topology Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  Topology
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Datacenter</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.datacenter || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Compute Cluster</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.computeCluster || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Datastore</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.datastore || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Folder</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.folder || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Resource Pool</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.resourcePool || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Template</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.template || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Networks</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.networks?.length || 0} configured
                      <div style={{ marginTop: '0.5rem' }}>
                        {pool.spec.topology?.networks?.map((network, idx) => (
                          <div key={idx} style={{ fontSize: '12px', color: '#6a6e73' }}>
                            {network}
                          </div>
                        ))}
                      </div>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* Taints Card */}
          {pool.spec.taints && pool.spec.taints.length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <Title headingLevel="h2" size="lg">
                    Taints
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                    {pool.spec.taints.map((taint: Taint, idx: number) => (
                      <Label key={idx} color="orange">
                        {taint.key}
                        {taint.value ? `=${taint.value}` : ''}:{taint.effect}
                      </Label>
                    ))}
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
          )}

          {/* Active Leases Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  Active Leases ({poolLeases.length})
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                {poolLeases.length === 0 ? (
                  <p>No active leases using this pool.</p>
                ) : (
                  <Table aria-label="Active leases" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Phase</Th>
                        <Th>vCPUs</Th>
                        <Th>Memory (GB)</Th>
                        <Th>Networks</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {poolLeases.map((lease: Lease) => (
                        <Tr key={lease.metadata.uid}>
                          <Td>{lease.metadata.name}</Td>
                          <Td>{lease.status?.phase || '-'}</Td>
                          <Td>{lease.spec.vcpus || 0}</Td>
                          <Td>{lease.spec.memory || 0}</Td>
                          <Td>{lease.spec.networks || 0}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </Page>
  );
};
