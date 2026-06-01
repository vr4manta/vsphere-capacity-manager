import * as React from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '@patternfly/react-core';
import '../../styles/dark-theme.scss';

interface StatusBadge {
  label: string;
  count: number;
  color: 'green' | 'orange' | 'red';
}

interface DashboardCardProps {
  title: string;
  count: number;
  badges?: StatusBadge[];
  linkText?: string;
  linkTo?: string;
  updated?: string;
  isLoading?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  count,
  badges = [],
  linkText,
  linkTo,
  updated,
  isLoading,
}) => {
  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (linkTo) {
      navigate(linkTo);
    }
  };

  if (isLoading) {
    return (
      <div className="vsphere-capacity-manager__dashboard-card">
        <div className="vsphere-capacity-manager__dashboard-card__title">{title}</div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="vsphere-capacity-manager__dashboard-card">
      <div className="vsphere-capacity-manager__dashboard-card__title">{title}</div>
      <div className="vsphere-capacity-manager__dashboard-card__count">{count}</div>

      {badges.length > 0 && (
        <div className="vsphere-capacity-manager__dashboard-card__badges">
          {badges.map((badge, index) => (
            <span
              key={index}
              className={`vsphere-capacity-manager__dashboard-card__badge vsphere-capacity-manager__dashboard-card__badge--${badge.color}`}
            >
              {badge.count} {badge.label}
            </span>
          ))}
        </div>
      )}

      {linkText && linkTo && (
        <a
          href={linkTo}
          onClick={handleLinkClick}
          className="vsphere-capacity-manager__dashboard-card__link"
        >
          {linkText}
        </a>
      )}

      {updated && (
        <div className="vsphere-capacity-manager__dashboard-card__updated">
          Updated: {updated}
        </div>
      )}
    </div>
  );
};
