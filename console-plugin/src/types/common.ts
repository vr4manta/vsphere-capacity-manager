// Common Kubernetes types
export interface ObjectMeta {
  name?: string;
  namespace?: string;
  uid?: string;
  resourceVersion?: string;
  generation?: number;
  creationTimestamp?: string;
  deletionTimestamp?: string;
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
}

export interface TypeMeta {
  apiVersion: string;
  kind: string;
}

// Condition types
export type ConditionType = 'Delayed' | 'Fulfilled' | 'Partial' | 'Pending';
export type ConditionStatus = 'True' | 'False' | 'Unknown';
export type ConditionSeverity = 'Error' | 'Warning' | 'Info' | '';

export interface Condition {
  type: ConditionType;
  status: ConditionStatus;
  severity?: ConditionSeverity;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

// Phase types
export type Phase = 'Fulfilled' | 'Partial' | 'Pending' | 'Failed';

// VSpherePlatformTopology from OpenShift config API
export interface VSpherePlatformTopology {
  datacenter: string;
  computeCluster: string;
  datastore: string;
  folder?: string;
  resourcePool?: string;
  networks: string[];
  template?: string;
}

// FailureDomainSpec
export interface FailureDomainSpec {
  name: string;
  region: string;
  zone: string;
  server: string;
  topology: VSpherePlatformTopology;
  shortName?: string;
}

// Taint types
export type TaintEffect = 'NoSchedule' | 'PreferNoSchedule';

export interface Taint {
  key: string;
  value?: string;
  effect: TaintEffect;
}

// Toleration types
export type TolerationOperator = 'Exists' | 'Equal';

export interface Toleration {
  key?: string;
  operator?: TolerationOperator;
  value?: string;
  effect?: string;
}

// Network types
export type NetworkType =
  | ''
  | 'disconnected'
  | 'single-tenant'
  | 'multi-tenant'
  | 'nested-multi-tenant'
  | 'public-ipv6';
