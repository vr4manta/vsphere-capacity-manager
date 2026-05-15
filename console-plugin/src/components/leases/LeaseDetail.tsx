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
  Flex,
  FlexItem,
  Label,
  CodeBlock,
  CodeBlockCode,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../../i18n';
import { useLeaseWatch } from '@hooks/useK8sWatchResource';
import { deleteLease } from '@api/k8s-client';
import { StatusBadge, NetworkTypeBadge } from '../common/StatusBadge';
import { LoadingBox, ErrorBox } from '../common/ResourceList';
import { formatTimestamp, formatCPUs, formatGB } from '@utils/formatting';
import { withErrorBoundary } from '../common/WithErrorBoundary';
import type { Condition, Toleration } from '@vcm-types/common';

const LeaseDetailComponent: React.FC = () => {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACE);
  const [lease, loaded, error] = useLeaseWatch(name!, namespace);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (
      !lease ||
      !window.confirm(t('Are you sure you want to delete {{resourceType}} "{{name}}"?', { resourceType: 'lease', name: lease.metadata.name }))
    ) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteLease(lease.metadata.name!, namespace);
      navigate('/vcm/leases');
    } catch (err: any) {
      setDeleteError(err.message || t('Failed to delete {{resourceType}}', { resourceType: 'lease' }));
      setDeleting(false);
    }
  };

  if (!loaded) {
    return <LoadingBox message={t('Loading {{resource}} details...', { resource: 'lease' })} />;
  }

  if (error || !lease) {
    return <ErrorBox error={error} title={t('Error loading {{resource}}', { resource: 'lease' })} />;
  }

  const poolInfo = lease.status?.poolInfo || [];
  const hasMultiplePools = poolInfo.length > 1;

  return (
    <Page style={{ height: "100%", width: "100%" }}>
      <PageSection variant="default" style={{ width: "100%" }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {lease.metadata.name}
            </Title>
          </FlexItem>
          <FlexItem>
            <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
              {t('Delete')}
            </Button>
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
          {/* Status Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  {t('Status')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '3Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Phase')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <StatusBadge phase={lease.status?.phase} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Age')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatTimestamp(lease.metadata.creationTimestamp)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Job Link')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {lease.status?.['job-link'] ? (
                        <a
                          href={lease.status['job-link']}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('View Job')}
                        </a>
                      ) : (
                        '-'
                      )}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* Resource Requirements Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  {t('Resource Requirements')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '3Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('vCPUs')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatCPUs(lease.spec.vcpus || 0)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Memory')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatGB(lease.spec.memory || 0)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Storage')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatGB(lease.spec.storage || 0)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Networks')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {lease.spec.networks || 0}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Network Type')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <NetworkTypeBadge networkType={lease.spec['network-type']} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Number of Pools')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {lease.spec.pools || 1}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* Pool Selection Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  {t('Pool Selection')}
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                  {lease.spec['required-pool'] && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Required Pool')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Label color="blue">{lease.spec['required-pool']}</Label>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}

                  {lease.spec.poolSelector && Object.keys(lease.spec.poolSelector).length > 0 && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Pool Selector')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                          {Object.entries(lease.spec.poolSelector).map(([key, value]) => (
                            <Label key={key} color="teal">
                              {key}={value}
                            </Label>
                          ))}
                        </Flex>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}

                  {lease.spec['boskos-lease-id'] && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Boskos Lease ID')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {lease.spec['boskos-lease-id']}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                </DescriptionList>
              </CardBody>
            </Card>
          </GridItem>

          {/* Tolerations Card */}
          {lease.spec.tolerations && lease.spec.tolerations.length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <Title headingLevel="h2" size="lg">
                    {t('Tolerations')} ({lease.spec.tolerations.length})
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  <Table aria-label="Tolerations" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>{t('Key')}</Th>
                        <Th>{t('Operator')}</Th>
                        <Th>{t('Value')}</Th>
                        <Th>{t('Effect')}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {lease.spec.tolerations.map((toleration: Toleration, idx: number) => (
                        <Tr key={idx}>
                          <Td>{toleration.key || '(all)'}</Td>
                          <Td>{toleration.operator || 'Equal'}</Td>
                          <Td>{toleration.value || '-'}</Td>
                          <Td>{toleration.effect || '(all)'}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </GridItem>
          )}

          {/* Assigned Pools Card */}
          {poolInfo.length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <Title headingLevel="h2" size="lg">
                    {t('Assigned Pools')} ({poolInfo.length})
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  <Table aria-label="Assigned pools" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>{t('Name')}</Th>
                        <Th>{t('Server')}</Th>
                        <Th>{t('Region / Zone')}</Th>
                        <Th>{t('Datacenter')}</Th>
                        <Th>{t('Short Name')}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {poolInfo.map((pool, idx) => (
                        <Tr key={idx}>
                          <Td>{pool.name}</Td>
                          <Td>{pool.server}</Td>
                          <Td>
                            {pool.region} / {pool.zone}
                          </Td>
                          <Td>{pool.topology?.datacenter || '-'}</Td>
                          <Td>{pool.shortName || '-'}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </GridItem>
          )}

          {/* Environment Variables Card */}
          {lease.status?.envVarsMap && Object.keys(lease.status.envVarsMap).length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <Title headingLevel="h2" size="lg">
                    {t('Environment Variables')}
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  {Object.entries(lease.status.envVarsMap).map(([poolName, envVars]) => (
                    <div key={poolName} style={{ marginBottom: '1rem' }}>
                      {hasMultiplePools && (
                        <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem' }}>
                          Pool: {poolName}
                        </Title>
                      )}
                      <CodeBlock>
                        <CodeBlockCode>{envVars}</CodeBlockCode>
                      </CodeBlock>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </GridItem>
          )}

          {/* Conditions Card */}
          {lease.status?.conditions && lease.status.conditions.length > 0 && (
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <Title headingLevel="h2" size="lg">
                    {t('Conditions')} ({lease.status.conditions.length})
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  <Table aria-label="Conditions" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>{t('Type')}</Th>
                        <Th>{t('Status')}</Th>
                        <Th>{t('Severity')}</Th>
                        <Th>{t('Reason')}</Th>
                        <Th>{t('Message')}</Th>
                        <Th>{t('Last Transition')}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {lease.status.conditions.map((condition: Condition, idx: number) => (
                        <Tr key={idx}>
                          <Td>{condition.type}</Td>
                          <Td>
                            <Label
                              color={
                                condition.status === 'True'
                                  ? 'green'
                                  : condition.status === 'False'
                                  ? 'red'
                                  : 'grey'
                              }
                            >
                              {condition.status}
                            </Label>
                          </Td>
                          <Td>{condition.severity || '-'}</Td>
                          <Td>{condition.reason || '-'}</Td>
                          <Td>{condition.message || '-'}</Td>
                          <Td>
                            {condition.lastTransitionTime
                              ? formatTimestamp(condition.lastTransitionTime)
                              : '-'}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </GridItem>
          )}
        </Grid>
      </PageSection>
    </Page>
  );
};

export const LeaseDetail = withErrorBoundary(LeaseDetailComponent);
