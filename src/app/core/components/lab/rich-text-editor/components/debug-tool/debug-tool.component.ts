import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debug-tool',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isEnabled()) {
      <button
        type="button"
        (click)="onPrintHtml()"
        class="debug-button"
        aria-label="Print HTML for debugging"
      >
        Print HTML
      </button>

      @if (htmlContent()) {
        <div class="debug-output">
          <strong>HTML Output:</strong>
          <pre>{{ htmlContent() }}</pre>
        </div>
      }
    }
  `,
  styleUrls: ['./debug-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebugToolComponent {
  // Inputs
  readonly isEnabled = input<boolean>(false);
  readonly htmlContent = input<string>('');

  // Outputs
  readonly printHtml = output<void>();

  onPrintHtml(): void {
    if (this.isEnabled()) {
      this.printHtml.emit();
    }
  }
}
