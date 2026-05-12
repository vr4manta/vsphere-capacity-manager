import type { Pool } from '@vcm-types/pool';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate pool basic information
 */
export const validatePoolBasicInfo = (data: Partial<Pool['spec']>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.length > 256) {
    errors.push({ field: 'name', message: 'Name must be 256 characters or less' });
  }

  if (!data.server || data.server.trim() === '') {
    errors.push({ field: 'server', message: 'Server is required' });
  } else if (data.server.length > 255) {
    errors.push({ field: 'server', message: 'Server must be 255 characters or less' });
  }

  if (!data.region || data.region.trim() === '') {
    errors.push({ field: 'region', message: 'Region is required' });
  } else if (data.region.length > 80) {
    errors.push({ field: 'region', message: 'Region must be 80 characters or less' });
  }

  if (!data.zone || data.zone.trim() === '') {
    errors.push({ field: 'zone', message: 'Zone is required' });
  } else if (data.zone.length > 80) {
    errors.push({ field: 'zone', message: 'Zone must be 80 characters or less' });
  }

  if (data.shortName) {
    if (data.shortName.length > 30) {
      errors.push({ field: 'shortName', message: 'Short name must be 30 characters or less' });
    }
    if (!/^[a-zA-Z0-9]([-_a-zA-Z0-9]*[a-zA-Z0-9])?$/.test(data.shortName)) {
      errors.push({
        field: 'shortName',
        message: 'Short name must contain only alphanumeric characters, dashes, and underscores',
      });
    }
  }

  return errors;
};

/**
 * Validate pool capacity
 */
export const validatePoolCapacity = (data: Partial<Pool['spec']>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (data.vcpus === undefined || data.vcpus === null) {
    errors.push({ field: 'vcpus', message: 'vCPUs is required' });
  } else if (data.vcpus <= 0) {
    errors.push({ field: 'vcpus', message: 'vCPUs must be greater than 0' });
  } else if (!Number.isInteger(data.vcpus)) {
    errors.push({ field: 'vcpus', message: 'vCPUs must be an integer' });
  }

  if (data.memory === undefined || data.memory === null) {
    errors.push({ field: 'memory', message: 'Memory is required' });
  } else if (data.memory <= 0) {
    errors.push({ field: 'memory', message: 'Memory must be greater than 0' });
  } else if (!Number.isInteger(data.memory)) {
    errors.push({ field: 'memory', message: 'Memory must be an integer' });
  }

  if (data.storage === undefined || data.storage === null) {
    errors.push({ field: 'storage', message: 'Storage is required' });
  } else if (data.storage <= 0) {
    errors.push({ field: 'storage', message: 'Storage must be greater than 0' });
  } else if (!Number.isInteger(data.storage)) {
    errors.push({ field: 'storage', message: 'Storage must be an integer' });
  }

  if (data.overCommitRatio) {
    const ratio = parseFloat(data.overCommitRatio);
    if (isNaN(ratio) || ratio <= 0) {
      errors.push({ field: 'overCommitRatio', message: 'Overcommit ratio must be a positive number' });
    }
  }

  return errors;
};

/**
 * Validate pool topology
 */
export const validatePoolTopology = (data: Partial<Pool['spec']>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.topology) {
    errors.push({ field: 'topology', message: 'Topology is required' });
    return errors;
  }

  if (!data.topology.datacenter || data.topology.datacenter.trim() === '') {
    errors.push({ field: 'topology.datacenter', message: 'Datacenter is required' });
  } else if (data.topology.datacenter.length > 80) {
    errors.push({ field: 'topology.datacenter', message: 'Datacenter must be 80 characters or less' });
  }

  if (!data.topology.computeCluster || data.topology.computeCluster.trim() === '') {
    errors.push({ field: 'topology.computeCluster', message: 'Compute cluster is required' });
  } else if (data.topology.computeCluster.length > 2048) {
    errors.push({ field: 'topology.computeCluster', message: 'Compute cluster path must be 2048 characters or less' });
  }

  if (!data.topology.datastore || data.topology.datastore.trim() === '') {
    errors.push({ field: 'topology.datastore', message: 'Datastore is required' });
  } else if (data.topology.datastore.length > 2048) {
    errors.push({ field: 'topology.datastore', message: 'Datastore path must be 2048 characters or less' });
  }

  if (!data.topology.networks || data.topology.networks.length === 0) {
    errors.push({ field: 'topology.networks', message: 'At least one network is required' });
  }

  if (data.topology.folder && data.topology.folder.length > 2048) {
    errors.push({ field: 'topology.folder', message: 'Folder path must be 2048 characters or less' });
  }

  if (data.topology.resourcePool && data.topology.resourcePool.length > 2048) {
    errors.push({ field: 'topology.resourcePool', message: 'Resource pool path must be 2048 characters or less' });
  }

  return errors;
};

/**
 * Get field error message
 */
export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  const error = errors.find((e) => e.field === field);
  return error?.message;
};
