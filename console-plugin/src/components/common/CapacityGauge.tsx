import * as React from 'react';
import { ChartDonut } from '@patternfly/react-charts';
import { calculateUtilization } from '@utils/formatting';

export interface CapacityGaugeProps {
  available: number;
  total: number;
  label: string;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * CapacityGauge displays a donut chart showing resource utilization
 */
export const CapacityGauge: React.FC<CapacityGaugeProps> = ({
  available,
  total,
  label,
  height = 150,
  width = 150,
  className,
}) => {
  const used = total - available;
  const utilization = calculateUtilization(available, total);

  // Determine color based on utilization
  const getThemeColor = (): string => {
    if (utilization >= 90) return 'red';
    if (utilization >= 75) return 'orange';
    if (utilization >= 50) return 'gold';
    return 'blue';
  };

  if (total === 0) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '14px', color: '#6a6e73' }}>No capacity</div>
        <div style={{ fontSize: '12px', color: '#6a6e73' }}>{label}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ChartDonut
        ariaDesc={`${label} utilization`}
        ariaTitle={label}
        constrainToVisibleArea
        data={[
          { x: 'Used', y: used },
          { x: 'Available', y: available },
        ]}
        labels={({ datum }) => `${datum.x}: ${datum.y}`}
        legendData={[
          { name: `Used: ${used}` },
          { name: `Available: ${available}` },
        ]}
        legendOrientation="vertical"
        legendPosition="right"
        padding={{
          bottom: 20,
          left: 20,
          right: 140,
          top: 20,
        }}
        subTitle={label}
        title={`${Math.round(utilization)}%`}
        themeColor={getThemeColor() as any}
        width={width}
        height={height}
      />
    </div>
  );
};

export interface SimpleCapacityBarProps {
  available: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

/**
 * SimpleCapacityBar displays a simple horizontal bar showing utilization
 */
export const SimpleCapacityBar: React.FC<SimpleCapacityBarProps> = ({
  available,
  total,
  label,
  showPercentage = true,
  className,
}) => {
  const used = total - available;
  const percentage = calculateUtilization(available, total);

  const getColor = (): string => {
    if (percentage >= 90) return '#c9190b'; // red
    if (percentage >= 75) return '#f0ab00'; // orange
    if (percentage >= 50) return '#f4c145'; // gold
    return '#06c'; // blue
  };

  return (
    <div className={className} style={{ width: '100%' }}>
      {label && (
        <div style={{ fontSize: '12px', marginBottom: '4px', color: '#6a6e73' }}>{label}</div>
      )}
      <div
        style={{
          width: '100%',
          height: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: getColor(),
            transition: 'width 0.3s ease',
          }}
        />
        {showPercentage && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '11px',
              fontWeight: 600,
              color: percentage > 50 ? '#fff' : '#151515',
            }}
          >
            {used}/{total} ({Math.round(percentage)}%)
          </div>
        )}
      </div>
    </div>
  );
};
