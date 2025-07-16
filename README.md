# My App - Angular Material Demo Application

This application has been refactored to showcase modern Angular development practices and Angular Material UI components.

## Features

### ✨ Modern Angular 19+ Features
- **Standalone Components**: All components use the new standalone approach
- **Control Flow Syntax**: Uses new `@if`, `@for`, `@switch` control flow
- **Signals**: Leverages Angular Signals for reactive state management
- **OnPush Change Detection**: Optimized performance with OnPush strategy
- **Inject Function**: Modern dependency injection using `inject()`
- **Reactive Forms**: Strongly typed forms with validation

### 🎨 Angular Material UI Components

#### Navigation & Layout
- **MatToolbar**: Modern navigation bar with Material Design
- **MatButton & MatIconButton**: Various button styles
- **MatIcon**: Material Design icons throughout the app

#### Forms & Input
- **MatFormField**: Consistent form field styling
- **MatInput**: Text input fields with Material Design
- **MatSelect**: Dropdown selection with Material styling
- **MatCheckbox**: Checkbox controls
- **MatRadioButton**: Radio button groups
- **MatSlider**: Interactive slider controls

#### Data Display
- **MatCard**: Card layout for content organization
- **MatChips**: Interactive chip selection
- **MatProgressBar**: Progress indicators
- **MatDivider**: Visual content separation
- **MatTabs**: Tabbed content organization

#### Feedback & Navigation
- **MatSnackBar**: Toast notifications
- **MatExpansionPanel**: Collapsible content sections

### 🎯 Application Structure

```
src/app/
├── app.component.*          # Main app shell with Material toolbar
├── app.config.ts           # App configuration with animations
├── app.routes.ts           # Route definitions
├── home/                   # Homepage with feature showcase
│   ├── home.component.ts
│   └── home.component.scss
└── lab/                    # Interactive Material components demo
    ├── lab.component.ts
    └── lab.component.scss
```

### 📱 Responsive Design
- Mobile-first design approach
- Responsive grid layouts
- Adaptive navigation
- Touch-friendly interactions

### 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   ng serve
   ```

3. **Build for Production**
   ```bash
   ng build
   ```

### 📖 Pages Overview

#### Home Page
- Hero section with application overview
- Feature cards showcasing capabilities
- Technology stack display using chips
- Call-to-action navigation

#### Lab Page
Interactive demonstration of Material components organized in tabs:

1. **Forms Tab**: Complete form with validation
   - Text inputs with validation
   - Dropdowns and selections
   - Checkboxes and radio buttons
   - Form submission handling

2. **Interactive Tab**: Dynamic components
   - Slider controls with real-time updates
   - Chip selection with state management
   - Progress bars with interactive controls

3. **Expansion Tab**: Collapsible content
   - Expansion panels with rich content
   - Snackbar notifications
   - Content organization examples

### 🎨 Design System

#### Colors (Azure/Blue Theme)
- **Primary**: Material Blue (500)
- **Accent**: Light Blue (A200)
- **Warn**: Material Red
- **Background**: Light grey (#fafafa)

#### Typography
- **Font Family**: Roboto
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium)
- **Material Typography**: Consistent text styling

### 🔄 State Management
- **Signals**: Primary state management approach
- **Computed Values**: Derived state calculations
- **Form State**: Reactive form state handling
- **Component Communication**: Event-driven architecture

### ♿ Accessibility
- **ARIA Labels**: Proper accessibility labels
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Compatible with assistive technologies
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Proper focus handling

## Development

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.3.

### Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

### Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

### Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
