import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header.component';
import { Header } from '../../../core/models/layout.model';
import { Headers } from '../../../core/config/header.config';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header items with correct values', () => {
    fixture.componentRef.setInput('headers', Headers);
    fixture.detectChanges();

    const headerButtons = fixture.nativeElement.querySelectorAll('button[mat-button]');
    
    expect(headerButtons.length).toBe(Headers.length);
    
    headerButtons.forEach((button: HTMLElement, index: number) => {
      const expectedHeader = Headers[index];
      
      // Check if title is rendered in button text
      expect(button.textContent?.trim()).toContain(expectedHeader.title);
      
      // Check if routerLink is set correctly
      expect(button.getAttribute('ng-reflect-router-link')).toBe(expectedHeader.route);
      
      // Check if aria-label is set correctly
      expect(button.getAttribute('aria-label')).toBe(`Navigate to ${expectedHeader.title}`);
      
      // Check if icon is rendered when header has icon
      if (expectedHeader.icon) {
        const iconElement = button.querySelector('mat-icon');
        expect(iconElement).toBeTruthy();
        expect(iconElement?.textContent?.trim()).toBe(expectedHeader.icon);
        expect(iconElement?.getAttribute('aria-hidden')).toBe('true');
      }
    });
  });
});
