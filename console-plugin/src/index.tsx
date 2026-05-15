// This is the entry point for the OpenShift Console Dynamic Plugin
// It registers navigation items and routes with the OpenShift Console

import type { Extension } from '@openshift-console/dynamic-plugin-sdk/lib/types';

// Initialize i18n for the plugin
import './i18n';

// Import dark theme styling
import './styles/dark-theme.scss';

const extensions: Extension[] = [
  // Navigation section
  {
    type: 'console.navigation/section',
    properties: {
      id: 'vsphere-capacity-manager',
      name: 'vSphere Capacity',
      insertAfter: 'workloads',
    },
  },
  // Dashboard navigation item
  {
    type: 'console.navigation/href',
    properties: {
      id: 'vcm-dashboard',
      section: 'vsphere-capacity-manager',
      name: 'Dashboard',
      href: '/vcm/dashboard',
    },
  },
  // Pools navigation item
  {
    type: 'console.navigation/href',
    properties: {
      id: 'vcm-pools',
      section: 'vsphere-capacity-manager',
      name: 'Pools',
      href: '/vcm/pools',
    },
  },
  // Leases navigation item
  {
    type: 'console.navigation/href',
    properties: {
      id: 'vcm-leases',
      section: 'vsphere-capacity-manager',
      name: 'Leases',
      href: '/vcm/leases',
    },
  },
  // Networks navigation item
  {
    type: 'console.navigation/href',
    properties: {
      id: 'vcm-networks',
      section: 'vsphere-capacity-manager',
      name: 'Networks',
      href: '/vcm/networks',
    },
  },
  // Dashboard route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/dashboard',
      component: { $codeRef: 'CapacityDashboard' },
    },
  },
  // Pool list route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/pools',
      component: { $codeRef: 'PoolList' },
    },
  },
  // Pool create route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/pools/new',
      component: { $codeRef: 'PoolForm' },
    },
  },
  // Pool detail route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/pools/:namespace/:name',
      component: { $codeRef: 'PoolDetail' },
    },
  },
  // Pool edit route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/pools/:namespace/:name/edit',
      component: { $codeRef: 'PoolForm' },
    },
  },
  // Lease list route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/leases',
      component: { $codeRef: 'LeaseList' },
    },
  },
  // Lease create route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/leases/new',
      component: { $codeRef: 'LeaseForm' },
    },
  },
  // Lease detail route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/leases/:namespace/:name',
      component: { $codeRef: 'LeaseDetail' },
    },
  },
  // Network list route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/networks',
      component: { $codeRef: 'NetworkList' },
    },
  },
  // Network create route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/networks/new',
      component: { $codeRef: 'NetworkForm' },
    },
  },
  // Network detail route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/networks/:namespace/:name',
      component: { $codeRef: 'NetworkDetail' },
    },
  },
  // Network edit route
  {
    type: 'console.page/route',
    properties: {
      exact: true,
      path: '/vcm/networks/:namespace/:name/edit',
      component: { $codeRef: 'NetworkForm' },
    },
  },
];

export default extensions;

console.log('vSphere Capacity Manager Console Plugin loaded');
