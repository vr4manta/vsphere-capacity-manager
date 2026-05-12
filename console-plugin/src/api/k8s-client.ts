import {
  k8sGet,
  k8sCreate,
  k8sUpdate,
  k8sPatch,
  k8sDelete,
  k8sList,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { PoolModel, LeaseModel, NetworkModel, VCM_NAMESPACE } from '@utils/constants';
import type { Pool, PoolList } from '@vcm-types/pool';
import type { Lease, LeaseList } from '@vcm-types/lease';
import type { Network, NetworkList } from '@vcm-types/network';

/**
 * Generic K8s API client utilities
 */

// Pool API methods
export const getPool = (name: string, namespace: string = VCM_NAMESPACE): Promise<Pool> => {
  return k8sGet({ model: PoolModel, name, ns: namespace }) as Promise<Pool>;
};

export const listPools = (namespace: string = VCM_NAMESPACE): Promise<PoolList> => {
  return k8sList({ model: PoolModel, queryParams: { ns: namespace } }) as Promise<PoolList>;
};

export const createPool = (pool: Pool, namespace: string = VCM_NAMESPACE): Promise<Pool> => {
  return k8sCreate({ model: PoolModel, data: pool, ns: namespace }) as Promise<Pool>;
};

export const updatePool = (pool: Pool, namespace: string = VCM_NAMESPACE): Promise<Pool> => {
  return k8sUpdate({ model: PoolModel, data: pool, ns: namespace }) as Promise<Pool>;
};

export const deletePool = (name: string, namespace: string = VCM_NAMESPACE): Promise<K8sResourceCommon> => {
  return k8sDelete({ model: PoolModel, resource: { metadata: { name, namespace } } as K8sResourceCommon });
};

// Lease API methods
export const getLease = (name: string, namespace: string = VCM_NAMESPACE): Promise<Lease> => {
  return k8sGet({ model: LeaseModel, name, ns: namespace }) as Promise<Lease>;
};

export const listLeases = (namespace: string = VCM_NAMESPACE): Promise<LeaseList> => {
  return k8sList({ model: LeaseModel, queryParams: { ns: namespace } }) as Promise<LeaseList>;
};

export const createLease = (lease: Lease, namespace: string = VCM_NAMESPACE): Promise<Lease> => {
  return k8sCreate({ model: LeaseModel, data: lease, ns: namespace }) as Promise<Lease>;
};

export const updateLease = (lease: Lease, namespace: string = VCM_NAMESPACE): Promise<Lease> => {
  return k8sUpdate({ model: LeaseModel, data: lease, ns: namespace }) as Promise<Lease>;
};

export const deleteLease = (name: string, namespace: string = VCM_NAMESPACE): Promise<K8sResourceCommon> => {
  return k8sDelete({ model: LeaseModel, resource: { metadata: { name, namespace } } as K8sResourceCommon });
};

// Network API methods
export const getNetwork = (name: string, namespace: string = VCM_NAMESPACE): Promise<Network> => {
  return k8sGet({ model: NetworkModel, name, ns: namespace }) as Promise<Network>;
};

export const listNetworks = (namespace: string = VCM_NAMESPACE): Promise<NetworkList> => {
  return k8sList({ model: NetworkModel, queryParams: { ns: namespace } }) as Promise<NetworkList>;
};

export const createNetwork = (
  network: Network,
  namespace: string = VCM_NAMESPACE,
): Promise<Network> => {
  return k8sCreate({ model: NetworkModel, data: network, ns: namespace }) as Promise<Network>;
};

export const updateNetwork = (
  network: Network,
  namespace: string = VCM_NAMESPACE,
): Promise<Network> => {
  return k8sUpdate({ model: NetworkModel, data: network, ns: namespace }) as Promise<Network>;
};

export const deleteNetwork = (name: string, namespace: string = VCM_NAMESPACE): Promise<K8sResourceCommon> => {
  return k8sDelete({ model: NetworkModel, resource: { metadata: { name, namespace } } as K8sResourceCommon });
};
