# Testing Guide

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- formatting.test.ts
```

### Test Coverage

Coverage thresholds are set to 50% for:
- Branches
- Functions
- Lines
- Statements

Current coverage can be viewed by running:
```bash
npm test -- --coverage
```

### Test Structure

Tests are located in `__tests__` directories next to the files they test:

```
src/
├── utils/
│   ├── __tests__/
│   │   ├── formatting.test.ts
│   │   └── validation.test.ts
│   ├── formatting.ts
│   └── validation.ts
```

## Manual Testing Checklist

### Pool Management

- [ ] **List View**
  - [ ] Table displays all pools with correct data
  - [ ] Capacity bars show correct utilization
  - [ ] Sorting works for name, region, zone columns
  - [ ] Clicking row navigates to detail page
  - [ ] Create Pool button navigates to form

- [ ] **Detail View**
  - [ ] Overview card shows name, server, region, zone
  - [ ] Capacity gauges display correct vCPU, memory, storage usage
  - [ ] Topology card shows datacenter, cluster, datastore, networks
  - [ ] Taints card displays when taints exist
  - [ ] Active leases table shows correct data
  - [ ] Edit button navigates to form
  - [ ] Delete button shows confirmation

- [ ] **Create/Edit Form**
  - [ ] Name field is required
  - [ ] Validation prevents submission with empty required fields
  - [ ] Success creates/updates pool correctly
  - [ ] Error messages display on failure
  - [ ] Cancel button returns to list

### Lease Management

- [ ] **List View**
  - [ ] Table displays all leases with correct data
  - [ ] Phase badges show correct colors (Fulfilled=green, Pending=yellow, Failed=red, Partial=orange)
  - [ ] Network type badges display correctly
  - [ ] Create Lease button navigates to form

- [ ] **Detail View**
  - [ ] Status card shows phase and age
  - [ ] Resource requirements card displays vCPUs, memory, storage, networks
  - [ ] Pool selection card shows required pool or pool selector
  - [ ] Tolerations table displays when tolerations exist
  - [ ] Assigned pools table shows correct pool assignments
  - [ ] Environment variables display for each pool
  - [ ] Conditions table shows full history
  - [ ] Delete button shows confirmation

- [ ] **Create Form**
  - [ ] NumberInput controls work for vCPUs, memory, storage, networks, pools
  - [ ] Network type dropdown has all options
  - [ ] Pool selector accepts multi-line key=value format
  - [ ] Tolerations builder adds/removes tolerations correctly
  - [ ] Form validates and creates lease
  - [ ] Error handling works

### Network Management

- [ ] **List View**
  - [ ] Table displays all networks with correct data
  - [ ] VLAN and port group information correct
  - [ ] IP count displays correctly
  - [ ] Create Network button navigates to form

- [ ] **Detail View**
  - [ ] Basic information card shows correct data
  - [ ] IPv4 configuration displays when present
  - [ ] IPv6 configuration displays when present
  - [ ] IP addresses grid shows all IPs
  - [ ] Nameservers display correctly
  - [ ] Edit button navigates to form
  - [ ] Delete button shows confirmation

- [ ] **Create/Edit Form**
  - [ ] Basic fields validate correctly
  - [ ] Multi-line IP addresses parse correctly
  - [ ] Multi-line nameservers parse correctly
  - [ ] Network type dropdown works
  - [ ] Success creates/updates network
  - [ ] Error handling works

### Dashboard

- [ ] **Metrics Display**
  - [ ] Total vCPUs card shows correct data
  - [ ] Total memory card shows correct data
  - [ ] Total storage card shows correct data
  - [ ] Active leases counts display correctly
  - [ ] Fulfilled/Pending/Partial counts are accurate

- [ ] **Charts**
  - [ ] CPU utilization chart loads and displays data
  - [ ] Memory utilization chart loads and displays data
  - [ ] Network type donut chart shows distribution
  - [ ] Charts update every 60 seconds
  - [ ] Error state displays when Prometheus unavailable

- [ ] **Quick Actions**
  - [ ] Create Lease button navigates to form
  - [ ] Create Pool button navigates to form

### Accessibility

- [ ] **Keyboard Navigation**
  - [ ] Tab order is logical
  - [ ] All interactive elements are keyboard accessible
  - [ ] Enter/Space activate buttons
  - [ ] Escape closes modals

- [ ] **Screen Readers**
  - [ ] Form labels are associated with inputs
  - [ ] Error messages are announced
  - [ ] Status changes are announced
  - [ ] Table headers are properly marked

- [ ] **Visual**
  - [ ] Color contrast meets WCAG 2.1 AA (4.5:1)
  - [ ] Focus indicators are visible
  - [ ] No content relies solely on color

### Performance

- [ ] **Load Times**
  - [ ] List views load in < 2 seconds
  - [ ] Detail views load in < 1 second
  - [ ] Dashboard loads in < 3 seconds

- [ ] **Large Datasets**
  - [ ] Lists with 100+ items remain responsive
  - [ ] Sorting works with large datasets
  - [ ] No UI freezing or blocking

- [ ] **Memory**
  - [ ] No memory leaks when navigating between pages
  - [ ] Watch hooks clean up properly
  - [ ] React Query cache doesn't grow indefinitely

### Error Handling

- [ ] **Network Errors**
  - [ ] 404 errors display meaningful message
  - [ ] 403 errors show permission denied
  - [ ] Timeout errors display and allow retry
  - [ ] Connection errors handled gracefully

- [ ] **Validation Errors**
  - [ ] Form validation shows specific field errors
  - [ ] Server validation errors display in UI
  - [ ] Error messages are actionable

### RBAC

- [ ] **Namespace-scoped User**
  - [ ] Can view resources in their namespace
  - [ ] Cannot view resources in other namespaces
  - [ ] Cannot create/edit/delete without permissions
  - [ ] Appropriate error message shown

- [ ] **Cluster Admin**
  - [ ] Can view all resources
  - [ ] Can create/edit/delete resources
  - [ ] All actions work correctly

## Browser Compatibility

Test on the following browsers:

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest - Mac only)

## Integration Testing

### Prerequisites

1. OpenShift 4.12+ cluster
2. VCM operator installed
3. Plugin deployed
4. Test user accounts with different RBAC configurations

### End-to-End Scenario

1. Log into OpenShift Console as cluster admin
2. Navigate to "vSphere Capacity" menu
3. Verify dashboard displays (may show zeros if no pools exist)
4. Create a new pool with:
   - Name: test-pool-1
   - Region: us-east-1
   - Zone: zone-a
   - vCPUs: 100
   - Memory: 512 GB
   - Storage: 1000 GB
5. Verify pool appears in list
6. Verify dashboard updates with new pool capacity
7. Create a lease requesting:
   - vCPUs: 10
   - Memory: 64 GB
   - Pools: 1
   - Network type: single-tenant
8. Watch lease phase transition to "Fulfilled"
9. Verify pool capacity decreases on dashboard
10. Delete lease
11. Verify pool capacity increases
12. Delete pool
13. Verify dashboard updates

### RBAC Testing

1. Create namespace `test-vcm`
2. Create user `test-user` with permissions only in `test-vcm`
3. Create pool in `test-vcm` namespace as admin
4. Log in as `test-user`
5. Verify user can see pool in `test-vcm`
6. Verify user cannot see pools in other namespaces
7. Attempt to create lease (should fail if user lacks create permission)
8. Verify appropriate error message

## Performance Testing

### Bundle Size

```bash
npm run build
ls -lh dist/
```

Target: plugin-code-bundle.js < 500KB gzipped

### Load Time

Use browser DevTools Network tab:
- Disable cache
- Measure time to interactive for each page
- Target: < 2 seconds for all pages

### Memory Profiling

Use browser DevTools Memory profiler:
1. Take heap snapshot
2. Navigate between all pages
3. Return to starting page
4. Take second heap snapshot
5. Compare - detached DOM nodes should be minimal

## Debugging Tests

### Common Issues

**Tests fail with "Cannot find module"**
- Check tsconfig.json paths match jest.config.js moduleNameMapper
- Ensure all imports use the correct aliases

**Tests timeout**
- Increase jest timeout: `jest.setTimeout(10000)`
- Check for unresolved promises in async tests
- Verify mocks are set up correctly

**React Testing Library errors**
- Ensure setupTests.ts is loaded
- Check that DOM is properly cleaned up between tests
- Use `screen.debug()` to inspect rendered output

### Debugging Tips

```typescript
// Debug rendered output
import { screen } from '@testing-library/react';
screen.debug();

// Check specific element
screen.debug(screen.getByRole('button'));

// Use testing-playground
screen.logTestingPlaygroundURL();
```

## Continuous Integration

### GitHub Actions / CI Pipeline

Recommended CI configuration:

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run build
```

## Test Maintenance

- Keep tests updated when implementation changes
- Add tests for new features
- Remove tests for removed features
- Refactor tests to reduce duplication
- Update snapshots when UI intentionally changes
- Review coverage reports to identify gaps
