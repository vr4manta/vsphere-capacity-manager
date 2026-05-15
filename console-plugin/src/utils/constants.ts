// API constants
export const VCM_API_GROUP = 'vspherecapacitymanager.splat.io';
export const VCM_API_VERSION = 'v1';
export const VCM_NAMESPACE = 'vsphere-infra-helpers';

// Resource model definitions
export const PoolModel = {
  apiVersion: `${VCM_API_GROUP}/${VCM_API_VERSION}`,
  apiGroup: VCM_API_GROUP,
  kind: 'Pool',
  plural: 'pools',
  namespaced: true,
  abbr: 'POOL',
  labelPlural: 'Pools',
  label: 'Pool',
};

export const LeaseModel = {
  apiVersion: `${VCM_API_GROUP}/${VCM_API_VERSION}`,
  apiGroup: VCM_API_GROUP,
  kind: 'Lease',
  plural: 'leases',
  namespaced: true,
  abbr: 'LSE',
  labelPlural: 'Leases',
  label: 'Lease',
};

export const NetworkModel = {
  apiVersion: `${VCM_API_GROUP}/${VCM_API_VERSION}`,
  apiGroup: VCM_API_GROUP,
  kind: 'Network',
  plural: 'networks',
  namespaced: true,
  abbr: 'NET',
  labelPlural: 'Networks',
  label: 'Network',
};

// Phase colors - matching reference app design
export const PHASE_COLORS = {
  Fulfilled: 'green',
  Pending: 'orange',
  Partial: 'orange',
  Failed: 'red',
} as const;

// Status colors for pool states
export const STATUS_COLORS = {
  active: 'green',
  excluded: 'grey',
  cordoned: 'orange',
} as const;

// Network type labels
export const NETWORK_TYPE_LABELS = {
  '': 'Default',
  'disconnected': 'Disconnected',
  'single-tenant': 'Single Tenant',
  'multi-tenant': 'Multi Tenant',
  'nested-multi-tenant': 'Nested Multi Tenant',
  'public-ipv6': 'Public IPv6',
} as const;

// Network type label key (from CRD)
export const NETWORK_TYPE_LABEL = 'vsphere-capacity-manager.splat-team.io/network-type';
