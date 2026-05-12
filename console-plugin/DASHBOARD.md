# vSphere Capacity Dashboard

## Overview

The Capacity Dashboard provides a comprehensive view of vSphere resource utilization across all managed pools. It displays real-time metrics fetched from Prometheus and provides quick actions for common tasks.

## Features

### Aggregate Capacity Metrics

Three main capacity cards show total resources across all pools:

- **Total vCPUs**: Total CPU capacity with current usage and utilization percentage
- **Total Memory**: Total memory capacity with current usage and utilization percentage  
- **Total Storage**: Total storage capacity with current usage and utilization percentage

Each card displays:
- Total available resources
- Currently used resources
- Utilization percentage

### Lease Statistics

Four cards showing lease counts by phase:

- **Active Leases**: Total count of all leases
- **Fulfilled**: Leases that have been fully allocated
- **Pending**: Leases waiting for resource allocation
- **Partial**: Leases that have been partially allocated

### Utilization Charts

#### CPU Utilization (Last Hour)
Line chart showing average CPU utilization percentage across all pools over the last 60 minutes. Updates every 60 seconds.

#### Memory Utilization (Last Hour)
Line chart showing average memory utilization percentage across all pools over the last 60 minutes. Updates every 60 seconds.

### Network Type Distribution

Donut chart showing the breakdown of available networks by type:
- single-tenant
- multi-tenant
- disconnected
- nested-multi-tenant
- public-ipv6

## Prometheus Metrics

The dashboard uses the following Prometheus metrics exposed by the VCM operator:

### Capacity Metrics
- `pool_vcpus_total` - Total vCPU capacity across all pools
- `pool_vcpus_used` - Used vCPU capacity across all pools
- `pool_memory_total` - Total memory capacity across all pools (GB)
- `pool_memory_used` - Used memory capacity across all pools (GB)
- `pool_storage_total` - Total storage capacity across all pools (GB)
- `pool_storage_used` - Used storage capacity across all pools (GB)

### Utilization Ratios
- `pool_vcpus_utilization_ratio{pool="..."}` - Per-pool CPU utilization (0.0-1.0)
- `pool_memory_utilization_ratio{pool="..."}` - Per-pool memory utilization (0.0-1.0)

### Lease Metrics
- `leases_counts{phase="Fulfilled"}` - Count of fulfilled leases
- `leases_counts{phase="Pending"}` - Count of pending leases
- `leases_counts{phase="Failed"}` - Count of failed leases
- `leases_counts{phase="Partial"}` - Count of partially allocated leases

### Network Metrics
- `pool_networks_available_by_type{network_type="..."}` - Available networks by type

## Quick Actions

The dashboard header includes two quick action buttons:

- **Create Lease**: Navigate to the lease creation form
- **Create Pool**: Navigate to the pool creation form

## Auto-Refresh

Metrics automatically refresh at the following intervals:

- **Instant queries** (capacity, lease counts): Every 30 seconds
- **Range queries** (utilization charts): Every 60 seconds

## Error Handling

If Prometheus is unavailable or a query fails:

- Capacity cards show "0" values
- Charts display a warning message with the error
- The dashboard continues to function, retrying queries in the background

## Prometheus Integration

The dashboard uses the OpenShift Console's built-in Prometheus proxy at `/api/prometheus-tenancy`. This proxy:

- Automatically handles authentication using the user's OAuth token
- Respects namespace-level RBAC for metrics access
- Requires no additional configuration in the ConsolePlugin manifest

## Performance

The dashboard is optimized for large-scale deployments:

- Queries aggregate metrics at the Prometheus level (not client-side)
- Uses React Query for caching and background refetching
- Charts display the last 100 data points maximum
- Stale data is cached for 10-30 seconds to reduce query load

## Future Enhancements

Planned improvements for the dashboard:

- Configurable time range for utilization charts (1h, 6h, 24h, 7d)
- Drill-down from aggregate metrics to per-pool details
- Capacity planning predictions based on historical trends
- Alerting thresholds with visual indicators
- Export metrics to CSV/JSON
- Customizable dashboard layout
