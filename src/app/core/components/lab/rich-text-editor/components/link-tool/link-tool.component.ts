import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkToolConfig } from '../../models/editor-config.model';

export interface LinkState {
  showLinkPanel: boolean;
  linkInputValue: string;
  editingLinkNode: HTMLAnchorElement | null;
  hoveredLinkNode: HTMLAnchorElement | null;
}

@Component({
  selector: 'app-link-tool',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="link-tool-container">
      <button
        type="button"
        (click)="onAddLink()"
        [attr.aria-label]="config().linkAriaLabel"
        class="toolbar-button"
      >
        {{ config().linkButtonText }}
      </button>

      <!-- Link Management Panel -->
      <div class="link-panel">
        @if (linkState().showLinkPanel) {
          <div class="link-input-section">
            <label for="link-input-box" class="panel-label">Insert link</label>
            <input
              id="link-input-box"
              type="url"
              [placeholder]="config().linkPlaceholder"
              class="link-input"
              [value]="linkState().linkInputValue"
              (input)="onLinkInputChange($any($event.target).value)"
              (keydown)="onLinkInputKeydown($event)"
              autocomplete="off"
            />
            <div class="panel-actions">
              <button type="button" (click)="onApplyLink()" class="btn-primary">Apply</button>
              <button type="button" (click)="onCancelLink()" class="btn-secondary">Cancel</button>
            </div>
          </div>
        }

        @if (linkState().hoveredLinkNode && !linkState().showLinkPanel) {
          <div class="link-actions-section">
            <span class="panel-label">Current link:</span>
            <a
              [href]="linkState().hoveredLinkNode?.href"
              target="_blank"
              rel="noopener noreferrer"
              class="link-preview"
              (click)="onGoToLink($event)"
            >{{ linkState().hoveredLinkNode?.href }}</a>

            <div class="actions">
              <button type="button" (click)="onEditLink()" class="action-change">Change</button>
              <button type="button" (click)="onRemoveLink()" class="action-remove">Remove</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./link-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkToolComponent {
  // Inputs
  readonly config = input.required<LinkToolConfig>();
  readonly linkState = input.required<LinkState>();
  readonly isEnabled = input<boolean>(true);

  // Outputs
  readonly addLink = output<void>();
  readonly applyLink = output<string>();
  readonly cancelLink = output<void>();
  readonly editLink = output<HTMLAnchorElement>();
  readonly goToLink = output<HTMLAnchorElement>();
  readonly removeLink = output<HTMLAnchorElement>();
  readonly linkInputChange = output<string>();

  // Computed properties
  readonly shouldShowPanel = computed(() =>
    this.isEnabled() && (this.linkState().showLinkPanel || this.linkState().hoveredLinkNode)
  );

  onAddLink(): void {
    if (!this.isEnabled()) return;
    this.addLink.emit();
  }

  onApplyLink(): void {
    const url = this.linkState().linkInputValue.trim();
    if (url) {
      this.applyLink.emit(url);
    } else {
      this.onCancelLink();
    }
  }

  onCancelLink(): void {
    this.cancelLink.emit();
  }

  onEditLink(): void {
    const link = this.linkState().hoveredLinkNode;
    if (link) {
      this.editLink.emit(link);
    }
  }

  onGoToLink(event: Event): void {
    event.preventDefault();
    const link = this.linkState().hoveredLinkNode;
    if (link) {
      this.goToLink.emit(link);
    }
  }

  onRemoveLink(): void {
    const link = this.linkState().hoveredLinkNode;
    if (link) {
      this.removeLink.emit(link);
    }
  }

  onLinkInputChange(value: string): void {
    this.linkInputChange.emit(value);
  }

  onLinkInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onApplyLink();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancelLink();
    }
  }
}
