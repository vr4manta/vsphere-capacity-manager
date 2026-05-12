import * as React from 'react';
import { Label } from '@patternfly/react-core';
import { Phase } from '@vcm-types/common';
import { PHASE_COLORS } from '@utils/constants';
import { formatPhase } from '@utils/formatting';

export interface StatusBadgeProps {
  phase?: Phase;
  className?: string;
}

/**
 * StatusBadge component displays a colored label for lease phase status
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ phase, className }) => {
  if (!phase) {
    return <Label className={className}>Unknown</Label>;
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
  trueLabel = 'Yes',
  falseLabel = 'No',
  trueColor = 'green',
  falseColor = 'grey',
  className,
}) => {
  return (
    <Label color={(value ? trueColor : falseColor) as any} className={className}>
      {value ? trueLabel : falseLabel}
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
