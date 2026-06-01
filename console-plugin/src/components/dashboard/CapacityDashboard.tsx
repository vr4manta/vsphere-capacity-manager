import * as React from 'react';
import { useNavigate } from 'react-router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { NAMESPACE } from '../../i18n';
import {
  PageSection,
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
import { withErrorBoundary } from '../common/WithErrorBoundary';
import { DashboardCard } from './DashboardCard';
import { usePoolsWatch, useNetworksWatch } from '@hooks/useK8sWatchResource';

// Create QueryClient instance for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
  const { t } = useTranslation(NAMESPACE);

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
          <Alert variant="warning" title={t('Failed to load chart data')} isInline>
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
            {t('No data available')}
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
  const { t } = useTranslation(NAMESPACE);

  if (isLoading) {
    return (
      <Card>
        <CardTitle>{t('Network Types')}</CardTitle>
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
        <CardTitle>{t('Network Types')}</CardTitle>
        <CardBody>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6a6e73' }}>
            {t('No networks available')}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>{t('Network Types')}</CardTitle>
      <CardBody>
        <div style={{ height: '250px' }}>
          <ChartDonut
            ariaTitle={t('Network type distribution')}
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
            subTitle={t('Networks')}
            title={total.toString()}
            themeColor={ChartThemeColor.multiOrdered}
          />
        </div>
      </CardBody>
    </Card>
  );
};

const CapacityDashboardInner: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(NAMESPACE);

  // Watch K8s resources
  const [pools, poolsLoaded] = usePoolsWatch();
  const [networks, networksLoaded] = useNetworksWatch();

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

  // Calculate pool counts
  const totalPools = pools?.length || 0;
  const activePools = pools?.filter(p => !p.spec.noSchedule && !p.spec.exclude).length || 0;
  const cordonedPools = pools?.filter(p => p.spec.noSchedule).length || 0;
  const excludedPools = pools?.filter(p => p.spec.exclude).length || 0;

  // Calculate network count
  const totalNetworks = networks?.length || 0;

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
    <>
      <ListPageHeader title={t('vSphere Capacity Overview')} />
      <PageSection>
        {/* Dashboard Overview Cards */}
        <Grid hasGutter>
          <GridItem md={4} sm={12}>
            <DashboardCard
              title="POOLS"
              count={totalPools}
              badges={[
                { label: 'active', count: activePools, color: 'green' },
                { label: 'cordoned', count: cordonedPools, color: 'orange' },
                { label: 'excluded', count: excludedPools, color: 'red' },
              ]}
              linkText="View Pools"
              linkTo="/vcm/pools"
              isLoading={!poolsLoaded}
            />
          </GridItem>
          <GridItem md={4} sm={12}>
            <DashboardCard
              title="LEASES"
              count={totalLeases}
              badges={[
                { label: 'fulfilled', count: fulfilledCount, color: 'green' },
                { label: 'pending', count: pendingCount, color: 'orange' },
                { label: 'failed', count: failedCount, color: 'red' },
              ]}
              linkText="View Leases"
              linkTo="/vcm/leases"
              isLoading={
                fulfilledLeases.isLoading ||
                pendingLeases.isLoading ||
                failedLeases.isLoading ||
                partialLeases.isLoading
              }
            />
          </GridItem>
          <GridItem md={4} sm={12}>
            <DashboardCard
              title="NETWORKS"
              count={totalNetworks}
              linkText="View Networks"
              linkTo="/vcm/networks"
              isLoading={!networksLoaded}
            />
          </GridItem>
        </Grid>

        {/* Utilization Charts */}
        <Grid hasGutter style={{ marginTop: '1.5rem' }}>
          <GridItem span={6}>
            <UtilizationChart
              title={t('CPU Utilization (Last Hour)')}
              data={cpuUtilizationData}
              isLoading={cpuUtilization.isLoading}
              error={cpuUtilization.error}
            />
          </GridItem>
          <GridItem span={6}>
            <UtilizationChart
              title={t('Memory Utilization (Last Hour)')}
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
    </>
  );
};

// Wrap the component with QueryClientProvider for react-query
const CapacityDashboardWithProvider: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CapacityDashboardInner />
    </QueryClientProvider>
  );
};

export const CapacityDashboard = withErrorBoundary(CapacityDashboardWithProvider);
