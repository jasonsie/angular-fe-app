import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkToolComponent, LinkState } from '../link-tool/link-tool.component';
import { DebugToolComponent } from '../debug-tool/debug-tool.component';
import { BulletPointToolComponent, BulletPointState } from '../bullet-point-tool/bullet-point-tool.component';
import { EditorToolbarConfig, LinkToolConfig, BulletListConfig } from '../../models/editor-config.model';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [CommonModule, LinkToolComponent, DebugToolComponent, BulletPointToolComponent],
  template: `
    <div class="editor-toolbar">
      @if (toolbarConfig().enableLinkTool) {
        <app-link-tool
          [config]="linkToolConfig()"
          [linkState]="linkState()"
          [isEnabled]="!!toolbarConfig().enableLinkTool"
          (addLink)="onAddLink()"
          (applyLink)="onApplyLink($event)"
          (cancelLink)="onCancelLink()"
          (editLink)="onEditLink($event)"
          (goToLink)="onGoToLink($event)"
          (removeLink)="onRemoveLink($event)"
          (linkInputChange)="onLinkInputChange($event)"
        />
      }

      @if (toolbarConfig().enableBulletListTool) {
        <app-bullet-point-tool
          [config]="bulletListConfig()"
          [state]="bulletPointState()"
          [isEnabled]="!!toolbarConfig().enableBulletListTool"
          [showListInfo]="true"
          (toggleBulletList)="onToggleBulletList()"
          (createNewList)="onCreateNewList()"
          (fixListStructure)="onFixListStructure()"
        />
      }

      <!-- Future toolbar features can be added here -->
      <!--
      @if (toolbarConfig().enableBoldTool) {
        <app-bold-tool [isEnabled]="toolbarConfig().enableBoldTool" />
      }
      @if (toolbarConfig().enableItalicTool) {
        <app-italic-tool [isEnabled]="toolbarConfig().enableItalicTool" />
      }
      -->
    </div>

    @if (toolbarConfig().enableDebugTool) {
      <app-debug-tool
        [isEnabled]="!!toolbarConfig().enableDebugTool"
        [htmlContent]="debugHtmlContent()"
        (printHtml)="onPrintHtml()"
      />
    }
  `,
  styleUrls: ['./editor-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorToolbarComponent {
  // Inputs
  readonly toolbarConfig = input.required<EditorToolbarConfig>();
  readonly linkToolConfig = input.required<LinkToolConfig>();
  readonly linkState = input.required<LinkState>();
  readonly bulletListConfig = input.required<BulletListConfig>();
  readonly bulletPointState = input.required<BulletPointState>();
  readonly debugHtmlContent = input<string>('');

  // Outputs - Link tool events
  readonly addLink = output<void>();
  readonly applyLink = output<string>();
  readonly cancelLink = output<void>();
  readonly editLink = output<HTMLAnchorElement>();
  readonly goToLink = output<HTMLAnchorElement>();
  readonly removeLink = output<HTMLAnchorElement>();
  readonly linkInputChange = output<string>();

  // Outputs - Bullet point tool events
  readonly toggleBulletList = output<void>();
  readonly createNewList = output<void>();
  readonly fixListStructure = output<void>();

  // Outputs - Debug tool events
  readonly printHtml = output<void>();

  // Link tool event handlers
  onAddLink(): void {
    this.addLink.emit();
  }

  onApplyLink(url: string): void {
    this.applyLink.emit(url);
  }

  onCancelLink(): void {
    this.cancelLink.emit();
  }

  onEditLink(link: HTMLAnchorElement): void {
    this.editLink.emit(link);
  }

  onGoToLink(link: HTMLAnchorElement): void {
    this.goToLink.emit(link);
  }

  onRemoveLink(link: HTMLAnchorElement): void {
    this.removeLink.emit(link);
  }

  onLinkInputChange(value: string): void {
    this.linkInputChange.emit(value);
  }

  // Bullet point tool event handlers
  onToggleBulletList(): void {
    this.toggleBulletList.emit();
  }

  onCreateNewList(): void {
    this.createNewList.emit();
  }

  onFixListStructure(): void {
    this.fixListStructure.emit();
  }

  // Debug tool event handlers
  onPrintHtml(): void {
    this.printHtml.emit();
  }
}
