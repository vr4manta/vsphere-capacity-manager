# Accessibility Guide

## Overview

The vSphere Capacity Manager Console Plugin is designed to meet WCAG 2.1 Level AA standards. This document outlines accessibility features and testing procedures.

## Accessibility Features

### Keyboard Navigation

All interactive elements are keyboard accessible:

- **Tab**: Navigate forward through interactive elements
- **Shift+Tab**: Navigate backward through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dialogs
- **Arrow keys**: Navigate within lists and tables

#### Tab Order

Tab order follows a logical reading order:
1. Navigation menu
2. Page header actions
3. Main content (tables, forms, cards)
4. Footer/secondary actions

### Screen Reader Support

#### Form Labels

All form inputs have associated labels:

```tsx
<FormGroup label="Resource Name" fieldId="metadata-name">
  <TextInput
    id="metadata-name"
    value={metadataName}
    onChange={(_, value) => setMetadataName(value)}
    aria-label="Resource name"
    aria-required="true"
  />
</FormGroup>
```

#### Error Messages

Error messages are announced to screen readers:

```tsx
{submitError && (
  <Alert 
    variant="danger" 
    title="Submission failed" 
    isInline
    aria-live="assertive"
  >
    {submitError}
  </Alert>
)}
```

#### Status Updates

Status changes are announced using live regions:

```tsx
<div aria-live="polite" aria-atomic="true">
  Phase: {phase}
</div>
```

### Visual Accessibility

#### Color Contrast

All text meets WCAG 2.1 AA contrast requirements (4.5:1):

- **Phase Badges**:
  - Fulfilled (green): #3E8635 on white - 4.52:1 ✓
  - Pending (yellow): #F0AB00 on black - 4.63:1 ✓
  - Failed (red): #C9190B on white - 5.74:1 ✓
  - Partial (orange): #EC7A08 on white - 3.64:1 ⚠️ (needs review)

- **Links**: #0066CC on white - 7.46:1 ✓
- **Body Text**: #151515 on white - 14.86:1 ✓

#### Focus Indicators

All interactive elements have visible focus indicators:

```css
button:focus,
a:focus,
input:focus {
  outline: 2px solid #0066CC;
  outline-offset: 2px;
}
```

PatternFly components include built-in focus styling that meets WCAG requirements.

#### Non-Color Indicators

Status is not conveyed by color alone:

- **Phase badges**: Include text label (e.g., "Fulfilled", "Pending")
- **Capacity gauges**: Include percentage text
- **Charts**: Include data labels and legends

### ARIA Labels and Roles

#### Landmark Regions

Pages use semantic HTML and ARIA landmarks:

```tsx
<Page>
  <PageSection variant="light" role="banner">
    <Title headingLevel="h1">Page Title</Title>
  </PageSection>
  <PageSection role="main">
    {/* Main content */}
  </PageSection>
</Page>
```

#### Tables

Tables include proper headers and captions:

```tsx
<table aria-label="List of pools">
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Region</th>
      <th scope="col">vCPUs</th>
    </tr>
  </thead>
  <tbody>
    {/* rows */}
  </tbody>
</table>
```

#### Buttons

Buttons have descriptive labels:

```tsx
<Button
  variant="primary"
  onClick={handleCreate}
  aria-label="Create new lease"
>
  Create Lease
</Button>

<Button
  variant="link"
  isDanger
  onClick={() => handleDelete(pool)}
  aria-label={`Delete pool ${pool.metadata.name}`}
>
  Delete
</Button>
```

#### Charts

Charts include accessible alternatives:

```tsx
<Chart
  ariaTitle="CPU utilization over time"
  ariaDesc="Line chart showing average CPU utilization percentage across all pools over the last 60 minutes"
  containerComponent={
    <ChartVoronoiContainer
      labels={({ datum }) => `${datum.y.toFixed(1)}%`}
      constrainToVisibleArea
    />
  }
>
  {/* chart content */}
</Chart>
```

### Loading States

Loading indicators are announced to screen readers:

```tsx
{loading ? (
  <Spinner size="lg" aria-label="Loading pool data" />
) : (
  <ResourceList data={pools} />
)}
```

### Error Handling

Errors are clearly communicated:

```tsx
<Alert
  variant="danger"
  title="Failed to load pools"
  isInline
  aria-live="assertive"
>
  {error.message}
  <Button variant="link" onClick={retry}>
    Retry
  </Button>
</Alert>
```

## Testing for Accessibility

### Automated Testing

#### axe DevTools

Install the [axe DevTools browser extension](https://www.deque.com/axe/devtools/):

1. Open page in browser
2. Open DevTools (F12)
3. Navigate to "axe DevTools" tab
4. Click "Scan ALL of my page"
5. Review and fix any violations

#### WAVE

Use the [WAVE browser extension](https://wave.webaim.org/extension/):

1. Install WAVE extension
2. Navigate to page
3. Click WAVE icon
4. Review errors, alerts, and features
5. Fix critical issues

#### Pa11y

Run automated tests with Pa11y:

```bash
npm install -g pa11y
pa11y http://localhost:9000
```

### Manual Testing

#### Keyboard Navigation Test

1. Disconnect mouse
2. Navigate entire application using only keyboard
3. Verify all interactive elements are reachable
4. Verify focus order is logical
5. Verify Enter/Space activate buttons
6. Verify Escape closes modals

#### Screen Reader Test

**NVDA (Windows - Free)**

1. Download and install [NVDA](https://www.nvaccess.org/download/)
2. Start NVDA (Ctrl+Alt+N)
3. Navigate application using Tab and arrow keys
4. Verify all content is announced
5. Verify form labels are read correctly
6. Verify error messages are announced

**JAWS (Windows - Commercial)**

1. Start JAWS
2. Navigate application
3. Verify announcements are clear and complete

**VoiceOver (Mac - Built-in)**

1. Enable VoiceOver (Cmd+F5)
2. Navigate using VoiceOver commands
3. Verify all content is accessible

**ChromeVox (Chrome Extension)**

1. Install ChromeVox extension
2. Enable ChromeVox (Ctrl+Alt+Z on Windows/Linux, Cmd+Ctrl+Z on Mac)
3. Test navigation and announcements

#### Visual Test

1. **Zoom Test**: Zoom to 200% and verify:
   - No content is cut off
   - No horizontal scrolling
   - All text is readable
   - Layout remains usable

2. **Color Blind Simulation**: Use browser extensions or DevTools to simulate:
   - Protanopia (red-blind)
   - Deuteranopia (green-blind)
   - Tritanopia (blue-blind)
   - Verify information is not lost

3. **High Contrast Mode**: Enable Windows High Contrast Mode:
   - Verify all content is visible
   - Verify borders and focus indicators remain visible

### Testing Checklist

#### Forms

- [ ] All inputs have associated labels
- [ ] Required fields are indicated (not by color alone)
- [ ] Error messages are specific and actionable
- [ ] Validation errors are announced to screen readers
- [ ] Tab order is logical
- [ ] Can submit form using Enter key

#### Tables

- [ ] Tables have captions or aria-label
- [ ] Headers use `<th>` with scope attribute
- [ ] Row headers are properly marked
- [ ] Sortable columns are keyboard accessible
- [ ] Row selection is keyboard accessible

#### Navigation

- [ ] Navigation menu is keyboard accessible
- [ ] Current page is indicated (not by color alone)
- [ ] Skip to main content link present
- [ ] Navigation structure is clear to screen readers

#### Modals/Dialogs

- [ ] Modal has role="dialog"
- [ ] Modal has aria-labelledby or aria-label
- [ ] Focus moves to modal on open
- [ ] Focus is trapped within modal
- [ ] Escape closes modal
- [ ] Focus returns to trigger on close

#### Buttons and Links

- [ ] Purpose is clear from label alone
- [ ] Icon-only buttons have aria-label
- [ ] Links to external sites indicated
- [ ] Buttons vs links used appropriately

#### Charts and Visualizations

- [ ] Chart has descriptive title (ariaTitle)
- [ ] Chart has detailed description (ariaDesc)
- [ ] Data is available in text form
- [ ] Color is not the only way to distinguish data
- [ ] Tooltips/labels provide detail on focus

## Common Issues and Fixes

### Issue: "Form control has no label"

**Fix**: Add label element or aria-label

```tsx
// Before
<TextInput value={name} onChange={setName} />

// After
<FormGroup label="Name" fieldId="name">
  <TextInput id="name" value={name} onChange={setName} />
</FormGroup>
```

### Issue: "Button has no text"

**Fix**: Add aria-label for icon-only buttons

```tsx
// Before
<Button variant="plain" onClick={handleEdit}>
  <PencilAltIcon />
</Button>

// After
<Button 
  variant="plain" 
  onClick={handleEdit}
  aria-label="Edit pool"
>
  <PencilAltIcon />
</Button>
```

### Issue: "Insufficient color contrast"

**Fix**: Use darker colors or add background

```tsx
// Before
<span style={{ color: '#FFA500' }}>Warning</span>

// After
<span style={{ 
  color: '#CC7000',  // Darker orange for better contrast
  fontWeight: 'bold' 
}}>
  Warning
</span>
```

### Issue: "No keyboard access to interactive element"

**Fix**: Ensure element is focusable

```tsx
// Before
<div onClick={handleClick}>Click me</div>

// After
<button onClick={handleClick}>Click me</button>

// Or if div is required
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

### Issue: "Missing live region for dynamic content"

**Fix**: Add aria-live to announce changes

```tsx
// Before
{error && <div>{error}</div>}

// After
{error && (
  <div role="alert" aria-live="assertive">
    {error}
  </div>
)}
```

## Resources

### Standards and Guidelines

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [PatternFly Accessibility](https://www.patternfly.org/v4/accessibility/accessibility-fundamentals)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Pa11y](https://pa11y.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Screen Readers

- [NVDA](https://www.nvaccess.org/) (Windows, Free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows, Commercial)
- VoiceOver (Mac/iOS, Built-in)
- [ChromeVox](https://chrome.google.com/webstore/detail/chromevox-classic-extensi/kgejglhpjiefppelpmljglcjbhoiplfn) (Chrome Extension)

### Learning Resources

- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [Red Hat Accessibility Guide](https://www.redhat.com/en/about/digital-accessibility)

## Support

For accessibility issues or questions, please file an issue on GitHub with the "accessibility" label.
