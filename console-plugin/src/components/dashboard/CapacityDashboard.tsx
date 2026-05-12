import * as React from 'react';
import { useNavigate } from 'react-router';
import {
  Page,
  PageSection,
  Title,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Button,
  Flex,
  FlexItem,
  Spinner,
  Alert,
} from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
  ChartDonut,
  ChartThemeColor,
} from '@patternfly/react-charts';
import {
  usePoolCapacityMetrics,
  useLeaseStats,
  useNetworkTypeStats,
  usePoolUtilizationHistory,
} from '@hooks/usePrometheusQuery';
import { parseInstantValue, parseRangeValues, sumInstantValues } from '@api/prometheus-client';
import { formatCPUs, formatGB, formatUtilization } from '@utils/formatting';

const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  isLoading?: boolean;
}> = ({ title, value, subtitle, isLoading }) => (
  <Card>
    <CardTitle>{title}</CardTitle>
    <CardBody>
      {isLoading ? (
        <Spinner size="md" />
      ) : (
        <>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {value}
          </div>
          {subtitle && <div style={{ fontSize: '0.875rem', color: '#6a6e73' }}>{subtitle}</div>}
        </>
      )}
    </CardBody>
  </Card>
);

const UtilizationChart: React.FC<{
  title: string;
  data: Array<{ x: Date; y: number }>;
  isLoading?: boolean;
  error?: Error | null;
}> = ({ title, data, isLoading, error }) => {
  if (isLoading) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <Flex justifyContent={{ default: 'justifyContentCenter' }} style={{ padding: '2rem' }}>
            <Spinner size="lg" />
          </Flex>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <Alert variant="warning" title="Failed to load chart data" isInline>
            {error.message}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6a6e73' }}>
            No data available
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <div style={{ height: '250px' }}>
          <Chart
            ariaTitle={title}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                constrainToVisibleArea
              />
            }
            height={250}
            padding={{
              bottom: 50,
              left: 50,
              right: 20,
              top: 20,
            }}
            themeColor={ChartThemeColor.blue}
          >
            <ChartAxis tickFormat={(t) => new Date(t).toLocaleTimeString()} />
            <ChartAxis dependentAxis tickFormat={(t) => `${t}%`} />
            <ChartGroup>
              <ChartLine data={data} />
            </ChartGroup>
          </Chart>
        </div>
      </CardBody>
    </Card>
  );
};

const NetworkTypeDonut: React.FC<{
  data: { [key: string]: number };
  isLoading?: boolean;
}> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardTitle>Network Types</CardTitle>
        <CardBody>
          <Flex justifyContent={{ default: 'justifyContentCenter' }} style={{ padding: '2rem' }}>
            <Spinner size="lg" />
          </Flex>
        </CardBody>
      </Card>
    );
  }

  const chartData = Object.entries(data).map(([networkType, count]) => ({
    x: networkType || 'default',
    y: count,
  }));

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return (
      <Card>
        <CardTitle>Network Types</CardTitle>
        <CardBody>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6a6e73' }}>
            No networks available
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>Network Types</CardTitle>
      <CardBody>
        <div style={{ height: '250px' }}>
          <ChartDonut
            ariaTitle="Network type distribution"
            constrainToVisibleArea
            data={chartData}
            height={250}
            labels={({ datum }) => `${datum.x}: ${datum.y}`}
            padding={{
              bottom: 20,
              left: 20,
              right: 140,
              top: 20,
            }}
            subTitle="Networks"
            title={total.toString()}
            themeColor={ChartThemeColor.multiOrdered}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export const CapacityDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch all metrics
  const {
    totalVCPUs,
    usedVCPUs,
    totalMemory,
    usedMemory,
    totalStorage,
    usedStorage,
  } = usePoolCapacityMetrics();

  const { fulfilledLeases, pendingLeases, failedLeases, partialLeases } = useLeaseStats();

  const networkTypeStats = useNetworkTypeStats();

  const { cpuUtilization, memoryUtilization } = usePoolUtilizationHistory(60);

  // Parse capacity values
  const totalVCPUsValue = totalVCPUs.data ? sumInstantValues(totalVCPUs.data) : 0;
  const usedVCPUsValue = usedVCPUs.data ? sumInstantValues(usedVCPUs.data) : 0;
  const totalMemoryValue = totalMemory.data ? sumInstantValues(totalMemory.data) : 0;
  const usedMemoryValue = usedMemory.data ? sumInstantValues(usedMemory.data) : 0;
  const totalStorageValue = totalStorage.data ? sumInstantValues(totalStorage.data) : 0;
  const usedStorageValue = usedStorage.data ? sumInstantValues(usedStorage.data) : 0;

  // Parse lease counts
  const fulfilledCount = fulfilledLeases.data ? sumInstantValues(fulfilledLeases.data) : 0;
  const pendingCount = pendingLeases.data ? sumInstantValues(pendingLeases.data) : 0;
  const failedCount = failedLeases.data ? sumInstantValues(failedLeases.data) : 0;
  const partialCount = partialLeases.data ? sumInstantValues(partialLeases.data) : 0;
  const totalLeases = fulfilledCount + pendingCount + failedCount + partialCount;

  // Parse network type stats
  const networkTypeData: { [key: string]: number } = {};
  if (networkTypeStats.data?.data?.result) {
    networkTypeStats.data.data.result.forEach((metric) => {
      const networkType = metric.metric.network_type || 'default';
      const count = parseInstantValue(metric);
      networkTypeData[networkType] = count;
    });
  }

  // Parse utilization history
  const cpuUtilizationData =
    cpuUtilization.data?.data?.result?.[0]
      ? parseRangeValues(cpuUtilization.data.data.result[0])
      : [];

  const memoryUtilizationData =
    memoryUtilization.data?.data?.result?.[0]
      ? parseRangeValues(memoryUtilization.data.data.result[0])
      : [];

  return (
    <Page>
      <PageSection variant="default">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              vSphere Capacity Overview
            </Title>
          </FlexItem>
          <FlexItem>
            <Flex>
              <FlexItem>
                <Button variant="primary" onClick={() => navigate('/vcm/leases/new')}>
                  Create Lease
                </Button>
              </FlexItem>
              <FlexItem>
                <Button variant="secondary" onClick={() => navigate('/vcm/pools/new')}>
                  Create Pool
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection>
        {/* Aggregate Capacity Metrics */}
        <Grid hasGutter>
          <GridItem span={4}>
            <MetricCard
              title="Total vCPUs"
              value={formatCPUs(totalVCPUsValue)}
              subtitle={`${formatCPUs(usedVCPUsValue)} used (${formatUtilization(
                usedVCPUsValue,
                totalVCPUsValue,
              )})`}
              isLoading={totalVCPUs.isLoading || usedVCPUs.isLoading}
            />
          </GridItem>
          <GridItem span={4}>
            <MetricCard
              title="Total Memory"
              value={formatGB(totalMemoryValue)}
              subtitle={`${formatGB(usedMemoryValue)} used (${formatUtilization(
                usedMemoryValue,
                totalMemoryValue,
              )})`}
              isLoading={totalMemory.isLoading || usedMemory.isLoading}
            />
          </GridItem>
          <GridItem span={4}>
            <MetricCard
              title="Total Storage"
              value={formatGB(totalStorageValue)}
              subtitle={`${formatGB(usedStorageValue)} used (${formatUtilization(
                usedStorageValue,
                totalStorageValue,
              )})`}
              isLoading={totalStorage.isLoading || usedStorage.isLoading}
            />
          </GridItem>
        </Grid>

        {/* Lease Statistics */}
        <Grid hasGutter style={{ marginTop: '1.5rem' }}>
          <GridItem span={3}>
            <MetricCard
              title="Active Leases"
              value={totalLeases.toString()}
              isLoading={
                fulfilledLeases.isLoading ||
                pendingLeases.isLoading ||
                failedLeases.isLoading ||
                partialLeases.isLoading
              }
            />
          </GridItem>
          <GridItem span={3}>
            <MetricCard
              title="Fulfilled"
              value={fulfilledCount.toString()}
              subtitle="Fully allocated"
              isLoading={fulfilledLeases.isLoading}
            />
          </GridItem>
          <GridItem span={3}>
            <MetricCard
              title="Pending"
              value={pendingCount.toString()}
              subtitle="Awaiting resources"
              isLoading={pendingLeases.isLoading}
            />
          </GridItem>
          <GridItem span={3}>
            <MetricCard
              title="Partial"
              value={partialCount.toString()}
              subtitle="Partially allocated"
              isLoading={partialLeases.isLoading}
            />
          </GridItem>
        </Grid>

        {/* Utilization Charts */}
        <Grid hasGutter style={{ marginTop: '1.5rem' }}>
          <GridItem span={6}>
            <UtilizationChart
              title="CPU Utilization (Last Hour)"
              data={cpuUtilizationData}
              isLoading={cpuUtilization.isLoading}
              error={cpuUtilization.error}
            />
          </GridItem>
          <GridItem span={6}>
            <UtilizationChart
              title="Memory Utilization (Last Hour)"
              data={memoryUtilizationData}
              isLoading={memoryUtilization.isLoading}
              error={memoryUtilization.error}
            />
          </GridItem>
        </Grid>

        {/* Network Type Distribution */}
        <Grid hasGutter style={{ marginTop: '1.5rem' }}>
          <GridItem span={12}>
            <NetworkTypeDonut data={networkTypeData} isLoading={networkTypeStats.isLoading} />
          </GridItem>
        </Grid>
      </PageSection>
    </Page>
  );
};
