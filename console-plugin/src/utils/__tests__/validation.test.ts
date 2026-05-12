import {
  validatePoolBasicInfo,
  validatePoolCapacity,
  validatePoolTopology,
  getFieldError,
} from '../validation';

describe('validation utilities', () => {
  describe('validatePoolBasicInfo', () => {
    it('validates name field correctly', () => {
      const errors = validatePoolBasicInfo({ name: '', region: 'us-east-1', zone: 'zone-a' });
      expect(getFieldError(errors, 'name')).toBe('Name is required');
    });

    it('validates name length', () => {
      const longName = 'a'.repeat(257);
      const errors = validatePoolBasicInfo({ name: longName, region: 'us-east-1', zone: 'zone-a' });
      expect(getFieldError(errors, 'name')).toBe('Name must be 256 characters or less');
    });

    it('validates region field correctly', () => {
      const errors = validatePoolBasicInfo({ name: 'test-pool', region: '', zone: 'zone-a' });
      expect(getFieldError(errors, 'region')).toBe('Region is required');
    });

    it('validates zone field correctly', () => {
      const errors = validatePoolBasicInfo({ name: 'test-pool', region: 'us-east-1', zone: '' });
      expect(getFieldError(errors, 'zone')).toBe('Zone is required');
    });

    it('validates server field correctly', () => {
      const errors = validatePoolBasicInfo({ name: 'test-pool', region: 'us-east-1', zone: 'zone-a', server: '' });
      expect(getFieldError(errors, 'server')).toBe('Server is required');
    });

    it('validates shortName format', () => {
      const errors = validatePoolBasicInfo({
        name: 'test-pool',
        region: 'us-east-1',
        zone: 'zone-a',
        server: 'server-1',
        shortName: 'Invalid_Name!'
      });
      expect(getFieldError(errors, 'shortName')).toContain('alphanumeric');
    });

    it('returns no errors for valid input', () => {
      const errors = validatePoolBasicInfo({
        name: 'test-pool',
        region: 'us-east-1',
        zone: 'zone-a',
        server: 'server-1'
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validatePoolCapacity', () => {
    it('validates vCPUs correctly', () => {
      const errors1 = validatePoolCapacity({ vcpus: 0, memory: 100, storage: 100 });
      expect(getFieldError(errors1, 'vcpus')).toBe('vCPUs must be greater than 0');

      const errors2 = validatePoolCapacity({ vcpus: 100, memory: 100, storage: 100 });
      expect(getFieldError(errors2, 'vcpus')).toBeUndefined();
    });

    it('validates memory correctly', () => {
      const errors1 = validatePoolCapacity({ vcpus: 100, memory: 0, storage: 100 });
      expect(getFieldError(errors1, 'memory')).toBe('Memory must be greater than 0');

      const errors2 = validatePoolCapacity({ vcpus: 100, memory: 100, storage: 100 });
      expect(getFieldError(errors2, 'memory')).toBeUndefined();
    });

    it('validates storage correctly', () => {
      const errors1 = validatePoolCapacity({ vcpus: 100, memory: 100, storage: 0 });
      expect(getFieldError(errors1, 'storage')).toBe('Storage must be greater than 0');

      const errors2 = validatePoolCapacity({ vcpus: 100, memory: 100, storage: 100 });
      expect(getFieldError(errors2, 'storage')).toBeUndefined();
    });

    it('validates integer values', () => {
      const errors = validatePoolCapacity({ vcpus: 100.5, memory: 100, storage: 100 });
      expect(getFieldError(errors, 'vcpus')).toBe('vCPUs must be an integer');
    });

    it('validates overCommitRatio', () => {
      const errors1 = validatePoolCapacity({
        vcpus: 100,
        memory: 100,
        storage: 100,
        overCommitRatio: '-1'
      });
      expect(getFieldError(errors1, 'overCommitRatio')).toContain('positive number');

      const errors2 = validatePoolCapacity({
        vcpus: 100,
        memory: 100,
        storage: 100,
        overCommitRatio: '1.5'
      });
      expect(getFieldError(errors2, 'overCommitRatio')).toBeUndefined();
    });

    it('returns no errors for valid input', () => {
      const errors = validatePoolCapacity({ vcpus: 100, memory: 100, storage: 100 });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validatePoolTopology', () => {
    it('validates topology presence', () => {
      const errors = validatePoolTopology({});
      expect(getFieldError(errors, 'topology')).toBe('Topology is required');
    });

    it('validates datacenter field correctly', () => {
      const errors = validatePoolTopology({
        topology: { datacenter: '', computeCluster: 'cluster-1', datastore: 'ds-1', networks: ['net-1'] }
      });
      expect(getFieldError(errors, 'topology.datacenter')).toBe('Datacenter is required');
    });

    it('validates computeCluster field correctly', () => {
      const errors = validatePoolTopology({
        topology: { datacenter: 'dc-1', computeCluster: '', datastore: 'ds-1', networks: ['net-1'] }
      });
      expect(getFieldError(errors, 'topology.computeCluster')).toBe('Compute cluster is required');
    });

    it('validates datastore field correctly', () => {
      const errors = validatePoolTopology({
        topology: { datacenter: 'dc-1', computeCluster: 'cluster-1', datastore: '', networks: ['net-1'] }
      });
      expect(getFieldError(errors, 'topology.datastore')).toBe('Datastore is required');
    });

    it('validates networks array', () => {
      const errors = validatePoolTopology({
        topology: { datacenter: 'dc-1', computeCluster: 'cluster-1', datastore: 'ds-1', networks: [] }
      });
      expect(getFieldError(errors, 'topology.networks')).toBe('At least one network is required');
    });

    it('returns no errors for valid input', () => {
      const errors = validatePoolTopology({
        topology: {
          datacenter: 'dc-1',
          computeCluster: 'cluster-1',
          datastore: 'ds-1',
          networks: ['net-1']
        }
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('getFieldError', () => {
    it('returns error message for field with error', () => {
      const errors = [
        { field: 'name', message: 'Name is required' },
        { field: 'region', message: 'Region is required' },
      ];
      expect(getFieldError(errors, 'name')).toBe('Name is required');
      expect(getFieldError(errors, 'region')).toBe('Region is required');
    });

    it('returns undefined for field without error', () => {
      const errors = [{ field: 'name', message: 'Name is required' }];
      expect(getFieldError(errors, 'region')).toBeUndefined();
    });

    it('handles empty errors array', () => {
      const errors: any[] = [];
      expect(getFieldError(errors, 'name')).toBeUndefined();
    });
  });
});
