# TypeScript Instructions for Angular 20

## Modern Angular TypeScript Guidelines

- Use standalone components and services; avoid NgModules for new code.
- Prefer signals for reactive state and computed values; use RxJS only for complex async flows.
- Use new control flow syntax in templates (`@if`, `@for`, `@switch`).
- Leverage new lifecycle hooks: `afterNextRender()`, `afterRender()`.
- Use `input()` and `output()` functions for component properties.
- Apply the Resource API for declarative data fetching.
- Use functional dependency injection with `inject()`.
- Prefer composition over inheritance for component logic; use host directives for cross-cutting concerns.
****- Use OnPush change detection by default.
- Implement functional route guards and resolvers.
- Use strict TypeScript mode and latest ECMAScript features.
- Apply TypeScript utility types (Partial, Required, Pick, Omit) for strong typing.
- Use generic types for reusable components and services.
- Organize code by feature-based folder structure and barrel exports.
- Document code with JSDoc and follow Angular style guide naming conventions.

## OOP & SOLID Principles

- Encapsulate state and logic in classes and services.
- Use interfaces and abstract classes for abstraction.
- Apply SOLID principles:
  - **Single Responsibility**: Each class/service/component should have one responsibility.
  - **Open/Closed**: Classes should be open for extension, closed for modification.
  - **Liskov Substitution**: Subtypes must be substitutable for their base types.
  - **Interface Segregation**: Prefer small, focused interfaces.
  - **Dependency Inversion**: Depend on abstractions, not concretions; use Angular DI.
- Implement design patterns (factory, strategy, observer, etc.) where appropriate.

## Example Patterns

```typescript
@Component({
   selector: 'app-feature',
   standalone: true,
   changeDetection: ChangeDetectionStrategy.OnPush,
   template: `...`,
})
export class FeatureComponent {
   private readonly apiService = inject(ApiService);
   readonly loading = signal(false);
   readonly items = signal<Item[]>([]);
   readonly filteredItems = computed(() => this.items().filter(item => item.active));
}

@Injectable({ providedIn: 'root' })
export class DataService {
   private readonly http = inject(HttpClient);
   private readonly _data = signal<Data[]>([]);
   readonly data = this._data.asReadonly();
   loadData() {
      return this.http.get<Data[]>('/api/data').pipe(tap(data => this._data.set(data)));
   }
}
```

- Use functional programming principles: immutability, pure functions, higher-order functions.
- Always sanitize inputs and follow security best practices.
- Write unit tests for all logic and achieve high code coverage.
