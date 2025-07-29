import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulletListConfig } from '../../models/editor-config.model';

export interface BulletPointState {
  isActive: boolean;
  currentListType: 'ul' | 'ol' | null;
  listItemCount: number;
}

@Component({
  selector: 'app-bullet-point-tool',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bullet-point-tool">
      <button
        type="button"
        class="tool-button"
        [class.active]="state().isActive"
        [disabled]="!isEnabled()"
        (click)="onToggleBulletList()"
        [attr.aria-label]="ariaLabel()"
        [title]="tooltipText()"
      >
        {{ buttonText() }}
      </button>

      @if (showListInfo()) {
        <div class="list-info">
          <span class="list-type">{{ listTypeDisplay() }}</span>
          @if (state().listItemCount > 0) {
            <span class="item-count">{{ state().listItemCount }} items</span>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./bullet-point-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulletPointToolComponent {
  // Inputs
  readonly config = input.required<BulletListConfig>();
  readonly isEnabled = input<boolean>(true);
  readonly state = input.required<BulletPointState>();
  readonly showListInfo = input<boolean>(false);

  // Outputs
  readonly toggleBulletList = output<void>();
  readonly createNewList = output<void>();
  readonly fixListStructure = output<void>();

  // Computed properties
  readonly buttonText = computed(() => {
    const config = this.config();
    const state = this.state();

    if (config.listTag === 'ol') {
      return state.isActive ? '📝 List' : '📝 Number';
    }
    return state.isActive ? '• List' : '• Bullet';
  });

  readonly ariaLabel = computed(() => {
    const config = this.config();
    const state = this.state();

    const listType = config.listTag === 'ol' ? 'numbered' : 'bullet';
    const action = state.isActive ? 'Remove' : 'Create';

    return `${action} ${listType} list`;
  });

  readonly tooltipText = computed(() => {
    const config = this.config();
    const state = this.state();

    if (state.isActive) {
      return `Remove ${config.listTag === 'ol' ? 'numbered' : 'bullet'} list formatting`;
    }

    return `Convert to ${config.listTag === 'ol' ? 'numbered' : 'bullet'} list`;
  });

  readonly listTypeDisplay = computed(() => {
    const config = this.config();
    const state = this.state();

    if (!state.isActive || !state.currentListType) {
      return '';
    }

    return state.currentListType === 'ol' ? 'Numbered List' : 'Bullet List';
  });

  /**
   * Handles the toggle bullet list action
   */
  onToggleBulletList(): void {
    if (!this.isEnabled()) return;

    this.toggleBulletList.emit();
  }

  /**
   * Creates a new bullet list
   */
  onCreateNewList(): void {
    if (!this.isEnabled()) return;

    this.createNewList.emit();
  }

  /**
   * Fixes the current list structure
   */
  onFixListStructure(): void {
    if (!this.isEnabled()) return;

    this.fixListStructure.emit();
  }
}
