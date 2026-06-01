import * as React from 'react';
import { Card, CardBody, Spinner, Alert } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../../i18n';
import '../../styles/dark-theme.scss';

interface ChartCardProps {
  title: string;
  data: Array<{ x: Date; y: number }>;
  isLoading?: boolean;
  error?: Error | null;
  timePeriod?: string;
  onTimePeriodChange?: (period: string) => void;
}

const TIME_PERIODS = [
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
];

/**
 * ChartCard - Time series chart with dark theme and period selector
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  isLoading,
  error,
  timePeriod = '24h',
  onTimePeriodChange,
}) => {
  const { t } = useTranslation(NAMESPACE);

  if (isLoading) {
    return (
      <div className="vsphere-capacity-manager__chart">
        <div className="vsphere-capacity-manager__chart__header">
          <h3 className="vsphere-capacity-manager__chart__title">{title}</h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vsphere-capacity-manager__chart">
        <div className="vsphere-capacity-manager__chart__header">
          <h3 className="vsphere-capacity-manager__chart__title">{title}</h3>
        </div>
        <Alert variant="warning" title={t('Failed to load chart data')} isInline>
          {error.message}
        </Alert>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="vsphere-capacity-manager__chart">
        <div className="vsphere-capacity-manager__chart__header">
          <h3 className="vsphere-capacity-manager__chart__title">{title}</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#757575' }}>
          {t('No data available')}
        </div>
      </div>
    );
  }

  return (
    <div className="vsphere-capacity-manager__chart">
      <div className="vsphere-capacity-manager__chart__header">
        <h3 className="vsphere-capacity-manager__chart__title">{title}</h3>
        {onTimePeriodChange && (
          <div className="vsphere-capacity-manager__chart__time-selector">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                className={`vsphere-capacity-manager__chart__time-button ${
                  timePeriod === period.value
                    ? 'vsphere-capacity-manager__chart__time-button--active'
                    : ''
                }`}
                onClick={() => onTimePeriodChange(period.value)}
              >
                {period.label}
              </button>
            ))}
          </div>
        )}
      </div>
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
          // Dark theme styling
          themeColor="blue"
        >
          <ChartAxis
            tickFormat={(t) => new Date(t).toLocaleTimeString()}
            style={{
              axis: { stroke: '#4a4a4a' },
              tickLabels: { fill: '#b0b0b0', fontSize: 10 },
              grid: { stroke: '#3a3a3a' },
            }}
          />
          <ChartAxis
            dependentAxis
            tickFormat={(t) => `${t}%`}
            style={{
              axis: { stroke: '#4a4a4a' },
              tickLabels: { fill: '#b0b0b0', fontSize: 10 },
              grid: { stroke: '#3a3a3a' },
            }}
          />
          <ChartGroup>
            <ChartLine
              data={data}
              style={{
                data: { stroke: '#2196f3', strokeWidth: 2 },
              }}
            />
          </ChartGroup>
        </Chart>
      </div>
    </div>
  );
};
