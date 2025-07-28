# HTML Instructions for Angular 20

## Modern Angular Template Syntax

- Use new control flow blocks: `@if`, `@for`, `@switch` instead of legacy structural directives (`*ngIf`, `*ngFor`).
- Structure templates for standalone components; avoid NgModules.
- Prefer signals for reactive state and rendering in templates.
- Use Material 3 markup and classes for UI consistency.
- Always use semantic HTML elements (header, main, nav, section, etc.).
- Add ARIA attributes and roles for accessibility (a11y).
- Use Angular's built-in i18n attributes for translatable text.
- For lists, use `@for (item of items(); track item.id)` and provide a trackBy function for performance.
- Use `@defer` for lazy loading template parts when needed.
- Bind properties and events with `[property]` and `(event)` syntax.
- Prefer signal-based queries for `viewChild` and `contentChild`.
- Use proper keyboard navigation and focus management in interactive elements.
- Apply Angular pipes for locale-specific formatting in templates.
- Avoid inline styles; use CSS classes and global styles.

## Example

```html
@if (loading()) {
  <div class="mat-mdc-progress-bar" role="status" aria-label="Loading"></div>
} @else {
  <section>
    <h2 i18n>Items</h2>
    @for (item of items(); track item.id) {
      <div class="mat-mdc-card" tabindex="0" aria-label="{{ item.name }}">
        <span>{{ item.name | uppercase }}</span>
      </div>
    }
  </section>
}
```

- Use comments to document template logic and accessibility features.
- Follow Angular style guide for naming and organization.
