import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import type { EditorConfig } from './rich-text-editor/models/editor-config.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatDivider } from '@angular/material/divider';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatAccordion,
} from '@angular/material/expansion';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

interface DemoSection {
  title: string;
  description: string;
  icon: string;
  expanded: boolean;
}

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.scss'],
  host: {
    class: 'main-content lab-page',
  },
})
export class LabComponent implements OnInit {
  // Development configuration (with debug enabled)
  readonly editorConfig: EditorConfig = {
    toolbar: {
      enableLinkTool: true,
      enableDebugTool: true,
      enableBoldTool: true,
      enableItalicTool: true,
      enableUnderlineTool: true,
      enableBulletListTool: true,
      enableNumberedListTool: true,
    },
    linkTool: {
      linkPlaceholder: 'Enter your URL here...',
      linkAriaLabel: 'Insert hyperlink',
      linkButtonText: '🔗 Insert Link',
    },
    initialContent: '<ul class="list-disc"><li>This editor has all features enabled including debug mode...</li></ul>',
    editorAriaLabel: 'Development Rich Text Editor',
  };

  constructor() {}

  ngOnInit() {
    // Initialization logic can go here
  }
}
