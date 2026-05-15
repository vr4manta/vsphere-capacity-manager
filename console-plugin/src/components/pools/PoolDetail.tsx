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
import { NAMESPACE } from '../../i18n';
import { withErrorBoundary } from '../common/WithErrorBoundary';
import type { Lease } from '@vcm-types/lease';
import type { Taint } from '@vcm-types/common';

const PoolDetailComponent: React.FC = () => {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACE);
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
    if (!pool || !window.confirm(t('Are you sure you want to delete pool "{{name}}"?', { name: pool.metadata.name }))) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deletePool(pool.metadata.name!, namespace);
      navigate('/vcm/pools');
    } catch (err: any) {
      setDeleteError(err.message || t('Failed to delete pool'));
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/vcm/pools/${namespace}/${name}/edit`);
  };

  if (!loaded) {
    return <LoadingBox message={t('Loading pool details...')} />;
  }

  if (error || !pool) {
    return <ErrorBox error={error} title={t('Error loading pool')} />;
  }

  return (
    <Page style={{ height: "100%", width: "100%" }}>
      <PageSection variant="default" style={{ width: "100%" }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {pool.metadata.name}
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
          {/* Overview Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  {t('Overview')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                    <DescriptionListDescription>{pool.spec.name}</DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Short Name')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.shortName || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Server')}</DescriptionListTerm>
                    <DescriptionListDescription>{pool.spec.server}</DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Region / Zone')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.region} / {pool.spec.zone}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Excluded')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <BooleanBadge value={pool.spec.exclude} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('NoSchedule')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <BooleanBadge
                        value={pool.spec.noSchedule || false}
                        trueLabel={t('Disabled')}
                        falseLabel={t('Enabled')}
                        trueColor="orange"
                        falseColor="green"
                      />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Overcommit Ratio')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.overCommitRatio}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Active Leases')}</DescriptionListTerm>
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
                  {t('Capacity')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <Grid hasGutter>
                  <GridItem span={4}>
                    <CapacityGauge
                      available={pool.status?.['vcpus-available'] || 0}
                      total={pool.spec.vcpus}
                      label={t('vCPUs')}
                    />
                  </GridItem>
                  <GridItem span={4}>
                    <CapacityGauge
                      available={pool.status?.['memory-available'] || 0}
                      total={pool.spec.memory}
                      label={t('Memory (GB)')}
                    />
                  </GridItem>
                  <GridItem span={4}>
                    <CapacityGauge
                      available={pool.status?.['datastore-available'] || 0}
                      total={pool.spec.storage}
                      label={t('Storage (GB)')}
                    />
                  </GridItem>
                </Grid>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '3Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Networks')}</DescriptionListTerm>
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
                  {t('Topology')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Datacenter')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.datacenter || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Compute Cluster')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.computeCluster || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Datastore')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.datastore || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Folder')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.folder || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Resource Pool')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.resourcePool || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Template')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {pool.spec.topology?.template || '-'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Networks')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {t('{{count}} configured', { count: pool.spec.topology?.networks?.length || 0 })}
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
                    {t('Taints')}
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
                  {t('Active Leases ({{count}})', { count: poolLeases.length })}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                {poolLeases.length === 0 ? (
                  <p>{t('No active leases using this pool.')}</p>
                ) : (
                  <Table aria-label={t('Active leases')} variant="compact">
                    <Thead>
                      <Tr>
                        <Th>{t('Name')}</Th>
                        <Th>{t('Phase')}</Th>
                        <Th>{t('vCPUs')}</Th>
                        <Th>{t('Memory (GB)')}</Th>
                        <Th>{t('Networks')}</Th>
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

export const PoolDetail = withErrorBoundary(PoolDetailComponent);
