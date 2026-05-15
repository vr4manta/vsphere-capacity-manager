import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@patternfly/react-core';
import { Phase } from '@vcm-types/common';
import { PHASE_COLORS } from '@utils/constants';
import { formatPhase } from '@utils/formatting';
import { NAMESPACE } from '../../i18n';
import '../../styles/dark-theme.scss';

export interface StatusBadgeProps {
  phase?: Phase;
  className?: string;
}

/**
 * StatusBadge component displays a colored label for lease phase status
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ phase, className }) => {
  const { t } = useTranslation(NAMESPACE);

  if (!phase) {
    return <Label className={className}>{t('Unknown')}</Label>;
  }

  const color = PHASE_COLORS[phase] || 'grey';

  return (
    <Label color={color as any} className={className}>
      {formatPhase(phase)}
    </Label>
  );
};

export interface BooleanBadgeProps {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
  trueColor?: string;
  falseColor?: string;
  className?: string;
}

/**
 * BooleanBadge displays a colored label for boolean values
 */
export const BooleanBadge: React.FC<BooleanBadgeProps> = ({
  value,
  trueLabel,
  falseLabel,
  trueColor = 'green',
  falseColor = 'grey',
  className,
}) => {
  const { t } = useTranslation(NAMESPACE);

  return (
    <Label color={(value ? trueColor : falseColor) as any} className={className}>
      {value ? (trueLabel || t('Yes')) : (falseLabel || t('No'))}
    </Label>
  );
};

export interface NetworkTypeBadgeProps {
  networkType?: string;
  className?: string;
}

/**
 * NetworkTypeBadge displays a badge for network type
 */
export const NetworkTypeBadge: React.FC<NetworkTypeBadgeProps> = ({
  networkType,
  className,
}) => {
  const getColor = (type?: string) => {
    switch (type) {
      case 'single-tenant':
        return 'blue';
      case 'multi-tenant':
        return 'purple';
      case 'disconnected':
        return 'orange';
      case 'nested-multi-tenant':
        return 'cyan';
      case 'public-ipv6':
        return 'green';
      default:
        return 'grey';
    }
  };

  const label = networkType || 'default';

  return (
    <Label color={getColor(networkType) as any} className={className}>
      {label}
    </Label>
  );
};

/**
 * DarkStatusBadge - Custom dark theme status badge matching reference design
 */
export interface DarkStatusBadgeProps {
  status: 'active' | 'fulfilled' | 'pending' | 'failed' | 'excluded';
  label?: string;
}

export const DarkStatusBadge: React.FC<DarkStatusBadgeProps> = ({ status, label }) => {
  const displayLabel = label || status.toUpperCase();

  return (
    <span className={`vsphere-capacity-manager__status-badge vsphere-capacity-manager__status-badge--${status}`}>
      {displayLabel}
    </span>
  );
};
