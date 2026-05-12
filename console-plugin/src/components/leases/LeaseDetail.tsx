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
import { useLeaseWatch } from '@hooks/useK8sWatchResource';
import { deleteLease } from '@api/k8s-client';
import { StatusBadge, NetworkTypeBadge } from '../common/StatusBadge';
import { LoadingBox, ErrorBox } from '../common/ResourceList';
import { formatTimestamp, formatCPUs, formatGB } from '@utils/formatting';
import type { Condition, Toleration } from '@vcm-types/common';

export const LeaseDetail: React.FC = () => {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const navigate = useNavigate();
  const [lease, loaded, error] = useLeaseWatch(name!, namespace);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (
      !lease ||
      !window.confirm(`Are you sure you want to delete lease "${lease.metadata.name}"?`)
    ) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteLease(lease.metadata.name!, namespace);
      navigate('/vcm/leases');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete lease');
      setDeleting(false);
    }
  };

  if (!loaded) {
    return <LoadingBox message="Loading lease details..." />;
  }

  if (error || !lease) {
    return <ErrorBox error={error} title="Error loading lease" />;
  }

  const poolInfo = lease.status?.poolInfo || [];
  const hasMultiplePools = poolInfo.length > 1;

  return (
    <Page>
      <PageSection variant="default">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {lease.metadata.name}
            </Title>
          </FlexItem>
          <FlexItem>
            <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
              Delete
            </Button>
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
          {/* Status Card */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h2" size="lg">
                  Status
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '3Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Phase</DescriptionListTerm>
                    <DescriptionListDescription>
                      <StatusBadge phase={lease.status?.phase} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Age</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatTimestamp(lease.metadata.creationTimestamp)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Job Link</DescriptionListTerm>
                    <DescriptionListDescription>
                      {lease.status?.['job-link'] ? (
                        <a
                          href={lease.status['job-link']}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Job
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
                  Resource Requirements
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '3Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTerm>vCPUs</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatCPUs(lease.spec.vcpus || 0)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Memory</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatGB(lease.spec.memory || 0)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Storage</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatGB(lease.spec.storage || 0)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Networks</DescriptionListTerm>
                    <DescriptionListDescription>
                      {lease.spec.networks || 0}
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Network Type</DescriptionListTerm>
                    <DescriptionListDescription>
                      <NetworkTypeBadge networkType={lease.spec['network-type']} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>Number of Pools</DescriptionListTerm>
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
                  Pool Selection
                </Title>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                  {lease.spec['required-pool'] && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Required Pool</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Label color="blue">{lease.spec['required-pool']}</Label>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}

                  {lease.spec.poolSelector && Object.keys(lease.spec.poolSelector).length > 0 && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Pool Selector</DescriptionListTerm>
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
                      <DescriptionListTerm>Boskos Lease ID</DescriptionListTerm>
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
                    Tolerations ({lease.spec.tolerations.length})
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  <Table aria-label="Tolerations" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>Key</Th>
                        <Th>Operator</Th>
                        <Th>Value</Th>
                        <Th>Effect</Th>
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
                    Assigned Pools ({poolInfo.length})
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  <Table aria-label="Assigned pools" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Server</Th>
                        <Th>Region / Zone</Th>
                        <Th>Datacenter</Th>
                        <Th>Short Name</Th>
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
                    Environment Variables
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
                    Conditions ({lease.status.conditions.length})
                  </Title>
                  <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                  <Table aria-label="Conditions" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>Type</Th>
                        <Th>Status</Th>
                        <Th>Severity</Th>
                        <Th>Reason</Th>
                        <Th>Message</Th>
                        <Th>Last Transition</Th>
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
