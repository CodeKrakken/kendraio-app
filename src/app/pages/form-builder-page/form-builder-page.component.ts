import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormlyFieldConfig, FormlyFormOptions} from '@ngx-formly/core';
import {KendraioFormService} from '../../_shared/ui-form/services/kendraio.form.service';
import {FormSubmitHandlerService} from '../../services/form-submit-handler.service';
import {ShareLinkGeneratorService} from '../../services/share-link-generator.service';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import JSONFormatter from 'json-formatter-js'

@Component({
  selector: 'app-form-builder-page',
  templateUrl: './form-builder-page.component.html',
  styleUrls: ['./form-builder-page.component.scss']
})
export class FormBuilderPageComponent implements OnInit, OnDestroy {

  editorOptions = {
    theme: 'vs-dark',
    language: 'json',
    minimap: {
      enabled: false
    },
    lineNumbers: 'off'
  };

  JSONSchema = '{}';
  UISchema = '{}';
  modelText = '{}';

  form = new FormGroup({});
  fields: FormlyFieldConfig[];
  options: FormlyFormOptions = {};
  model = {};

  _destroy$ = new Subject();
  _schemaChange$ = new Subject();

  @ViewChild('modelOutput', { static: false }) modelOutput: ElementRef;

  constructor(
    private formService: KendraioFormService,
    private formSubmitHandler: FormSubmitHandlerService,
    private shareLinks: ShareLinkGeneratorService
  ) { }

  ngOnInit() {
    this._schemaChange$.pipe(
      takeUntil(this._destroy$),
      debounceTime(1000)
    ).subscribe(() => {
      try {
        this.fields = this.formService.schemasToFieldConfig(JSON.parse(this.JSONSchema), JSON.parse(this.UISchema));
      } catch (e) {
        // TODO: error handling
      }
    });

    const urlData = this.shareLinks.getData();
    if (urlData) {
      this.JSONSchema = JSON.stringify(urlData['JSONSchema'], null, 4);
      this.UISchema = JSON.stringify(urlData['UISchema'], null, 4);
    }
    this.jsonSchemaChange();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  jsonSchemaChange() {
    this._schemaChange$.next();
  }

  shareForm() {
    const JSONSchema = JSON.parse(this.JSONSchema);
    const UISchema = JSON.parse(this.UISchema);
    this.shareLinks.shareLink('form-builder', { JSONSchema, UISchema });
  }

  onChange() {
    // Replace #modelOutput DIV contents with formatted JSON
    const formatter = new JSONFormatter(this.model, 1, { theme: 'dark' });
    while (this.modelOutput.nativeElement.firstChild) {
      this.modelOutput.nativeElement.removeChild(this.modelOutput.nativeElement.firstChild);
    }
    this.modelOutput.nativeElement.append(formatter.render());
  }

  onSubmit() {
    // Send form submit event to the form handler service
    this.formSubmitHandler.handle({
      form: `formBuilderForm`,
      action: 'submit',
      payload: this.form.getRawValue()
    });
  }
}
