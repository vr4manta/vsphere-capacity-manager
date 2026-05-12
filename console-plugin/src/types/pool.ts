import { ObjectMeta, TypeMeta, FailureDomainSpec, Taint } from './common';

export interface IBMPoolSpec {
  pod: string;
  datacenter: string;
}

export interface PoolSpec extends FailureDomainSpec {
  ibmPoolSpec?: IBMPoolSpec;
  vcpus: number;
  overCommitRatio: string;
  memory: number;
  storage: number;
  exclude: boolean;
  noSchedule?: boolean;
  taints?: Taint[];
}

export interface PoolStatus {
  'vcpus-available': number;
  'memory-available': number;
  'datastore-available': number;
  'network-available': number;
  'lease-count': number;
  initialized: boolean;
}

export interface Pool extends TypeMeta {
  metadata: ObjectMeta;
  spec: PoolSpec;
  status: PoolStatus;
}

export interface PoolList {
  apiVersion: string;
  kind: string;
  metadata: {
    resourceVersion?: string;
  };
  items: Pool[];
}

// Constants
export const POOL_API_GROUP = 'vspherecapacitymanager.splat.io';
export const POOL_API_VERSION = 'v1';
export const POOL_KIND = 'Pool';
export const POOL_PLURAL = 'pools';
