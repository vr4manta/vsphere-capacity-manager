import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PoolModel, LeaseModel, NetworkModel, VCM_NAMESPACE } from '@utils/constants';
import type { Pool } from '@vcm-types/pool';
import type { Lease } from '@vcm-types/lease';
import type { Network } from '@vcm-types/network';

/**
 * Custom hooks for watching VCM resources with real-time updates
 */

export type WatchResult<T> = [T[], boolean, any];

/**
 * Watch all Pools in the VCM namespace
 */
export const usePoolsWatch = (namespace: string = VCM_NAMESPACE): WatchResult<Pool> => {
  const [pools, loaded, error] = useK8sWatchResource<Pool[]>({
    groupVersionKind: {
      group: PoolModel.apiGroup,
      version: 'v1',
      kind: PoolModel.kind,
    },
    namespace,
    isList: true,
  });

  return [pools || [], loaded, error];
};

/**
 * Watch a single Pool by name
 */
export const usePoolWatch = (
  name: string,
  namespace: string = VCM_NAMESPACE,
): [Pool | null, boolean, any] => {
  const [pool, loaded, error] = useK8sWatchResource<Pool>({
    groupVersionKind: {
      group: PoolModel.apiGroup,
      version: 'v1',
      kind: PoolModel.kind,
    },
    name,
    namespace,
  });

  return [pool || null, loaded, error];
};

/**
 * Watch all Leases in the VCM namespace
 */
export const useLeasesWatch = (namespace: string = VCM_NAMESPACE): WatchResult<Lease> => {
  const [leases, loaded, error] = useK8sWatchResource<Lease[]>({
    groupVersionKind: {
      group: LeaseModel.apiGroup,
      version: 'v1',
      kind: LeaseModel.kind,
    },
    namespace,
    isList: true,
  });

  return [leases || [], loaded, error];
};

/**
 * Watch a single Lease by name
 */
export const useLeaseWatch = (
  name: string,
  namespace: string = VCM_NAMESPACE,
): [Lease | null, boolean, any] => {
  const [lease, loaded, error] = useK8sWatchResource<Lease>({
    groupVersionKind: {
      group: LeaseModel.apiGroup,
      version: 'v1',
      kind: LeaseModel.kind,
    },
    name,
    namespace,
  });

  return [lease || null, loaded, error];
};

/**
 * Watch all Networks in the VCM namespace
 */
export const useNetworksWatch = (namespace: string = VCM_NAMESPACE): WatchResult<Network> => {
  const [networks, loaded, error] = useK8sWatchResource<Network[]>({
    groupVersionKind: {
      group: NetworkModel.apiGroup,
      version: 'v1',
      kind: NetworkModel.kind,
    },
    namespace,
    isList: true,
  });

  return [networks || [], loaded, error];
};

/**
 * Watch a single Network by name
 */
export const useNetworkWatch = (
  name: string,
  namespace: string = VCM_NAMESPACE,
): [Network | null, boolean, any] => {
  const [network, loaded, error] = useK8sWatchResource<Network>({
    groupVersionKind: {
      group: NetworkModel.apiGroup,
      version: 'v1',
      kind: NetworkModel.kind,
    },
    name,
    namespace,
  });

  return [network || null, loaded, error];
};
