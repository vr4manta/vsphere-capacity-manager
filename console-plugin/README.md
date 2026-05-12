# vSphere Capacity Manager Console Plugin

OpenShift Console Dynamic Plugin for managing vSphere Capacity Manager resources.

## Overview

This plugin provides a web-based UI for cluster administrators to manage vSphere infrastructure capacity through the OpenShift Console. It enables CRUD operations for:

- **Pools** - Resource pools (vCPUs, memory, storage, networks)
- **Leases** - Resource allocation requests
- **Networks** - VLAN/network infrastructure

## Prerequisites

- Node.js 18+
- npm 9+
- OpenShift cluster with VCM operator deployed
- `oc` CLI logged into the cluster

## Development

### Initial Setup

```bash
cd console-plugin
npm install
```

### Local Development

Start the webpack dev server:

```bash
npm start
```

The plugin will be available at http://localhost:9000 with hot reload enabled.

To access Kubernetes API and Prometheus metrics during development, port-forward the services:

```bash
# Terminal 1: Port-forward Prometheus
oc port-forward -n vsphere-infra-helpers svc/metrics 8080:8080

# Terminal 2: Start dev server
npm start
```

### Build

Build for production:

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

### Testing

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
```

## Deployment

### Build Container Image

```bash
# From repository root
make plugin-image
```

### Push to Registry

```bash
make plugin-push
```

### Deploy to Cluster

```bash
make deploy-plugin
```

### Enable Plugin in Console

```bash
oc patch consoles.operator.openshift.io cluster \
  --type merge \
  -p '{"spec":{"plugins":["vsphere-capacity-manager"]}}'
```

After a few moments, refresh the OpenShift Console and look for the "vSphere Capacity" menu item.

## Project Structure

```
console-plugin/
├── src/
│   ├── index.tsx                 # Plugin entry point
│   ├── types/                    # TypeScript types
│   │   ├── pool.ts
│   │   ├── lease.ts
│   │   └── network.ts
│   ├── components/               # React components
│   │   ├── common/
│   │   ├── pools/
│   │   ├── leases/
│   │   ├── networks/
│   │   └── dashboard/
│   ├── hooks/                    # Custom React hooks
│   ├── api/                      # API client utilities
│   └── utils/                    # Helper functions
├── manifests/                    # Kubernetes deployment resources
├── Dockerfile
├── package.json
├── tsconfig.json
├── webpack.config.ts
└── README.md
```

## Features

### Dashboard
- Aggregate capacity metrics (vCPUs, memory, storage)
- Lease statistics by phase (Fulfilled, Pending, Failed, Partial)
- CPU and memory utilization charts (last hour)
- Network type distribution donut chart
- Real-time updates via Prometheus metrics

### Pool Management
- List view with capacity bars and utilization indicators
- Detailed view with donut charts for vCPU/memory/storage
- Topology information (datacenter, cluster, datastore, networks)
- Active leases table
- Create and edit forms with validation

### Lease Management
- List view with phase badges and network type indicators
- Comprehensive detail view with:
  - Resource requirements
  - Pool selection criteria
  - Tolerations for taint matching
  - Assigned pools (multi-pool support)
  - Environment variables per pool
  - Full condition history
- Create form with toleration builder

### Network Management
- List view with VLAN, port group, and IP information
- Detail view with IPv4/IPv6 configuration
- IP addresses grid display
- Create and edit forms

### Accessibility
- WCAG 2.1 Level AA compliant
- Full keyboard navigation
- Screen reader support
- High contrast mode compatible

### Performance
- Bundle size: 307 KB gzipped
- Real-time updates via Kubernetes watch API
- Lazy loading for improved performance
- Optimized for large datasets

## Documentation

### User Documentation
- **[Installation Guide](INSTALL.md)** - Deployment and configuration
- **[User Guide](USER_GUIDE.md)** - Complete usage instructions with workflows
- **[Dashboard Guide](DASHBOARD.md)** - Prometheus metrics and dashboard features

### Developer Documentation
- **[Testing Guide](TESTING.md)** - Unit, integration, and manual testing
- **[Accessibility Guide](ACCESSIBILITY.md)** - WCAG compliance and testing
- **[Bundle Optimization](BUNDLE_OPTIMIZATION.md)** - Performance optimization strategies
- **[Phase 7 Summary](PHASE7_SUMMARY.md)** - Polish and testing completion summary

### External Resources
- [Main VCM Documentation](../README.md)
- [OpenShift Console Plugin SDK](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
- [PatternFly React 5](https://www.patternfly.org/v4/)

## Quick Start

### For Users

1. **Install the plugin**:
   ```bash
   oc apply -k console-plugin/manifests/
   oc patch consoles.operator.openshift.io cluster \
     --type merge \
     -p '{"spec":{"plugins":["vsphere-capacity-manager"]}}'
   ```

2. **Access the UI**:
   - Log into OpenShift Console
   - Navigate to "vSphere Capacity" in the left menu

3. **Read the docs**:
   - See [User Guide](USER_GUIDE.md) for complete usage instructions

### For Developers

1. **Set up development environment**:
   ```bash
   cd console-plugin
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Troubleshooting

See the [Installation Guide](INSTALL.md#troubleshooting) for common issues and solutions.

Quick checks:
- Verify plugin is enabled: `oc get consoles.operator.openshift.io cluster -o yaml`
- Check deployment: `oc get deployment -n vsphere-infra-helpers vsphere-capacity-manager-console-plugin`
- View logs: `oc logs -n vsphere-infra-helpers -l app=vsphere-capacity-manager-console-plugin`

## Contributing

1. Follow existing code patterns and TypeScript types
2. Add tests for new features
3. Ensure accessibility standards are met
4. Update documentation for user-facing changes
5. Test with actual VCM resources before submitting

## Support

- **Issues**: https://github.com/openshift-splat-team/vsphere-capacity-manager/issues
- **Documentation**: See links above
- **Operator Logs**: `oc logs -n vsphere-infra-helpers deployment/vsphere-capacity-manager`

## License

Apache-2.0
