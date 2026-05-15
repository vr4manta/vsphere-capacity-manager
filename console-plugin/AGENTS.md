# AI Agent Instructions for vSphere Capacity Manager Console Plugin

This document provides guidelines for AI agents working on the vSphere Capacity Manager OpenShift Console Dynamic Plugin.

## Project Overview

This is an OpenShift Console Dynamic Plugin that provides a web UI for managing vSphere infrastructure capacity through three custom resource types:
- **Pool** - Resource pools (vCPUs, memory, storage, networks)
- **Lease** - Resource allocation requests  
- **Network** - VLAN/network infrastructure

The plugin integrates with the OpenShift web console using the Dynamic Plugin SDK and follows OpenShift Console development best practices.

## Technology Stack

- **Framework:** OpenShift Console Dynamic Plugin SDK 4.22-latest
- **Language:** TypeScript 5.9+
- **UI Library:** React 18 + PatternFly 6
- **Build Tool:** Webpack 5 with Module Federation
- **State Management:** React Query for server state
- **Package Manager:** Yarn
- **Node Version:** 22+
- Playwright for e2e testing

## Development Guidelines

### CSS and Styling

1. **Use PatternFly CSS variables** - Never use hardcoded hex colors or raw CSS values. Always use PatternFly CSS variables for colors, spacing, typography, etc.

   ```css
   /* ❌ WRONG */
   color: #000000;
   margin: 20px;
   
   /* ✅ CORRECT */
   color: var(--pf-t--global--text--color--regular);
   margin: var(--pf-t--global--spacer--md);
   ```

2. **Prefix all custom CSS classes** - All custom CSS classes must be prefixed with `vsphere-capacity-manager__` to avoid conflicts with the console or other plugins.

   ```tsx
   /* ❌ WRONG */
   <div className="header" />
   
   /* ✅ CORRECT */
   <div className="vsphere-capacity-manager__header" />
   ```

3. **Never use naked element selectors** - Always scope CSS to avoid affecting global styles.

   ```css
   /* ❌ WRONG */
   button { ... }
   div { ... }
   
   /* ✅ CORRECT */
   .vsphere-capacity-manager__custom-button { ... }
   ```

4. **Prefer PatternFly components** - Use PatternFly components with their built-in styling instead of custom CSS whenever possible. Only add custom styles when absolutely necessary.

### Internationalization (i18n)

1. **Use the i18n namespace** - All translatable strings must use the namespace `plugin__vsphere-capacity-manager`.

   ```tsx
   import { useTranslation } from 'react-i18next';
   
   const { t } = useTranslation('plugin__vsphere-capacity-manager');
   const label = t('Pools');
   ```

2. **Never hardcode user-facing strings** - All text visible to users must be wrapped in translation functions.

   ```tsx
   /* ❌ WRONG */
   <Title>Pools</Title>
   
   /* ✅ CORRECT */
   <Title>{t('Pools')}</Title>
   ```

3. **Translation files location** - Place translation files in `locales/<lang>/plugin__vsphere-capacity-manager.json`.

### Module Federation and Exposed Modules

1. **Maintain mapping consistency** - The `$codeRef` values in `console-extensions.json` must match keys in `package.json` `exposedModules`.

   In `console-extensions.json`:
   ```json
   {
     "component": { "$codeRef": "PoolList.PoolList" }
   }
   ```
   
   In `package.json`:
   ```json
   "exposedModules": {
     "PoolList": "./components/pools/PoolList"
   }
   ```

2. **Export format** - All exposed modules must use named exports, not default exports.

   ```tsx
   /* ✅ CORRECT */
   export const PoolList: React.FC = () => { ... };
   ```

3. **Avoid breaking changes** - If you rename or move an exposed module, update both `console-extensions.json` and `package.json` exposedModules simultaneously.

### Code Quality

1. **TypeScript strict mode** - All code must compile with TypeScript strict mode enabled.

2. **No `any` types** - Avoid using `any` types. Use proper type definitions or `unknown` if the type is truly unknown.

   ```tsx
   /* ❌ WRONG */
   const data: any = ...;
   
   /* ✅ CORRECT */
   const data: Pool = ...;
   ```

3. **Prefer functional components** - Use functional components with hooks instead of class components.

4. **Custom hooks for logic** - Extract complex logic into custom hooks for reusability and testability.

### File Organization

```
console-plugin/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Shared components
│   │   ├── pools/          # Pool management
│   │   ├── leases/         # Lease management
│   │   ├── networks/       # Network management
│   │   └── dashboard/      # Overview dashboard
│   ├── hooks/              # Custom React hooks
│   ├── api/                # API client utilities
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions
├── locales/                # i18n translation files
│   └── en/
│       └── plugin__vsphere-capacity-manager.json
├── console-extensions.json # Plugin extension points
├── package.json            # Metadata and exposedModules
└── webpack.config.ts       # Build configuration
```

### Testing

1. **Unit tests with Jest** - Write unit tests for components and utilities in `__tests__` directories.

   ```
   src/components/pools/
   ├── PoolList.tsx
   └── __tests__/
       └── PoolList.test.tsx
   ```

2. **Test ID attributes** - Add `data-test` attributes to elements for e2e testing.

   ```tsx
   <Button data-test="create-pool-button">Create Pool</Button>
   ```

3. **Run tests before committing** - Use `yarn test` to run the test suite.

### API Integration

1. **Use K8s client utilities** - Use the custom K8s client wrappers in `src/api/k8s-client.ts` for API calls.

2. **React Query for data fetching** - Use React Query hooks for server state management.

3. **Error handling** - Always handle API errors gracefully and display user-friendly messages.

   ```tsx
   const [pools, loaded, error] = usePoolsWatch();
   
   if (error) {
     return <ErrorBox error={error} title="Error loading pools" />;
   }
   ```

### Performance

1. **Bundle size awareness** - Keep bundle size under 500KB gzipped. Avoid importing entire libraries when only specific functions are needed.

2. **Code splitting** - Components are already code-split via Module Federation. Don't add additional splitting unless necessary.

3. **Memoization** - Use `React.memo`, `useMemo`, and `useCallback` for expensive computations and prevent unnecessary re-renders.

### Accessibility

1. **ARIA labels** - Add proper ARIA labels to interactive elements.

   ```tsx
   <Button aria-label="Delete pool">
     <TrashIcon />
   </Button>
   ```

2. **Keyboard navigation** - Ensure all interactive elements are keyboard accessible.

3. **Color contrast** - Use PatternFly's color system which meets WCAG 2.1 AA standards.

## Component Structure Patterns

### Page Layout Pattern (CRITICAL)

**DO NOT use PatternFly's `<Page>` component in plugin pages.** The OpenShift Console already provides the page wrapper. Using `<Page>` will break the layout and cause content to not fill the available width.

✅ **CORRECT - Use ListPageHeader + PageSection:**
```tsx
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Button } from '@patternfly/react-core';

export const PoolList: React.FC = () => {
  return (
    <>
      <ListPageHeader title="Pools">
        <Button variant="primary">Create Pool</Button>
      </ListPageHeader>
      <PageSection>
        {/* Your content here */}
      </PageSection>
    </>
  );
};
```

❌ **WRONG - Do not use Page wrapper:**
```tsx
import { Page, PageSection, Title, Flex } from '@patternfly/react-core';

export const PoolList: React.FC = () => {
  return (
    <Page>  {/* ❌ This breaks the layout! */}
      <PageSection>
        <Flex>
          <Title>Pools</Title>
          <Button>Create Pool</Button>
        </Flex>
      </PageSection>
      <PageSection>
        {/* Content appears right-justified instead of full width */}
      </PageSection>
    </Page>
  );
};
```

**Key points:**
- Use `ListPageHeader` from `@openshift-console/dynamic-plugin-sdk` for page headers
- Pass buttons/actions as children to `ListPageHeader`
- Use `PageSection` directly without wrapping in `<Page>`
- Return a fragment (`<>...</>`) as the root element
- Do not add inline width/height styles - let the console handle layout
- Reference: [OpenShift Console Plugin Template](https://github.com/openshift/console-plugin-template)

## Common Tasks

### Adding a New Page

1. Create component in appropriate directory (e.g., `src/components/pools/NewPage.tsx`)
2. Use the correct layout pattern with `ListPageHeader` (see "Page Layout Pattern" above)
3. Export component with named export: `export const NewPage: React.FC = () => { ... }`
4. Add to `console-extensions.json`:
   ```json
   {
     "type": "console.page/route",
     "properties": {
       "exact": true,
       "path": "/vcm/newpage",
       "component": { "$codeRef": "NewPage.NewPage" }
     }
   }
   ```
5. Add to `package.json` exposedModules:
   ```json
   "NewPage": "./components/pools/NewPage"
   ```
6. Optionally add navigation link in `console-extensions.json`

### Adding a Custom Style

1. Create SCSS file next to component: `ComponentName.scss`
2. Prefix all classes with `vsphere-capacity-manager__`
3. Use only PatternFly CSS variables for values
4. Import in component: `import './ComponentName.scss';`

Example:
```scss
// PoolCard.scss
.vsphere-capacity-manager__pool-card {
  padding: var(--pf-t--global--spacer--md);
  background-color: var(--pf-t--global--background--color--primary--default);
  
  &__header {
    margin-bottom: var(--pf-t--global--spacer--sm);
    color: var(--pf-t--global--text--color--regular);
  }
}
```

### Adding Translations

1. Add English strings to `locales/en/plugin__vsphere-capacity-manager.json`:
   ```json
   {
     "Pool created successfully": "Pool created successfully",
     "Delete pool": "Delete pool"
   }
   ```
2. Use in component:
   ```tsx
   const { t } = useTranslation('plugin__vsphere-capacity-manager');
   return <Alert title={t('Pool created successfully')} />;
   ```

## Build and Deploy

### Local Development

```bash
# Install dependencies
yarn install

# Start dev server with hot reload
yarn start

# Type check
yarn type-check

# Lint
yarn lint

# Run tests
yarn test
```

### Production Build

```bash
# Build plugin bundle
yarn build

# Build container image
make plugin-image

# Push to registry
make plugin-push

# Deploy to cluster
make deploy-plugin
```

## Pitfalls to Avoid

1. **Don't use PatternFly's `<Page>` component** - The OpenShift Console provides the page wrapper. Using `<Page>` breaks layout and causes content to not fill width. Use `ListPageHeader` + `PageSection` instead. See "Page Layout Pattern" section above.

2. **Don't use default exports** - Module Federation requires named exports.

3. **Don't import from SDK internals** - Only import from `@openshift-console/dynamic-plugin-sdk`, not from internal paths.

4. **Don't mutate props or state** - Always create new objects/arrays instead of mutating.

5. **Don't use inline styles for theming** - Use PatternFly CSS variables or component props instead of inline `style={{ color: '#fff' }}`.

6. **Don't add inline width/height styles** - Let the OpenShift Console handle layout. Don't use `style={{ width: "100%", height: "100%" }}` on page components.

7. **Don't forget error boundaries** - Wrap route components in error boundaries to prevent whole plugin crashes.

8. **Don't skip accessibility** - Every interactive element needs proper labels and keyboard support.

## Resources

- [OpenShift Console Dynamic Plugin SDK](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
- [PatternFly 6 Documentation](https://www.patternfly.org/)
- [React Query Documentation](https://tanstack.com/query/v3)
- [OpenShift Console Plugin Guidelines](https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/html/web_console/dynamic-plugins)

## Plugin-Specific Notes

### Custom Resources

This plugin manages three CRD types:
- `pools.vspherecapacitymanager.splat.io`
- `leases.vspherecapacitymanager.splat.io`
- `networks.vspherecapacitymanager.splat.io`

TypeScript types are defined in `src/types/` based on the Go struct definitions.

### Prometheus Integration

The dashboard integrates with Prometheus to display capacity metrics:
- CPU/memory utilization over time
- Lease phase statistics
- Network type distribution

Use the `usePrometheusQuery` hook to fetch metrics.

### RBAC Considerations

The plugin respects Kubernetes RBAC. Users need appropriate permissions to view/edit resources. The K8s API returns 403 for unauthorized requests - handle these gracefully in the UI.

## Questions or Issues?

When modifying this plugin:
- Review existing components for patterns before creating new ones
- Check PatternFly documentation for available components before custom coding
- Test changes in a live OpenShift cluster, not just webpack dev server
- Verify RBAC behavior with different user permission levels

## References

- [Console Plugin SDK](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
- [PatternFly React](https://www.patternfly.org/get-started/develop)
- [Dynamic Plugin Enhancement Proposal](https://github.com/openshift/enhancements/blob/master/enhancements/console/dynamic-plugins.md)
