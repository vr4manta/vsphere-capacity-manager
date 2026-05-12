# vSphere Capacity Manager Console Plugin - User Guide

## Overview

The vSphere Capacity Manager (VCM) Console Plugin provides a web-based interface for managing vSphere infrastructure capacity in OpenShift. It allows cluster administrators to view, create, edit, and delete capacity resources without using the command line.

## Accessing the Plugin

1. Log into the OpenShift Console
2. In the left navigation menu, locate "vSphere Capacity"
3. Expand to see four sections:
   - **Dashboard**: Overview of capacity metrics
   - **Pools**: Manage resource pools
   - **Leases**: Manage resource allocations
   - **Networks**: Manage network configurations

## Dashboard

The Dashboard provides an at-a-glance view of your vSphere capacity.

### Capacity Metrics

**Aggregate Capacity Cards**
- **Total vCPUs**: Shows total and used vCPUs across all pools
- **Total Memory**: Shows total and used memory in GB
- **Total Storage**: Shows total and used storage in GB

Each card displays:
- Total available capacity
- Currently used resources
- Utilization percentage

**Lease Statistics**
- **Active Leases**: Total number of leases
- **Fulfilled**: Fully allocated leases (green)
- **Pending**: Awaiting resource allocation (yellow)
- **Partial**: Partially allocated leases (orange)

### Charts

**CPU Utilization (Last Hour)**
- Line chart showing average CPU utilization percentage
- Updates every 60 seconds
- Hover over points to see exact values

**Memory Utilization (Last Hour)**
- Line chart showing average memory utilization percentage
- Updates every 60 seconds
- Time axis shows last 60 minutes

**Network Type Distribution**
- Donut chart showing network breakdown by type:
  - Single Tenant
  - Multi Tenant
  - Disconnected
  - Nested Multi Tenant
  - Public IPv6

### Quick Actions

- **Create Lease**: Navigate to lease creation form
- **Create Pool**: Navigate to pool creation form

## Pools

Pools represent vSphere resource pools with defined capacity limits.

### Viewing Pools

The Pools list shows all available pools with:
- **Name**: Pool identifier
- **Region/Zone**: Geographic location
- **vCPUs**: Capacity bar showing used/total (e.g., "50/100")
- **Memory**: Capacity bar showing used/total in GB
- **Networks**: Number of available networks
- **Leases**: Number of active leases using this pool
- **NoSchedule**: Whether pool accepts new leases
- **Excluded**: Whether pool is excluded from selection

**Capacity Bars**:
- Green: < 50% utilization
- Orange: 50-75% utilization
- Yellow: 75-90% utilization
- Red: > 90% utilization

### Pool Details

Click on a pool row to view detailed information:

**Overview Card**
- Name, server, region, zone
- Status badges (NoSchedule, Excluded)

**Capacity Card**
- Three donut charts showing vCPU, memory, and storage utilization
- Color-coded by utilization level
- Percentage displayed in center

**Topology Card**
- Datacenter name
- Compute cluster path
- Datastore path
- Network list (expandable if many)

**Taints Card** (if present)
- Shows taints applied to the pool
- Format: `key=value:effect`
- Used for pool selection with tolerations

**Active Leases Table**
- Shows leases currently using this pool
- Columns: Name, Phase, vCPUs, Memory, Networks
- Click lease name to view lease details

**Actions**
- **Edit**: Modify pool configuration
- **Delete**: Remove pool (requires confirmation)

### Creating a Pool

1. Click "Create Pool" button
2. Fill in required fields:

**Basic Information**
- **Resource Name**: Kubernetes resource name (lowercase, hyphens only)

**Resource Requirements**
- **vCPUs**: Number of virtual CPUs (default: 0)
- **Memory (GB)**: Memory capacity in gigabytes (default: 0)
- **Storage (GB)**: Storage capacity in gigabytes (default: 0)
- **Networks**: Number of networks (minimum: 1)

**Advanced Configuration** (if using full wizard)
- Region
- Zone
- Server
- Datacenter
- Compute cluster
- Datastore
- Network list
- Taints (optional)

3. Click "Create" to save

**Note**: The simplified form uses default values. For full configuration, use `oc` CLI or the future wizard implementation.

### Editing a Pool

1. Navigate to pool detail page
2. Click "Edit" button
3. Modify fields
4. Click "Update" to save changes

### Deleting a Pool

1. Navigate to pool detail page
2. Click "Delete" button
3. Confirm deletion in the modal
4. Pool is removed from the cluster

**Warning**: Deleting a pool with active leases may cause lease failures.

## Leases

Leases represent resource allocation requests from the cluster.

### Viewing Leases

The Leases list shows all leases with:
- **Name**: Lease identifier
- **Phase**: Current status with color-coded badge
  - Fulfilled (green): All resources allocated
  - Pending (yellow): Waiting for allocation
  - Failed (red): Allocation failed
  - Partial (orange): Some resources allocated
- **vCPUs**: Requested vCPUs
- **Memory**: Requested memory in GB
- **Networks**: Requested networks
- **Pools**: Number of pools requested
- **Network Type**: Type badge (e.g., Single Tenant)
- **Age**: Time since creation (e.g., "5m ago")

### Lease Details

Click on a lease row to view comprehensive information:

**Status Card**
- Phase badge with color
- Age since creation
- Job link (if available)

**Resource Requirements Card**
- vCPUs requested
- Memory requested (GB)
- Storage requested (GB)
- Networks requested
- Pools requested

**Pool Selection Card**
- **Required Pool**: Specific pool name (if specified)
- **Pool Selector**: Label selectors as key=value pairs
- **Network Type**: Selected network type
- **Boskos Lease ID**: If using Boskos integration

**Tolerations Table** (if present)
- Key, Operator, Value, Effect columns
- Allows matching pools with taints

**Assigned Pools Table**
- Shows which pool(s) were assigned
- Columns: Pool Name, Region, Zone, Server
- One row per pool for multi-pool leases

**Environment Variables** (per pool)
- Expandable code blocks showing environment variables
- Copy button for easy use
- Includes topology information, credentials, network details

**Conditions Table**
- Full history of lease lifecycle events
- Columns: Type, Status, Reason, Message, Last Transition
- Most recent events at top
- Useful for debugging allocation issues

**Actions**
- **Delete**: Remove lease (requires confirmation)

**Note**: Leases are typically immutable. Edit is not supported.

### Creating a Lease

1. Click "Create Lease" button
2. Fill in the form:

**Basic Information**
- **Resource Name**: Kubernetes resource name (required for new leases)

**Resource Requirements**
- **vCPUs**: Number of virtual CPUs (default: 0)
- **Memory (GB)**: Memory in gigabytes (default: 0)
- **Storage (GB)**: Storage in gigabytes (default: 0)
- **Networks**: Number of networks (minimum: 1)
- **Number of Pools**: How many pools to allocate from (default: 1)
- **Network Type**: Select from dropdown
  - Default
  - Single Tenant
  - Multi Tenant
  - Disconnected
  - Nested Multi Tenant
  - Public IPv6

**Pool Selection**
- **Required Pool**: Specific pool name (leave empty for automatic)
- **Pool Selector**: Multi-line key=value pairs for label matching
  ```
  region=us-east-1
  zone=zone-a
  ```
- **Boskos Lease ID**: Optional Boskos integration ID

**Tolerations**
- **Key**: Taint key to tolerate (empty = all)
- **Operator**: Equal or Exists
- **Value**: Taint value (for Equal operator)
- **Effect**: Taint effect to match (empty = all)
- Click "Add" to add toleration
- Multiple tolerations can be added
- Click "Remove" to delete a toleration

3. Click "Create" to submit

The lease phase will transition from Pending → Fulfilled as the operator allocates resources.

### Deleting a Lease

1. Navigate to lease detail page
2. Click "Delete" button
3. Confirm deletion
4. Lease is removed and resources are released

## Networks

Networks represent VLAN/network infrastructure available in vSphere.

### Viewing Networks

The Networks list shows:
- **Name**: Network identifier
- **Port Group**: vSphere port group name
- **VLAN**: VLAN ID
- **Pod**: Associated pod
- **Datacenter**: vSphere datacenter
- **CIDR**: IPv4 CIDR (if configured)
- **IP Count**: Number of IP addresses
- **Network Type**: Type badge

### Network Details

Click on a network row to view:

**Basic Information Card**
- Name, port group, VLAN, pod, datacenter
- Network type badge

**IPv4 Configuration Card** (if present)
- CIDR notation
- Gateway IP
- Netmask

**IPv6 Configuration Card** (if present)
- Gateway IPv6
- Prefix

**IP Addresses Grid** (if present)
- List of all available IP addresses
- Displayed in grid format

**Nameservers** (if present)
- DNS server addresses as labels

**Additional Info Card**
- Lease name (if associated)

**Actions**
- **Edit**: Modify network configuration
- **Delete**: Remove network

### Creating a Network

1. Click "Create Network" button
2. Fill in the form:

**Basic Information**
- **Resource Name**: Kubernetes resource name (required)
- **Port Group**: vSphere port group name
- **VLAN**: VLAN ID (numeric)
- **Pod**: Associated pod identifier
- **Datacenter**: vSphere datacenter name
- **Network Type**: Select from dropdown

**IPv4 Configuration**
- **CIDR**: IPv4 CIDR (e.g., 192.168.1.0/24)
- **Gateway**: Gateway IP address
- **Netmask**: Network mask (e.g., 255.255.255.0)
- **IP Addresses**: Multi-line list of IP addresses
  ```
  192.168.1.10
  192.168.1.11
  192.168.1.12
  ```
- **Nameservers**: Multi-line list of DNS servers
  ```
  8.8.8.8
  8.8.4.4
  ```

3. Click "Create" to save

### Editing a Network

1. Navigate to network detail page
2. Click "Edit" button
3. Modify fields (IP addresses, nameservers support multi-line editing)
4. Click "Update" to save

### Deleting a Network

1. Navigate to network detail page
2. Click "Delete" button
3. Confirm deletion
4. Network is removed

**Warning**: Deleting a network in use by a lease may cause issues.

## Common Workflows

### Workflow 1: Check Available Capacity

1. Navigate to Dashboard
2. Review aggregate capacity cards
3. Check CPU/Memory utilization charts
4. If capacity is low, create additional pools or scale existing ones

### Workflow 2: Allocate Resources for a Test

1. Navigate to Leases
2. Click "Create Lease"
3. Specify resource requirements:
   - vCPUs: 8
   - Memory: 32 GB
   - Networks: 1
   - Network Type: single-tenant
4. Leave pool selector empty for automatic assignment
5. Click "Create"
6. Navigate to lease detail page
7. Wait for phase to become "Fulfilled"
8. Copy environment variables for use in test
9. Run test
10. Delete lease when done

### Workflow 3: Add New vSphere Resource Pool

1. Ensure pool exists in vSphere
2. Navigate to Pools
3. Click "Create Pool"
4. Fill in details matching vSphere configuration
5. Click "Create"
6. Verify pool appears in list
7. Check Dashboard to see updated capacity

### Workflow 4: Investigate Lease Allocation Failure

1. Navigate to Leases
2. Locate lease with "Failed" or "Partial" phase
3. Click on lease to view details
4. Check **Conditions Table** for error messages
5. Common issues:
   - No pool has sufficient capacity
   - Pool selector doesn't match any pools
   - Network type not available
   - Tolerations don't match pool taints
6. Fix the issue:
   - Add more capacity (create/scale pools)
   - Adjust pool selector
   - Change network type
   - Add appropriate tolerations
7. Delete failed lease
8. Create new lease with corrected parameters

### Workflow 5: Manage Multi-Pool Leases

1. Navigate to Leases → Create Lease
2. Set "Number of Pools" to desired count (e.g., 3)
3. Use pool selector to target pools:
   ```
   region=us-east-1
   ```
4. Create lease
5. Once fulfilled, view lease details
6. Check **Assigned Pools Table** - shows all 3 pools
7. **Environment Variables** section shows separate blocks for each pool
8. Use environment variables specific to each pool assignment

## Keyboard Navigation

The plugin is fully keyboard accessible:

- **Tab**: Navigate between interactive elements
- **Shift+Tab**: Navigate backward
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dialogs
- **Arrow keys**: Navigate within tables

## Tips and Best Practices

### Resource Planning

- Monitor dashboard regularly to track capacity trends
- Keep utilization below 75% for optimal performance
- Plan for peak usage times

### Pool Organization

- Use meaningful region/zone names for easy identification
- Add taints to pools with special requirements (GPU, fast storage, etc.)
- Use pool selectors in leases to target specific pool characteristics

### Lease Management

- Use descriptive lease names that indicate purpose (e.g., "e2e-test-123")
- Delete leases promptly when no longer needed
- For long-running tests, monitor lease status regularly

### Network Configuration

- Document IP address ranges to avoid conflicts
- Keep nameservers up to date
- Use network types to segregate different workload requirements

### Troubleshooting

- Check Conditions table on lease details for error messages
- Use Dashboard metrics to identify capacity bottlenecks
- Review active leases on pool detail page to understand allocation
- Monitor pool utilization to prevent oversubscription

## Limitations

- Leases cannot be edited after creation (delete and recreate instead)
- Dashboard metrics require Prometheus to be available
- Real-time updates depend on Kubernetes watch API
- Large datasets (100+ resources) may impact performance

## Getting Help

- Review the [Installation Guide](INSTALL.md) for deployment issues
- Check [TESTING.md](TESTING.md) for testing procedures
- See [ACCESSIBILITY.md](ACCESSIBILITY.md) for accessibility features
- Report issues on GitHub: https://github.com/openshift-splat-team/vsphere-capacity-manager/issues
