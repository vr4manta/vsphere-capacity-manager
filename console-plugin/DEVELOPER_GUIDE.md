# vSphere Capacity Manager Console Plugin - Developer Guide

## Architecture

### Technology Stack

- **Framework**: OpenShift Console Dynamic Plugin SDK v1.3.0
- **Language**: TypeScript 5.3
- **UI Library**: React 18 + PatternFly 5
- **Build Tool**: Webpack 5
- **State Management**: React Query for server state
- **Testing**: Jest + React Testing Library
- **Charts**: PatternFly React Charts (Victory)

### Project Structure

```
console-plugin/
├── src/
│   ├── index.tsx                    # Plugin registration & routes
│   ├── plugin.ts                    # Component exports for $codeRef
│   ├── setupTests.ts                # Jest test setup
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── common.ts                # Shared types (Phase, Taint, etc.)
│   │   ├── pool.ts                  # Pool CRD types
│   │   ├── lease.ts                 # Lease CRD types
│   │   └── network.ts               # Network CRD types
│   │
│   ├── components/
│   │   ├── common/                  # Shared UI components
│   │   │   ├── ResourceList.tsx    # Generic table component
│   │   │   ├── StatusBadge.tsx     # Phase/status badges
│   │   │   ├── CapacityGauge.tsx   # Donut charts for utilization
│   │   │   └── LoadingSkeleton.tsx # Loading state components
│   │   │
│   │   ├── pools/                   # Pool management
│   │   │   ├── PoolList.tsx        # Pool list view
│   │   │   ├── PoolDetail.tsx      # Pool detail page
│   │   │   └── PoolForm.tsx        # Pool create/edit form
│   │   │
│   │   ├── leases/                  # Lease management
│   │   │   ├── LeaseList.tsx       # Lease list view
│   │   │   ├── LeaseDetail.tsx     # Lease detail page
│   │   │   └── LeaseForm.tsx       # Lease create form
│   │   │
│   │   ├── networks/                # Network management
│   │   │   ├── NetworkList.tsx     # Network list view
│   │   │   ├── NetworkDetail.tsx   # Network detail page
│   │   │   └── NetworkForm.tsx     # Network create/edit form
│   │   │
│   │   └── dashboard/               # Overview dashboard
│   │       └── CapacityDashboard.tsx
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useK8sWatchResource.ts  # K8s resource watch hooks
│   │   └── usePrometheusQuery.ts   # Prometheus metrics hooks
│   │
│   ├── api/                         # API client utilities
│   │   ├── k8s-client.ts           # Kubernetes API wrapper
│   │   └── prometheus-client.ts    # Prometheus query utilities
│   │
│   └── utils/                       # Helper functions
│       ├── constants.ts            # Resource models & constants
│       ├── formatting.ts           # Display formatting
│       └── validation.ts           # Form validation
│
├── manifests/                       # Kubernetes resources
│   ├── namespace.yaml
│   ├── serviceaccount.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── console-plugin.yaml
│   └── kustomization.yaml
│
├── Dockerfile                       # Multi-stage container build
├── nginx.conf                       # Nginx configuration
├── console-extensions.json          # Plugin manifest
├── package.json                     # npm dependencies
├── tsconfig.json                    # TypeScript configuration
├── webpack.config.ts                # Webpack build configuration
└── jest.config.js                   # Jest test configuration
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- OpenShift cluster access
- `oc` CLI configured

### Initial Setup

```bash
# Clone repository
git clone https://github.com/openshift-splat-team/vsphere-capacity-manager
cd vsphere-capacity-manager/console-plugin

# Install dependencies
npm install

# Run type check
npm run type-check

# Run tests
npm test
```

### Development Workflow

#### 1. Local Development Server

```bash
# Terminal 1: Port-forward Prometheus (optional)
oc port-forward -n vsphere-infra-helpers svc/metrics 8080:8080

# Terminal 2: Start dev server
npm start
```

Access at http://localhost:9000

**Features**:
- Hot module reloading
- Source maps enabled
- CORS headers for API access

**Limitations**:
- OAuth token not available (Kubernetes API calls will fail)
- Must run in OpenShift Console iframe for full functionality

#### 2. Testing in OpenShift Console

Deploy as dynamic plugin:

```bash
# Build and deploy
make plugin-build
make plugin-image
make plugin-push
make deploy-plugin

# Enable plugin
oc patch consoles.operator.openshift.io cluster \
  --type merge \
  -p '{"spec":{"plugins":["vsphere-capacity-manager"]}}'

# Watch deployment
oc get pods -n vsphere-infra-helpers -w
```

Refresh OpenShift Console after ~30 seconds.

#### 3. Making Changes

1. **Edit source files** in `src/`
2. **Type check**: `npm run type-check`
3. **Test**: `npm test`
4. **Build**: `npm run build`
5. **Verify bundle size**: Check gzipped size < 500 KB
6. **Commit** with meaningful message

#### 4. Debugging

**Browser DevTools**:
- F12 → Console tab for JavaScript errors
- Network tab for API request failures
- React DevTools for component inspection

**Kubernetes Logs**:
```bash
# Plugin container logs
oc logs -n vsphere-infra-helpers -l app=vsphere-capacity-manager-console-plugin

# VCM operator logs
oc logs -n vsphere-infra-helpers deployment/vsphere-capacity-manager
```

**Common Issues**:
- **404 on .js files**: Check nginx config, verify build output
- **CORS errors**: Ensure dev server headers configured
- **OAuth errors**: Must run in Console iframe, not standalone
- **Metrics not loading**: Verify Prometheus proxy in ConsolePlugin CR

## Code Style

### TypeScript

- **Strict mode** enabled
- **Explicit types** for function parameters and return values
- **No `any`** unless absolutely necessary (use `unknown` instead)
- **Interface over type** for object shapes

Example:
```typescript
// Good
interface PoolCardProps {
  pool: Pool;
  onSelect: (pool: Pool) => void;
}

export const PoolCard: React.FC<PoolCardProps> = ({ pool, onSelect }) => {
  // ...
};

// Bad
const PoolCard = (props: any) => {
  // ...
};
```

### React

- **Functional components** only (no classes)
- **Hooks** for state and effects
- **Props destructuring** in function signature
- **Explicit children type** when accepting children

Example:
```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  return (
    <PatternFlyCard>
      <CardTitle>{title}</CardTitle>
      <CardBody>{children}</CardBody>
    </PatternFlyCard>
  );
};
```

### Naming Conventions

- **Components**: PascalCase (`PoolList`, `LeaseDetail`)
- **Files**: Match component name (`PoolList.tsx`)
- **Hooks**: camelCase with `use` prefix (`usePoolsWatch`)
- **Types/Interfaces**: PascalCase (`Pool`, `LeaseStatus`)
- **Constants**: UPPER_SNAKE_CASE (`VCM_NAMESPACE`)
- **Functions**: camelCase (`formatGB`, `validatePool`)

### Imports

Order imports by:
1. React/external libraries
2. PatternFly components
3. Internal hooks/components
4. Types
5. Utils/constants

Example:
```typescript
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageSection, Button } from '@patternfly/react-core';
import { usePoolsWatch } from '@hooks/useK8sWatchResource';
import { ResourceList } from '@components/common/ResourceList';
import type { Pool } from '@vcm-types/pool';
import { formatGB } from '@utils/formatting';
import { VCM_NAMESPACE } from '@utils/constants';
```

Use path aliases:
- `@vcm-types/*` for types
- `@components/*` for components
- `@hooks/*` for hooks
- `@api/*` for API clients
- `@utils/*` for utilities

## Adding New Features

### 1. Add New Resource Type

Example: Adding "Template" resource

1. **Define types** (`src/types/template.ts`):
```typescript
import type { ObjectMeta, TypeMeta } from './common';

export interface Template {
  apiVersion: string;
  kind: string;
  metadata: ObjectMeta;
  spec: TemplateSpec;
  status?: TemplateStatus;
}

export interface TemplateSpec {
  name: string;
  region: string;
  // ...
}

export interface TemplateStatus {
  phase: Phase;
  // ...
}
```

2. **Add resource model** (`src/utils/constants.ts`):
```typescript
export const TemplateModel: K8sModel = {
  apiGroup: 'vspherecapacitymanager.splat.io',
  apiVersion: 'v1',
  kind: 'Template',
  plural: 'templates',
  namespaced: true,
  label: 'Template',
  labelPlural: 'Templates',
};
```

3. **Create API client** (`src/api/k8s-client.ts`):
```typescript
export const listTemplates = async (namespace: string): Promise<Template[]> => {
  return k8sList<Template>(TemplateModel, namespace);
};

export const createTemplate = async (template: Template, namespace: string): Promise<Template> => {
  return k8sCreate<Template>(TemplateModel, template, namespace);
};
```

4. **Create hooks** (`src/hooks/useK8sWatchResource.ts`):
```typescript
export const useTemplatesWatch = (namespace: string = VCM_NAMESPACE) => {
  return useK8sWatchResource<Template[]>({
    groupVersionKind: {
      group: TemplateModel.apiGroup,
      version: TemplateModel.apiVersion,
      kind: TemplateModel.kind,
    },
    isList: true,
    namespace,
  });
};
```

5. **Create components**:
   - `src/components/templates/TemplateList.tsx`
   - `src/components/templates/TemplateDetail.tsx`
   - `src/components/templates/TemplateForm.tsx`

6. **Add routes** (`src/index.tsx`):
```typescript
{
  type: 'console.navigation/href',
  properties: {
    id: 'vcm-templates',
    section: 'vsphere-capacity-manager',
    name: 'Templates',
    href: '/vcm/templates',
  },
},
{
  type: 'console.page/route',
  properties: {
    exact: true,
    path: '/vcm/templates',
    component: { $codeRef: 'TemplateList' },
  },
},
```

7. **Export components** (`src/plugin.ts`):
```typescript
export { TemplateList } from './components/templates/TemplateList';
export { TemplateDetail } from './components/templates/TemplateDetail';
export { TemplateForm } from './components/templates/TemplateForm';
```

8. **Update manifest** (`console-extensions.json`):
```json
"exposedModules": {
  "TemplateList": "./plugin-code-bundle.js",
  "TemplateDetail": "./plugin-code-bundle.js",
  "TemplateForm": "./plugin-code-bundle.js"
}
```

9. **Add tests**:
   - Unit tests for API client
   - Component tests for list/detail/form

### 2. Add Dashboard Widget

1. **Create Prometheus query hook** (`src/hooks/usePrometheusQuery.ts`):
```typescript
export const useTemplateStats = () => {
  return usePrometheusQuery({
    query: 'sum(template_count) by (type)',
  });
};
```

2. **Create widget component** (`src/components/dashboard/TemplateWidget.tsx`):
```typescript
export const TemplateWidget: React.FC = () => {
  const { data, isLoading } = useTemplateStats();
  
  // Parse and display data
};
```

3. **Add to dashboard** (`src/components/dashboard/CapacityDashboard.tsx`):
```typescript
import { TemplateWidget } from './TemplateWidget';

// In render:
<GridItem span={6}>
  <TemplateWidget />
</GridItem>
```

### 3. Add Form Validation

1. **Create validation function** (`src/utils/validation.ts`):
```typescript
export const validateTemplate = (data: Partial<TemplateSpec>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  
  // More validations...
  
  return errors;
};
```

2. **Use in form component**:
```typescript
const [errors, setErrors] = React.useState<ValidationError[]>([]);

const handleSubmit = () => {
  const validationErrors = validateTemplate(formData);
  if (validationErrors.length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  // Submit...
};
```

3. **Add tests** (`src/utils/__tests__/validation.test.ts`):
```typescript
describe('validateTemplate', () => {
  it('validates required fields', () => {
    const errors = validateTemplate({});
    expect(getFieldError(errors, 'name')).toBe('Name is required');
  });
});
```

## Testing

### Unit Tests

**File Location**: `src/**/__tests__/*.test.ts(x)`

**Running Tests**:
```bash
npm test                 # Run once
npm run test:watch       # Watch mode
npm test -- --coverage   # With coverage
```

**Example**:
```typescript
// src/utils/__tests__/formatting.test.ts
import { formatGB } from '../formatting';

describe('formatGB', () => {
  it('formats gigabytes correctly', () => {
    expect(formatGB(100)).toBe('100 GB');
  });
  
  it('handles undefined', () => {
    expect(formatGB(undefined as any)).toBe('-');
  });
});
```

### Component Tests

**Example**:
```typescript
// src/components/pools/__tests__/PoolList.test.tsx
import { render, screen } from '@testing-library/react';
import { PoolList } from '../PoolList';

jest.mock('@hooks/useK8sWatchResource', () => ({
  usePoolsWatch: () => [mockPools, true, null],
}));

describe('PoolList', () => {
  it('renders pool list', () => {
    render(<PoolList />);
    expect(screen.getByText('Pools')).toBeInTheDocument();
  });
});
```

### Integration Tests

Run manually after deployment. See [TESTING.md](TESTING.md) for checklists.

## Build Process

### Webpack Configuration

**Entry Points**:
- `plugin.tsx` → `plugin-bundle.js` (plugin registration)
- `plugin-code.ts` → `plugin-code-bundle.js` (component code)

**Externals**:
- React, ReactDOM, react-router-dom provided by console
- @console/* modules externalized
- PatternFly bundled (not provided by console)

**Output**:
- Production: Minified, no source maps
- Development: Source maps enabled

### Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Analyze bundle (requires webpack-bundle-analyzer)
npm run build -- --analyze
```

### Container Build

**Dockerfile**:
- Stage 1: Node build (npm ci, npm run build)
- Stage 2: Nginx serve (copy dist/, nginx.conf)

**Build Process**:
```bash
# From repository root
make plugin-build    # npm build
make plugin-image    # docker/podman build
make plugin-push     # push to registry
```

## Deployment

### Kubernetes Resources

**Namespace**: `vsphere-infra-helpers`

**Resources**:
- **ServiceAccount**: `vsphere-capacity-manager-console-plugin`
- **Deployment**: 2 replicas, nginx serving static files
- **Service**: ClusterIP on port 9443 with TLS
- **ConsolePlugin**: Registers with OpenShift Console

**TLS**:
- Managed by OpenShift service serving cert
- Secret: `vsphere-capacity-manager-console-plugin-cert`
- Auto-rotation before expiry

### Deployment Process

```bash
# Apply manifests
oc apply -k console-plugin/manifests/

# Enable plugin
oc patch consoles.operator.openshift.io cluster \
  --type merge \
  -p '{"spec":{"plugins":["vsphere-capacity-manager"]}}'

# Verify
oc get deployment -n vsphere-infra-helpers
oc get consoleplugin
```

### Rollout Updates

```bash
# Update image
oc set image deployment/vsphere-capacity-manager-console-plugin \
  -n vsphere-infra-helpers \
  vsphere-capacity-manager-console-plugin=quay.io/ocp-splat/vcm-console-plugin:v1.1.0

# Watch rollout
oc rollout status deployment/vsphere-capacity-manager-console-plugin \
  -n vsphere-infra-helpers
```

## Performance Optimization

### Bundle Size

**Target**: < 500 KB gzipped  
**Current**: 307 KB gzipped ✅

**Strategies**:
- Externalize dependencies (React, @console/*)
- Tree shaking (import specific components)
- Code splitting (lazy load routes)
- Minification (Terser plugin)
- Compression (gzip/brotli)

See [BUNDLE_OPTIMIZATION.md](BUNDLE_OPTIMIZATION.md) for details.

### Runtime Performance

**Optimization Techniques**:
- React.memo() for expensive components
- useMemo() for heavy computations
- useCallback() for callback stability
- Virtualized lists for large datasets (react-window)
- Debounce search inputs
- Lazy load heavy dependencies (charts)

**Monitoring**:
```typescript
// Track component render time
React.useEffect(() => {
  const start = performance.now();
  return () => {
    console.log(`Rendered in ${performance.now() - start}ms`);
  };
}, []);
```

## Troubleshooting

### Build Errors

**TypeScript errors**:
```bash
npm run type-check
# Fix type errors, then rebuild
```

**Module not found**:
- Check path aliases in tsconfig.json and webpack.config.ts
- Verify import paths use correct alias

**Webpack errors**:
- Check webpack.config.ts syntax
- Verify all loaders are installed

### Runtime Errors

**Console shows errors**:
1. Open browser DevTools (F12)
2. Check Console tab for stack traces
3. Use React DevTools to inspect components

**API calls fail**:
1. Check network tab for failed requests
2. Verify OAuth token is present (run in Console iframe)
3. Check RBAC permissions: `oc auth can-i get pools`

**Metrics not loading**:
1. Verify Prometheus service exists: `oc get svc -n vsphere-infra-helpers metrics`
2. Check ConsolePlugin proxy config: `oc get consoleplugin vsphere-capacity-manager -o yaml`
3. Port-forward and test: `oc port-forward svc/metrics 8080:8080`

## Contributing

1. **Fork** the repository
2. **Create branch** for feature: `git checkout -b feature/my-feature`
3. **Make changes** following code style
4. **Add tests** for new functionality
5. **Run tests**: `npm test`
6. **Build**: `npm run build`
7. **Commit** with clear message
8. **Push** to your fork
9. **Open PR** with description of changes

## Resources

- [OpenShift Console Dynamic Plugin SDK](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
- [PatternFly React Documentation](https://www.patternfly.org/v4/)
- [React Query Documentation](https://tanstack.com/query/v3/docs/react/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Webpack Documentation](https://webpack.js.org/concepts/)
