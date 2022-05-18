import { TemplateOptions } from './template-options.interface';

export interface TemplateOptionsFactory {
    createTemplateOptions(): Promise<TemplateOptions> | TemplateOptions
}
