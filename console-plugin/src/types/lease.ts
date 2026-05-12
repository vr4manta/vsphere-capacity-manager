import {
  ObjectMeta,
  TypeMeta,
  FailureDomainSpec,
  Toleration,
  NetworkType,
  Phase,
  Condition,
} from './common';

export interface LeaseSpec {
  vcpus?: number;
  memory?: number;
  pools?: number;
  storage?: number;
  networks: number;
  'required-pool'?: string;
  poolSelector?: { [key: string]: string };
  tolerations?: Toleration[];
  'network-type': NetworkType;
  'boskos-lease-id'?: string;
}

export interface LeaseStatus extends FailureDomainSpec {
  poolInfo?: FailureDomainSpec[];
  envVars?: string;
  envVarsMap?: { [key: string]: string };
  phase?: Phase;
  conditions?: Condition[];
  'job-link'?: string;
}

export interface Lease extends TypeMeta {
  metadata: ObjectMeta;
  spec: LeaseSpec;
  status: LeaseStatus;
}

export interface LeaseList {
  apiVersion: string;
  kind: string;
  metadata: {
    resourceVersion?: string;
  };
  items: Lease[];
}

// Constants
export const LEASE_API_GROUP = 'vspherecapacitymanager.splat.io';
export const LEASE_API_VERSION = 'v1';
export const LEASE_KIND = 'Lease';
export const LEASE_PLURAL = 'leases';
