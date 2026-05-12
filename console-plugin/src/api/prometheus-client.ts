import axios from 'axios';

export interface PrometheusValue {
  timestamp: number;
  value: string;
}

export interface PrometheusMetric {
  metric: { [key: string]: string };
  value?: [number, string];
  values?: [number, string][];
}

export interface PrometheusResponse {
  status: string;
  data: {
    resultType: string;
    result: PrometheusMetric[];
  };
}

export interface PrometheusQueryOptions {
  query: string;
  time?: number;
  timeout?: string;
}

export interface PrometheusRangeQueryOptions extends PrometheusQueryOptions {
  start: number;
  end: number;
  step: number;
}

const PROMETHEUS_BASE_PATH = '/api/prometheus-tenancy';

/**
 * Execute an instant Prometheus query
 */
export const queryPrometheus = async (
  query: string,
  time?: number,
): Promise<PrometheusResponse> => {
  const params: any = { query };
  if (time) {
    params.time = time;
  }

  const response = await axios.get(`${PROMETHEUS_BASE_PATH}/api/v1/query`, {
    params,
  });

  return response.data;
};

/**
 * Execute a Prometheus range query
 */
export const queryPrometheusRange = async (
  query: string,
  start: number,
  end: number,
  step: number,
): Promise<PrometheusResponse> => {
  const response = await axios.get(`${PROMETHEUS_BASE_PATH}/api/v1/query_range`, {
    params: {
      query,
      start,
      end,
      step,
    },
  });

  return response.data;
};

/**
 * Parse a single instant query result value
 */
export const parseInstantValue = (result: PrometheusMetric): number => {
  if (result.value) {
    return parseFloat(result.value[1]);
  }
  return 0;
};

/**
 * Parse range query results into time series data
 */
export const parseRangeValues = (
  result: PrometheusMetric,
): Array<{ x: Date; y: number }> => {
  if (!result.values) {
    return [];
  }

  return result.values.map(([timestamp, value]) => ({
    x: new Date(timestamp * 1000),
    y: parseFloat(value),
  }));
};

/**
 * Sum all values from an instant query
 */
export const sumInstantValues = (response: PrometheusResponse): number => {
  if (!response.data?.result) {
    return 0;
  }

  return response.data.result.reduce((sum, metric) => {
    return sum + parseInstantValue(metric);
  }, 0);
};

/**
 * Get average value from an instant query
 */
export const averageInstantValues = (response: PrometheusResponse): number => {
  if (!response.data?.result || response.data.result.length === 0) {
    return 0;
  }

  const sum = sumInstantValues(response);
  return sum / response.data.result.length;
};
