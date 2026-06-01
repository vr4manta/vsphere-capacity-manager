import * as React from 'react';
import '../../styles/dark-theme.scss';

interface ProgressBarProps {
  used: number;
  total: number;
  showLabel?: boolean;
  variant?: 'default' | 'warning' | 'danger';
}

/**
 * ProgressBar - Green capacity bar matching reference design
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  used,
  total,
  showLabel = true,
  variant = 'default',
}) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const displayPercentage = Math.min(100, Math.max(0, percentage));

  // Auto-detect variant based on usage
  let barVariant = variant;
  if (variant === 'default') {
    if (percentage >= 90) {
      barVariant = 'danger';
    } else if (percentage >= 75) {
      barVariant = 'warning';
    }
  }

  const barClassName = `vsphere-capacity-manager__progress-bar${
    barVariant !== 'default' ? ` vsphere-capacity-manager__progress-bar--${barVariant}` : ''
  }`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
      <div className={barClassName} style={{ flexGrow: 1, minWidth: '60px' }}>
        <div
          className="vsphere-capacity-manager__progress-bar__fill"
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: '60px' }}>
          {used} / {total}
        </span>
      )}
    </div>
  );
};
