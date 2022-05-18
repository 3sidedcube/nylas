/* Dependencies */
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

/* Interfaces */
import { TemplateOptions } from './template-options.interface';
import { TemplateOptionsFactory } from './template-options-factory.interface';

export interface TemplateAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: any[]
    useExisting?: Type<TemplateOptionsFactory>
    useClass?: Type<TemplateOptionsFactory>
    useFactory?: (...args: any[]) => Promise<TemplateOptions> | TemplateOptions
}
