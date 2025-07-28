# Angular 20 Development Instructions

## Core Programming Principles
- **Object-Oriented Programming**: Master encapsulation, inheritance, polymorphism, and abstraction
- **Functional Programming**: Practice immutability, pure functions, higher-order functions, and function composition
- **Design Patterns**: Implement and understand creational, structural, and behavioral design patterns

## Angular 20 Specific Guidelines


### Modern Angular Features
- **ng**: Use the new `ng` command for CLI operations
- **Standalone Components**: Prefer standalone components over NgModules for new development
- **Control Flow Syntax**: Use new `@if`, `@for`, `@switch` control flow instead of structural directives
- **Signals**: Leverage Angular Signals for reactive state management
- **Input/Output Functions**: Use new `input()` and `output()` functions for component properties
- **New Lifecycle Hooks**: Utilize `afterNextRender()` and `afterRender()` for DOM operations
- **Resource API**: Use new `resource()` function for declarative data fetching
- **Material 3 Design**: Follow Material 3 design system principles
- **View Transitions API**: Implement smooth page transitions with new View Transitions

### TypeScript & Language Features
- **Strict Mode**: Enable strict TypeScript configuration for better type safety
- **ECMAScript 2023**: Leverage latest JavaScript features like Array.groupBy(), Promise.withResolvers()
- **Decorators**: Use TypeScript 5.x decorators with proper metadata
- **Generic Types**: Create strongly typed generic components and services
- **Utility Types**: Utilize TypeScript utility types (Partial, Required, Pick, Omit)

### Component Architecture
- **Component Composition**: Break down complex components into smaller, reusable pieces
- **Smart/Dumb Pattern**: Separate container (smart) components from presentational (dumb) components
- **OnPush Strategy**: Use OnPush change detection strategy by default
- **ViewChild/ContentChild**: Use signal-based queries with `viewChild()` and `contentChild()`
- **Component Inheritance**: Use composition over inheritance for component logic
- **Host Directives**: Leverage host directives for cross-cutting concerns

### State Management
- **Signals over RxJS**: Prefer Signals for simple state, RxJS for complex async operations
- **Immutable Updates**: Always create new objects/arrays when updating state
- **Service-Based State**: Use services with Signals for application-wide state
- **Effect Function**: Use `effect()` for side effects triggered by signal changes
- **Computed Signals**: Use `computed()` for derived state calculations
- **Signal Store**: Consider NgRx SignalStore for complex state management

### Dependency Injection
- **inject() Function**: Use functional injection with `inject()` in constructors and functions
- **Provider Functions**: Utilize provider functions for configuration
- **Hierarchical Injectors**: Understand and leverage Angular's injector hierarchy
- **Tree-shakable Providers**: Use `providedIn: 'root'` for singleton services
- **Multi-providers**: Use multi-providers for extensible service collections
- **Injection Tokens**: Create typed injection tokens for configuration

### Routing & Navigation
- **Functional Guards**: Use functional route guards instead of class-based guards
- **Route Data**: Leverage route resolvers and data for component initialization
- **Lazy Loading**: Implement route-based code splitting
- **Router Outlets**: Use named outlets for complex layouts
- **Route Animations**: Implement route transition animations
- **Router Data as Signals**: Use router data with signals for reactive routing

### Forms & Validation
- **Reactive Forms**: Prefer reactive forms over template-driven forms
- **Typed Forms**: Use strongly typed forms with TypeScript
- **Custom Validators**: Create reusable validator functions
- **Form State Management**: Combine forms with Signals for reactive updates
- **Dynamic Forms**: Build dynamic forms with FormArray and FormGroup
- **Form Accessibility**: Implement proper ARIA attributes and keyboard navigation

### HTTP & Data Management
- **Interceptors**: Use functional HTTP interceptors for request/response handling
- **Error Handling**: Implement global error handling strategies
- **Caching**: Use HTTP cache interceptors and service workers
- **Resource API**: Leverage the new resource() function for data fetching
- **Offline Support**: Implement offline-first strategies with service workers
- **Type Safety**: Use strict typing for HTTP requests and responses

### Performance Optimization
- **OnPush Detection**: Use OnPush change detection strategy
- **TrackBy Functions**: Implement trackBy for ngFor loops
- **Lazy Loading**: Split code at route and feature levels
- **Preloading Strategy**: Configure route preloading for better UX
- **Bundle Analysis**: Regularly analyze bundle size and optimize
- **Image Optimization**: Use NgOptimizedImage directive for image loading
- **Defer Loading**: Use `@defer` blocks for lazy loading template parts

### Testing Standards
- **Unit Testing**: Achieve 80%+ code coverage with Jest/Jasmine
- **Component Testing**: Test component behavior, not implementation details
- **Service Testing**: Mock dependencies and test business logic
- **E2E Testing**: Use Cypress or Playwright for integration tests
- **Test Utilities**: Create reusable test utilities and fixtures
- **Signal Testing**: Test signal-based components and services
- **Accessibility Testing**: Include a11y testing in test suites

### Accessibility (A11y)
- **ARIA Standards**: Implement proper ARIA attributes and roles
- **Keyboard Navigation**: Ensure full keyboard accessibility
- **Screen Reader Support**: Test with screen readers
- **Color Contrast**: Meet WCAG 2.1 AA color contrast requirements
- **Focus Management**: Implement proper focus management
- **CDK A11y**: Leverage Angular CDK accessibility utilities

### Internationalization (i18n)
- **Angular i18n**: Use Angular's built-in i18n package
- **Extract Text**: Use ng extract-i18n for text extraction
- **Locale Configuration**: Properly configure locale data
- **Date/Number Formatting**: Use Angular pipes for locale-specific formatting
- **RTL Support**: Implement right-to-left language support
- **Dynamic Locale**: Support runtime locale switching

### Code Quality & Style
- **ESLint + Prettier**: Enforce consistent code formatting and style
- **Strict TypeScript**: Enable strict mode and type checking
- **Naming Conventions**: Follow Angular style guide naming conventions
- **File Organization**: Use feature-based folder structure
- **Barrel Exports**: Use index.ts files for clean imports
- **Code Documentation**: Use JSDoc for comprehensive documentation
- **Linting Rules**: Configure strict ESLint rules for Angular

### Security Best Practices
- **Sanitization**: Properly sanitize user inputs and dynamic content
- **HTTPS**: Always use HTTPS in production
- **CSP Headers**: Implement Content Security Policy headers
- **Authentication**: Use secure authentication patterns (JWT, OAuth)
- **Environment Variables**: Never commit sensitive data to version control
- **OWASP Guidelines**: Follow OWASP security recommendations
- **Trusted Types**: Implement Trusted Types for XSS prevention

### Build & Deployment
- **Production Builds**: Use `ng build --configuration=production` for optimized builds
- **Environment Configuration**: Properly configure environment files
- **Source Maps**: Generate source maps for debugging
- **Compression**: Enable gzip/brotli compression
- **CDN Integration**: Use CDN for static assets
- **Service Workers**: Implement PWA features with Angular Service Worker
- **Docker**: Containerize applications for consistent deployment

### Development Workflow
- **Git Flow**: Use feature branches and pull requests
- **Commit Messages**: Follow conventional commit message format
- **Code Reviews**: Require code reviews for all changes
- **CI/CD**: Implement automated testing and deployment pipelines
- **Documentation**: Maintain comprehensive README and API docs
- **Husky Hooks**: Use pre-commit hooks for code quality
- **Semantic Versioning**: Follow semantic versioning for releases

### Project Structure
```
src/
├── app/
│   ├── core/                 # Singleton services, guards, interceptors
│   ├── shared/              # Shared components, pipes, directives
│   ├── features/            # Feature modules
│   │   └── feature-name/
│   │       ├── components/
│   │       ├── services/
│   │       ├── models/
│   │       └── pages/
│   ├── layout/              # Layout components
│   └── utils/               # Utility functions
├── assets/                  # Static assets
├── environments/            # Environment configurations
└── styles/                  # Global styles
```

### Common Code Patterns

#### Standalone Component Example
```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div>Loading...</div>
    } @else {
      @for (item of items(); track item.id) {
        <div>{{ item.name }}</div>
      }
    }
  `
})
export class FeatureComponent {
  private readonly apiService = inject(ApiService);
  
  readonly loading = signal(false);
  readonly items = signal<Item[]>([]);
  
  readonly filteredItems = computed(() => 
    this.items().filter(item => item.active)
  );
}
```

#### Service with Signals
```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly http = inject(HttpClient);
  
  private readonly _data = signal<Data[]>([]);
  readonly data = this._data.asReadonly();
  
  loadData() {
    return this.http.get<Data[]>('/api/data').pipe(
      tap(data => this._data.set(data))
    );
  }
}
```

#### Functional Guard
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  return router.parseUrl('/login');
};
```

