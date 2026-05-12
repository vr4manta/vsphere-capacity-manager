import { useQuery, UseQueryResult } from 'react-query';
import {
  queryPrometheus,
  queryPrometheusRange,
  PrometheusResponse,
} from '@api/prometheus-client';

export interface UsePrometheusQueryOptions {
  query: string;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UsePrometheusRangeQueryOptions extends UsePrometheusQueryOptions {
  start: number;
  end: number;
  step: number;
}

/**
 * Hook for instant Prometheus queries
 */
export const usePrometheusQuery = (
  options: UsePrometheusQueryOptions,
): UseQueryResult<PrometheusResponse, Error> => {
  const { query, enabled = true, refetchInterval = 30000 } = options;

  return useQuery<PrometheusResponse, Error>(
    ['prometheus', query],
    () => queryPrometheus(query),
    {
      enabled: enabled && !!query,
      refetchInterval,
      retry: 2,
      staleTime: 10000,
    },
  );
};

/**
 * Hook for Prometheus range queries
 */
export const usePrometheusRangeQuery = (
  options: UsePrometheusRangeQueryOptions,
): UseQueryResult<PrometheusResponse, Error> => {
  const { query, start, end, step, enabled = true, refetchInterval = 60000 } = options;

  return useQuery<PrometheusResponse, Error>(
    ['prometheus-range', query, start, end, step],
    () => queryPrometheusRange(query, start, end, step),
    {
      enabled: enabled && !!query,
      refetchInterval,
      retry: 2,
      staleTime: 30000,
    },
  );
};

/**
 * Hook for aggregate pool capacity metrics
 */
export const usePoolCapacityMetrics = () => {
  const totalVCPUs = usePrometheusQuery({
    query: 'sum(pool_vcpus_total)',
  });

  const usedVCPUs = usePrometheusQuery({
    query: 'sum(pool_vcpus_used)',
  });

  const totalMemory = usePrometheusQuery({
    query: 'sum(pool_memory_total)',
  });

  const usedMemory = usePrometheusQuery({
    query: 'sum(pool_memory_used)',
  });

  const totalStorage = usePrometheusQuery({
    query: 'sum(pool_storage_total)',
  });

  const usedStorage = usePrometheusQuery({
    query: 'sum(pool_storage_used)',
  });

  return {
    totalVCPUs,
    usedVCPUs,
    totalMemory,
    usedMemory,
    totalStorage,
    usedStorage,
  };
};

/**
 * Hook for lease counts by phase
 */
export const useLeaseStats = () => {
  const fulfilledLeases = usePrometheusQuery({
    query: 'sum(leases_counts{phase="Fulfilled"})',
  });

  const pendingLeases = usePrometheusQuery({
    query: 'sum(leases_counts{phase="Pending"})',
  });

  const failedLeases = usePrometheusQuery({
    query: 'sum(leases_counts{phase="Failed"})',
  });

  const partialLeases = usePrometheusQuery({
    query: 'sum(leases_counts{phase="Partial"})',
  });

  return {
    fulfilledLeases,
    pendingLeases,
    failedLeases,
    partialLeases,
  };
};

/**
 * Hook for network type distribution
 */
export const useNetworkTypeStats = () => {
  return usePrometheusQuery({
    query: 'sum by (network_type) (pool_networks_available_by_type)',
  });
};

/**
 * Hook for pool utilization over time
 */
export const usePoolUtilizationHistory = (durationMinutes: number = 60) => {
  const now = Math.floor(Date.now() / 1000);
  const start = now - durationMinutes * 60;
  const step = Math.max(60, Math.floor(durationMinutes * 60 / 100));

  const cpuUtilization = usePrometheusRangeQuery({
    query: 'avg(pool_vcpus_utilization_ratio) * 100',
    start,
    end: now,
    step,
  });

  const memoryUtilization = usePrometheusRangeQuery({
    query: 'avg(pool_memory_utilization_ratio) * 100',
    start,
    end: now,
    step,
  });

  return {
    cpuUtilization,
    memoryUtilization,
  };
};
