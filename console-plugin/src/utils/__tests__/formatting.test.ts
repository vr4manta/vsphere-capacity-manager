import {
  formatGB,
  formatCPUs,
  formatUtilization,
  formatResourceUsage,
  formatTimestamp,
  calculateUtilization,
  formatPhase,
  formatNetworkType,
  truncate,
} from '../formatting';

describe('formatting utilities', () => {
  describe('formatGB', () => {
    it('formats gigabytes correctly', () => {
      expect(formatGB(0)).toBe('0 GB');
      expect(formatGB(1)).toBe('1 GB');
      expect(formatGB(1024)).toBe('1024 GB');
      expect(formatGB(100.5)).toBe('100.5 GB');
    });

    it('handles undefined and null', () => {
      expect(formatGB(undefined as any)).toBe('-');
      expect(formatGB(null as any)).toBe('-');
    });
  });

  describe('formatCPUs', () => {
    it('formats vCPUs correctly', () => {
      expect(formatCPUs(0)).toBe('0 vCPUs');
      expect(formatCPUs(1)).toBe('1 vCPUs');
      expect(formatCPUs(2)).toBe('2 vCPUs');
      expect(formatCPUs(100)).toBe('100 vCPUs');
    });

    it('handles undefined and null', () => {
      expect(formatCPUs(undefined as any)).toBe('-');
      expect(formatCPUs(null as any)).toBe('-');
    });
  });

  describe('formatUtilization', () => {
    it('calculates percentage from available and total', () => {
      // formatUtilization(available, total) = ((total - available) / total) * 100
      expect(formatUtilization(50, 100)).toBe('50%'); // 50 used out of 100
      expect(formatUtilization(75, 100)).toBe('25%'); // 25 used out of 100
      expect(formatUtilization(0, 100)).toBe('100%'); // 100 used out of 100
      expect(formatUtilization(100, 100)).toBe('0%'); // 0 used out of 100
    });

    it('handles division by zero', () => {
      expect(formatUtilization(50, 0)).toBe('0%');
      expect(formatUtilization(0, 0)).toBe('0%');
    });

    it('rounds to whole numbers', () => {
      expect(formatUtilization(33, 100)).toBe('67%'); // 67 used
      expect(formatUtilization(33.333, 100)).toBe('67%'); // 66.667 used, rounds to 67
    });
  });

  describe('formatResourceUsage', () => {
    it('formats resource usage correctly', () => {
      // formatResourceUsage(available, total) = "used/total"
      expect(formatResourceUsage(50, 100)).toBe('50/100'); // 50 used out of 100
      expect(formatResourceUsage(75, 100)).toBe('25/100'); // 25 used out of 100
      expect(formatResourceUsage(0, 100)).toBe('100/100'); // 100 used out of 100
    });

    it('handles division by zero', () => {
      expect(formatResourceUsage(0, 0)).toBe('-');
      expect(formatResourceUsage(50, 0)).toBe('-');
    });
  });

  describe('calculateUtilization', () => {
    it('calculates utilization percentage from available and total', () => {
      expect(calculateUtilization(50, 100)).toBe(50); // 50% used
      expect(calculateUtilization(75, 100)).toBe(25); // 25% used
      expect(calculateUtilization(0, 100)).toBe(100); // 100% used
      expect(calculateUtilization(100, 100)).toBe(0); // 0% used
    });

    it('handles division by zero', () => {
      expect(calculateUtilization(50, 0)).toBe(0);
      expect(calculateUtilization(0, 0)).toBe(0);
    });
  });

  describe('formatTimestamp', () => {
    it('formats recent timestamps as relative time', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const result = formatTimestamp(fiveMinutesAgo.toISOString());
      expect(result).toBe('5m ago');
    });

    it('formats hours ago', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const result = formatTimestamp(twoHoursAgo.toISOString());
      expect(result).toBe('2h ago');
    });

    it('formats days ago', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const result = formatTimestamp(threeDaysAgo.toISOString());
      expect(result).toBe('3d ago');
    });

    it('handles undefined timestamps', () => {
      expect(formatTimestamp(undefined)).toBe('-');
    });
  });

  describe('formatPhase', () => {
    it('formats phase correctly', () => {
      expect(formatPhase('Fulfilled')).toBe('Fulfilled');
      expect(formatPhase('Pending')).toBe('Pending');
      expect(formatPhase('Failed')).toBe('Failed');
    });

    it('handles undefined phase', () => {
      expect(formatPhase(undefined)).toBe('Unknown');
    });
  });

  describe('formatNetworkType', () => {
    it('formats network type correctly', () => {
      expect(formatNetworkType('single-tenant')).toBe('Single Tenant');
      expect(formatNetworkType('multi-tenant')).toBe('Multi Tenant');
      expect(formatNetworkType('public-ipv6')).toBe('Public Ipv6');
    });

    it('handles undefined network type', () => {
      expect(formatNetworkType(undefined)).toBe('Default');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('abcdefghij', 5)).toBe('abcde...');
      expect(truncate('hello world', 8)).toBe('hello wo...');
    });

    it('does not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
      expect(truncate('test', 4)).toBe('test');
    });

    it('handles edge cases', () => {
      expect(truncate('', 5)).toBe('');
      expect(truncate(null as any, 5)).toBeNull();
    });
  });
});
