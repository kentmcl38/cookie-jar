# Developer Reference & Configuration Guide

## Quick Start: Using BANNER_CONFIG

### Updating Configuration Without Code Changes

All configurable values are centralized in `BANNER_CONFIG` at the top of `main.js`:

```javascript
const BANNER_CONFIG = {
  CONSENT_COOKIE_NAME: 'ofcPer',           // Change this to rename consent cookie
  COOKIE_DURATION_DAYS: 7,                 // Change this to extend/shorten cookie lifetime
  INIT_TIMEOUT_MS: 100,                    // Change this to delay DOM initialization
  PRESERVED_COOKIES: [ /* ... */ ],        // Add/remove cookies that should survive blocking
  SELECTORS: { /* ... */ },                // Update if HTML structure changes
  CONSENT_VALUES: { /* ... */ },           // Change consent representation
  COOKIE_CATEGORIES: { /* ... */ },        // Add/remove cookie categories
};
```

---

## Configuration Reference

### BANNER_CONFIG.SELECTORS

Each HTML element queried by the banner must have a corresponding `data-item` attribute. All selectors are here for easy updates:

```javascript
SELECTORS: {
  BANNER_CONTAINER: "[data-item='js-banner-container']",
  SETTINGS_CONTAINER: "[data-item='js-settings-container']",
  SETTINGS_CONTENT: "[data-item='js-settings-content']",
  SETTINGS_BUTTON: "[data-item='js-settings-button']",
  SETTINGS_BUTTON_2: "[data-item='js-settings-button-2']",
  REJECT_BUTTON: "[data-item='js-reject-button']",
  ACCEPT_BUTTON: "[data-item='js-accept-button']",
  SETTINGS_CLOSE_BUTTON: "[data-item='js-settings-close-button']",
  SETTINGS_ACCORDION_HEAD: "[data-item='js-settings-accordion-head']",
  CONFIRM_BUTTON: "[data-item='js-confirm-button']",
  COOKIE_CONTAINER: "[data-item='js-cookie-container']",
  CLOSE_BUTTON: "[data-item='js-close-button']",
  TOGGLE_PERFORMANCE: "[data-item='js-toggle-pC'] input",
  TOGGLE_ANALYTICS: "[data-item='js-toggle-aC'] input",
  TOGGLE_MARKETING: "[data-item='js-toggle-mC'] input",
  TOGGLE_FUNCTIONAL: "[data-item='js-toggle-fC'] input",
}
```

**To update selectors:**
1. Change the selector string in `BANNER_CONFIG.SELECTORS`
2. Update corresponding `data-item` attribute in HTML
3. No other code changes needed ?

### BANNER_CONFIG.COOKIE_CATEGORIES

Maps cookie category names between code and CSV data:

```javascript
COOKIE_CATEGORIES: {
  STRICTLY_NECESSARY: 'Strictly necessary cookies',
  PERFORMANCE: 'Performance cookies',
  ANALYTICS: 'Analytic cookies',  // Note: "Analytic" not "Analytics"
  MARKETING: 'Marketing cookies',
  FUNCTIONAL: 'Functional cookies',
}
```

**Important**: These must match the CSV column values exactly (case-sensitive).

### BANNER_CONFIG.PRESERVED_COOKIES

Cookies that will NOT be deleted when user declines:

```javascript
PRESERVED_COOKIES: [
  'ofcPer',           // Consent preference cookie
  'Strictly',         // Category preferences
  'Performance',
  'Analytics',
  'Marketing',
  'Functional',
]
```

**To add a new cookie category:**
1. Add to `PRESERVED_COOKIES` array
2. Add to `COOKIE_CATEGORIES` object
3. Add toggle selector to `SELECTORS`
4. Update HTML with corresponding toggle element

---

## Common Tasks

### Task 1: Change Consent Cookie Name

**Before:**
```javascript
// Scattered throughout code
this.setCookie("ofcPer", "yes", 7);
this.getCookie("ofcPer");
```

**After:**
```javascript
// Single place to change
const BANNER_CONFIG = {
  CONSENT_COOKIE_NAME: 'myCustomConsentCookie',  // ? Change here only
  // ...
};

// Use throughout code
this.setCookie(BANNER_CONFIG.CONSENT_COOKIE_NAME, "yes", 7);
```

---

### Task 2: Add New Cookie Category

**Steps:**

1. **Add to BANNER_CONFIG**:
```javascript
COOKIE_CATEGORIES: {
  // ... existing categories
  ADVERTISING: 'Advertising cookies',  // ? NEW
}
```

2. **Add toggle selector**:
```javascript
SELECTORS: {
  // ... existing selectors
  TOGGLE_ADVERTISING: "[data-item='js-toggle-adC'] input",  // ? NEW
}
```

3. **Update CSV data** to include "Advertising cookies" in Category column

4. **Add HTML toggle element**:
```html
<label class="ofc-toggle-switch" data-item="js-toggle-adC">
  <input type="checkbox">
  <span class="ofc-toggle-slider"></span>
</label>
```

5. **Update initialization logic** in `updatePreference()`:
```javascript
const categoryMappings = [
  // ... existing mappings
  {
    category: BANNER_CONFIG.COOKIE_CATEGORIES.ADVERTISING,
    toggle: toggles.adC,
  },
];
```

---

### Task 3: Change Cookie Lifetime

**Before:**
```javascript
// Multiple places
this.setCookie(name, value, 7);  // Scattered throughout
```

**After:**
```javascript
const BANNER_CONFIG = {
  COOKIE_DURATION_DAYS: 30,  // ? Change from 7 to 30
  // ...
};

// Use everywhere
this.setPrefCookie(categoryName, agreed, BANNER_CONFIG.COOKIE_DURATION_DAYS);
```

---

### Task 4: Update DOM Selectors (HTML Refactor)

If you change HTML structure:

1. **Update selectors in BANNER_CONFIG**:
```javascript
SELECTORS: {
  BANNER_CONTAINER: "[data-item='js-banner-container']",
  // Change the selector above to match new HTML
}
```

2. **Update corresponding HTML**:
```html
<!-- Update data-item attribute -->
<div data-item='js-banner-container'>...</div>
```

3. **No other code changes needed!** ?

---

## Testing Guide

### Unit Test Template

```javascript
describe('Banner', () => {
  
  test('Configuration has all required fields', () => {
    expect(BANNER_CONFIG).toHaveProperty('CONSENT_COOKIE_NAME');
    expect(BANNER_CONFIG).toHaveProperty('COOKIE_DURATION_DAYS');
    expect(BANNER_CONFIG).toHaveProperty('SELECTORS');
    expect(BANNER_CONFIG).toHaveProperty('COOKIE_CATEGORIES');
  });

  test('getCookie uses strict equality', () => {
    document.cookie = 'test=123';
    const value = banner.getCookie('test');
    expect(value).toBe('123');  // String, not coerced
    expect(value).not.toBe(123); // Type matters
  });

  test('categorizeCookies handles empty data gracefully', () => {
    const banner = new Banner({});
    banner.pendingCookies = ['cookie1=value1'];
    banner.categorizeCookies({});
    expect(banner.categorizedCookies).toBeDefined();
  });

  test('Block cookies removes non-preserved cookies only', () => {
    document.cookie = 'GA_ID=abc123; Path=/';
    document.cookie = 'ofcPer=yes; Path=/';  // Should be preserved
    banner.blockCookies();
    expect(banner.getCookie('ofcPer')).toBe('yes');  // Preserved
  });

  test('handleConsent sets all preference cookies', () => {
    banner.handleConsent();
    expect(banner.getCookie('Performance')).toBe('true');
    expect(banner.getCookie('Analytics')).toBe('true');
    expect(banner.getCookie('Marketing')).toBe('true');
  });

  test('handleRejection only sets Strictly Necessary', () => {
    banner.handleRejection();
    expect(banner.getCookie('Strictly')).toBe('true');
    expect(banner.getCookie('Performance')).toBe('false');
    expect(banner.getCookie('Marketing')).toBe('false');
  });

  test('CSV parsing handles BOM correctly', () => {
    const csvWithBOM = '\uFEFFCookie,Category\ntest,Performance';
    const parsed = parseCSV(csvWithBOM);
    expect(Object.keys(parsed).length).toBeGreaterThan(0);
  });

});
```

---

## Migration Checklist

If upgrading from the old version:

- [ ] Backup current `main.js`
- [ ] Replace with new refactored `main.js`
- [ ] Replace `index.html` (minor trailing space fix)
- [ ] Replace `main.css` (CSS rule consolidation)
- [ ] Test in development
- [ ] Verify cookies still work
- [ ] Check consent banner appears
- [ ] Verify accept/reject functionality
- [ ] Deploy to production

**No data migration needed** - all functionality is identical.

---

## Troubleshooting

### Issue: Banner not appearing
**Check:**
- `BANNER_CONFIG.SELECTORS.BANNER_CONTAINER` matches HTML `data-item`
- CSV file loads successfully (check console)
- Constructor completes without errors

### Issue: Cookies not being set
**Check:**
- `BANNER_CONFIG.CONSENT_COOKIE_NAME` is correct
- `COOKIE_DURATION_DAYS` is positive
- Browser cookies are enabled
- Domain/path restrictions

### Issue: Categories not recognized
**Check:**
- `COOKIE_CATEGORIES` values match CSV exactly (case-sensitive)
- CSV file encoding is UTF-8
- No BOM in CSV file causing parsing issues

### Issue: Console errors
**Check:**
- All selectors in `BANNER_CONFIG.SELECTORS` exist in HTML
- CSV URL is accessible
- No JavaScript syntax errors in console

---

## Performance Notes

### Optimizations Implemented

1. **DOM Query Caching**: All selectors queried once in constructor
2. **Early Returns**: Invalid data processed quickly without full iteration
3. **Set Data Structure**: `loadedScripts` uses `Set` for O(1) lookups instead of Array O(n)
4. **Lazy Initialization**: DOM queries deferred until needed (100ms after DOM load)

### Recommendations

- Keep `INIT_TIMEOUT_MS` at 100ms unless you have slow page loads
- CSV file should be <100KB for best performance
- Limit inline scripts - use external URLs where possible

---

## Best Practices

? **DO:**
- Update values in `BANNER_CONFIG` when customizing
- Use helper methods like `addEventListener()`
- Handle null/undefined with optional chaining (`?.`)
- Use `const` by default, `let` only when reassigning

? **DON'T:**
- Hardcode strings in methods (use `BANNER_CONFIG`)
- Use loose equality (`==`) - always use `===`
- Forget to validate input data
- Add event listeners without null checks

---

## API Reference

### Public Methods

```javascript
// Initialize banner
new Banner(csvData)

// Check if user has consented
banner.checkCookie()  // Returns: boolean

// Get specific cookie value
banner.getCookie(name)  // Returns: string

// Set cookie value
banner.setCookie(name, value, days)

// Show/hide elements
banner.showElement(element)
banner.hideElement(element)

// Categorize cookies from CSV data
banner.categorizeCookies(csvData)

// Load scripts based on user preferences
banner.loadConsentedScripts()

// Sync toggles with stored preferences
banner.syncTogglesToPreferences()
```

### Global Functions

```javascript
// Fetch and parse CSV
readCSVFile(url)  // Returns: Promise<Object>

// Parse CSV string to object
parseCSV(csvString)  // Returns: Object
```

---

## Version History

### v2.0 (Current - Refactored)
- ? Centralized configuration
- ? Modern ES6+ syntax
- ? Improved error handling
- ? Reduced code duplication
- ? Enhanced null safety

### v1.0 (Original)
- Functional but with code smells
- Scattered magic strings
- Mixed syntax styles
- Silent error handling

---

## Support Resources

For issues or questions:

1. Check `QUALITY_REVIEW_SUMMARY.md` for changes overview
2. Check `TECHNICAL_CHANGES.md` for detailed refactoring
3. Review `BANNER_CONFIG` constants
4. Check browser console for error messages
5. Verify CSV file format and encoding

---

## Contributing

When adding features:

1. Add configuration to `BANNER_CONFIG` if it's customizable
2. Use existing helper methods (`addEventListener()`, etc.)
3. Follow existing code style (arrow functions, template literals, `const` by default)
4. Add input validation to new methods
5. Update tests and documentation

---

**Last Updated**: 2026-01-28  
**Maintained By**: Quality Engineering Team  
**Status**: Production Ready ?
