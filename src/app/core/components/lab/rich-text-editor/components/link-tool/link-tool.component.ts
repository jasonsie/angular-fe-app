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
  templateUrl: './link-tool.component.html',
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

  readonly originalHref = computed(() => {
    const link = this.linkState().hoveredLinkNode;
    if (!link) return '';
    return link.getAttribute('data-original-href') || link.href;
  });

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
