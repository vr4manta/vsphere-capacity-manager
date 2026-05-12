import { Phase, NetworkType } from '@vcm-types/common';

/**
 * Format bytes to human-readable GB format
 */
export const formatGB = (gb: number): string => {
  if (!gb && gb !== 0) return '-';
  return `${gb} GB`;
};

/**
 * Format CPU count
 */
export const formatCPUs = (cpus: number): string => {
  if (!cpus && cpus !== 0) return '-';
  return `${cpus} vCPUs`;
};

/**
 * Format utilization percentage
 */
export const formatUtilization = (used: number, total: number): string => {
  if (!total) return '0%';
  const percent = ((total - used) / total) * 100;
  return `${Math.round(percent)}%`;
};

/**
 * Format resource display with used/total
 */
export const formatResourceUsage = (available: number, total: number): string => {
  if (!total) return '-';
  const used = total - available;
  return `${used}/${total}`;
};

/**
 * Calculate utilization ratio
 */
export const calculateUtilization = (available: number, total: number): number => {
  if (!total) return 0;
  return ((total - available) / total) * 100;
};

/**
 * Format timestamp to relative time
 */
export const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return '-';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

/**
 * Format phase for display
 */
export const formatPhase = (phase?: Phase): string => {
  return phase || 'Unknown';
};

/**
 * Format network type for display
 */
export const formatNetworkType = (networkType?: NetworkType): string => {
  if (!networkType) return 'Default';
  return networkType
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};
