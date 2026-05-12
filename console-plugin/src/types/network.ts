import { ObjectMeta, TypeMeta } from './common';

export interface NetworkSpec {
  portGroupName: string;
  vlanId: string;
  podName?: string;
  datacenterName?: string;
  cidr?: number;
  gateway?: string;
  ipAddressCount?: number;
  netmask?: string;
  subnetType?: string;
  machineNetworkCidr?: string;
  ipAddresses?: string[];
  cidrIPv6?: number;
  gatewayipv6?: string;
  ipv6prefix?: string;
  startIPv6Address?: string;
  primaryRouterHostname?: string;
  nameservers?: string[];
}

export interface NetworkStatus {
  // Currently empty but reserved for future use
}

export interface Network extends TypeMeta {
  metadata: ObjectMeta;
  spec: NetworkSpec;
  status?: NetworkStatus;
}

export interface NetworkList {
  apiVersion: string;
  kind: string;
  metadata: {
    resourceVersion?: string;
  };
  items: Network[];
}

// Constants
export const NETWORK_API_GROUP = 'vspherecapacitymanager.splat.io';
export const NETWORK_API_VERSION = 'v1';
export const NETWORK_KIND = 'Network';
export const NETWORK_PLURAL = 'networks';
export const NETWORK_TYPE_LABEL = 'vsphere-capacity-manager.splat-team.io/network-type';
