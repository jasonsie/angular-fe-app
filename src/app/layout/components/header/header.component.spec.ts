import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header.component';
import { Header } from '../../../core/models/layout.model';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const mockHeaders: Header[] = [
    {
      title: 'Home',
      route: '/',
      active: 'home',
      icon: 'home',
    },
    {
      title: 'About',
      route: '/about',
      active: 'about',
      icon: 'info',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display navigation items', () => {
    fixture.componentRef.setInput('headers', mockHeaders);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button[mat-button]');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toContain('Home');
    expect(buttons[1].textContent.trim()).toContain('About');
  });

  it('should display icons when provided', () => {
    fixture.componentRef.setInput('headers', mockHeaders);
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll('mat-icon');
    expect(icons.length).toBeGreaterThanOrEqual(2); // At least 2 for nav items
  });

  it('should show GitHub button by default', () => {
    fixture.detectChanges();

    const gitHubButton = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(gitHubButton).toBeTruthy();
  });

  it('should hide GitHub button when showGitHubButton is false', () => {
    fixture.componentRef.setInput('showGitHubButton', false);
    fixture.detectChanges();

    const gitHubButton = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(gitHubButton).toBeFalsy();
  });

  it('should set correct router link active options for home route', () => {
    const options = component.getRouterLinkActiveOptions('/');
    expect(options.exact).toBe(true);
  });

  it('should set correct router link active options for non-home routes', () => {
    const options = component.getRouterLinkActiveOptions('/about');
    expect(options.exact).toBe(false);
  });

  it('should track items by route', () => {
    const header = mockHeaders[0];
    const trackResult = component.trackByRoute(0, header);
    expect(trackResult).toBe(header.route);
  });

  it('should open GitHub URL when GitHub button is clicked', () => {
    const windowOpenSpy = spyOn(window, 'open').and.stub();
    fixture.componentRef.setInput('gitHubUrl', 'https://github.com/test/repo');
    fixture.detectChanges();

    component.onGitHubClick();

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://github.com/test/repo',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should apply correct toolbar color', () => {
    fixture.componentRef.setInput('toolbarColor', 'accent');
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector('mat-toolbar');
    expect(toolbar.getAttribute('ng-reflect-color')).toBe('accent');
  });

  it('should have proper accessibility attributes', () => {
    fixture.componentRef.setInput('headers', mockHeaders);
    fixture.detectChanges();

    const navButtons = fixture.nativeElement.querySelectorAll('button[mat-button]');
    navButtons.forEach((button: HTMLElement) => {
      expect(button.getAttribute('aria-label')).toContain('Navigate to');
    });

    const gitHubButton = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(gitHubButton.getAttribute('aria-label')).toContain('GitHub Repository');
  });
});
