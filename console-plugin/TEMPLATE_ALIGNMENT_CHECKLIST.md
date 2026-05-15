# Template Alignment Checklist

This document tracks alignment with OpenShift Console Plugin Template best practices as defined in AGENTS.md.

## Status Legend
- ✅ Complete
- ⚠️ Partial / Needs improvement
- ❌ Not implemented

## 1. CSS and Styling

### PatternFly CSS Variables
- ❌ **Replace inline styles with PatternFly CSS variables**
  - Current: Using inline `style` props throughout components
  - Files affected: Most component files use inline styles for layout
  - Action needed: Create SCSS files with PatternFly CSS variables
  - Priority: Medium (works but not following best practices)

### CSS Class Prefixing
- ❌ **Add `vsphere-capacity-manager__` prefix to custom classes**
  - Current: `className` props exist but no custom prefix
  - Files with className:
    - `src/components/common/StatusBadge.tsx`
    - `src/components/common/CapacityGauge.tsx`
    - `src/components/common/ResourceList.tsx`
  - Action needed: When adding custom styles, ensure all classes are prefixed
  - Priority: Low (no custom CSS yet, but important for future)

### Element Selectors
- ✅ **No naked element selectors**
  - Current: No custom CSS files yet
  - Status: N/A until custom styles added

### PatternFly Components Usage
- ✅ **Using PatternFly components throughout**
  - All UI built with PatternFly 6 components
  - No custom components where PF alternatives exist

## 2. Internationalization (i18n)

### Translation Infrastructure
- ⚠️ **Partial i18n setup**
  - ✅ Translation file exists: `locales/en/plugin__vsphere-capacity-manager.json`
  - ✅ Correct namespace: `plugin__vsphere-capacity-manager`
  - ❌ Not imported/used in any components yet
  
### Hardcoded Strings
- ❌ **Replace hardcoded strings with t() function**
  - All user-facing text currently hardcoded
  - Files needing translation wrapper:
    - `src/components/dashboard/CapacityDashboard.tsx`
    - `src/components/pools/PoolList.tsx`
    - `src/components/pools/PoolDetail.tsx`
    - `src/components/pools/PoolForm.tsx`
    - `src/components/leases/LeaseList.tsx`
    - `src/components/leases/LeaseDetail.tsx`
    - `src/components/leases/LeaseForm.tsx`
    - `src/components/networks/NetworkList.tsx`
    - `src/components/networks/NetworkDetail.tsx`
    - `src/components/networks/NetworkForm.tsx`
    - `src/components/common/ResourceList.tsx`
    - `src/components/common/StatusBadge.tsx`
  - Priority: High (important for multi-language support)

### Translation File Completeness
- ❌ **Expand translation file with all user-facing strings**
  - Current: Only 5 navigation items translated
  - Need: All buttons, labels, messages, errors, tooltips
  - Priority: High

## 3. Module Federation

### Console Extensions Mapping
- ✅ **Mapping between console-extensions.json and exposedModules**
  - All `$codeRef` values match exposedModules keys
  - Verified mappings:
    - CapacityDashboard.CapacityDashboard
    - PoolList.PoolList
    - PoolDetail.PoolDetail
    - PoolForm.PoolForm
    - LeaseList.LeaseList
    - LeaseDetail.LeaseDetail
    - LeaseForm.LeaseForm
    - NetworkList.NetworkList
    - NetworkDetail.NetworkDetail
    - NetworkForm.NetworkForm

### Export Format
- ✅ **Using named exports**
  - All components use named exports (not default)
  - Example: `export const PoolList: React.FC = () => { ... }`

## 4. Code Quality

### TypeScript Configuration
- ✅ **TypeScript strict mode enabled**
  - Configured in `tsconfig.json`

### Type Safety
- ⚠️ **Minimize `any` usage**
  - Some `any` types found (e.g., `as any` for Label color prop)
  - Files to review:
    - `src/components/common/StatusBadge.tsx` - `color as any`
  - Priority: Medium (workaround for PatternFly type issues)

### Component Style
- ✅ **Functional components with hooks**
  - All components are functional
  - Using hooks throughout (useState, useEffect, custom hooks)

### Custom Hooks
- ✅ **Logic extracted to custom hooks**
  - `src/hooks/useK8sWatchResource.ts` - K8s resource watching
  - `src/hooks/usePrometheusQuery.ts` - Prometheus metrics fetching

## 5. File Organization

- ✅ **Following recommended structure**
  ```
  ✅ src/components/common/
  ✅ src/components/pools/
  ✅ src/components/leases/
  ✅ src/components/networks/
  ✅ src/components/dashboard/
  ✅ src/hooks/
  ✅ src/api/
  ✅ src/types/
  ✅ src/utils/
  ✅ locales/en/
  ✅ console-extensions.json
  ✅ package.json
  ✅ webpack.config.ts
  ```

## 6. Testing

### Test Infrastructure
- ✅ **Jest configuration exists**
  - File: `jest.config.js`
  
### Unit Tests
- ❌ **No test files yet**
  - No `__tests__` directories found
  - No `.test.tsx` files found
  - Action needed: Create unit tests for components
  - Priority: Medium

### Test IDs
- ❌ **Add data-test attributes**
  - No `data-test` attributes found in components
  - Action needed: Add to all interactive elements for e2e testing
  - Priority: Low (good practice for future e2e tests)

## 7. API Integration

### K8s Client Utilities
- ✅ **Custom K8s client wrappers**
  - File: `src/api/k8s-client.ts`
  - Provides CRUD functions for all CRD types

### React Query
- ✅ **Using React Query for data fetching**
  - Hooks in `src/hooks/useK8sWatchResource.ts`
  - QueryClientProvider set up in CapacityDashboard

### Error Handling
- ✅ **Graceful error handling**
  - ErrorBox component in ResourceList
  - Error states displayed to users

## 8. Performance

### Bundle Size
- ⚠️ **Bundle size monitoring needed**
  - Target: < 500KB gzipped
  - Current: Unknown (need to measure after build)
  - Action: Add bundle size check to CI
  - Priority: Low (measure first)

### Code Splitting
- ✅ **Code splitting via Module Federation**
  - Each route component is dynamically loaded

### Memoization
- ⚠️ **Limited use of memoization**
  - No React.memo, useMemo, or useCallback found
  - Action: Profile and add where needed for performance
  - Priority: Low (optimize after identifying bottlenecks)

## 9. Accessibility

### ARIA Labels
- ⚠️ **Some ARIA labels present**
  - Table components have aria-label
  - Many buttons and icons lack aria-label
  - Action needed: Add aria-label to all interactive elements
  - Priority: High

### Keyboard Navigation
- ✅ **PatternFly components handle keyboard nav**
  - Using PatternFly components which include keyboard support

### Color Contrast
- ✅ **Using PatternFly color system**
  - All colors from PatternFly (meets WCAG 2.1 AA)

## 10. Additional Best Practices

### Stylelint Configuration
- ❌ **No stylelint config**
  - Need: `.stylelintrc.json` with rules to enforce:
    - No hex colors (must use CSS variables)
    - No naked element selectors
    - Class naming conventions
  - Priority: Medium (important when adding custom CSS)

### Error Boundaries
- ⚠️ **No error boundaries in routes**
  - Action: Wrap route components in error boundaries
  - Priority: Medium (prevents full plugin crashes)

### Documentation
- ✅ **Comprehensive documentation**
  - AGENTS.md - Development guidelines ✅
  - README.md - Project overview ✅
  - INSTALL.md - Installation instructions ✅
  - USER_GUIDE.md - User documentation ✅
  - DEVELOPER_GUIDE.md - Developer setup ✅

## Priority Action Items

### High Priority (Do First)
1. **Implement i18n across all components** - Wrap all user-facing strings with `t()` function
2. **Expand translation file** - Add all UI strings to `plugin__vsphere-capacity-manager.json`
3. **Add ARIA labels** - Improve accessibility with proper labels on interactive elements

### Medium Priority (Do Next)
1. **Create stylelint config** - Enforce CSS best practices before adding custom styles
2. **Add error boundaries** - Prevent plugin crashes from component errors
3. **Review TypeScript `any` usage** - Find better type solutions where possible
4. **Add unit tests** - Create test coverage for critical components

### Low Priority (Nice to Have)
1. **Add data-test attributes** - Prepare for e2e testing
2. **Performance profiling** - Measure and optimize if needed
3. **Replace inline styles with CSS variables** - Gradual migration to SCSS with PF variables

## Next Steps

To begin alignment:
1. Create stylelint configuration file
2. Set up i18n imports in a common component
3. Create translation strings for one component as example
4. Add error boundary wrapper
5. Gradually apply i18n to remaining components

## Tracking

- **Last Updated:** 2026-05-15
- **Alignment Status:** ~60% complete
- **Blocking Issues:** None
- **Target Completion:** Incremental improvements
