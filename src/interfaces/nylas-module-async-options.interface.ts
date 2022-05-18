/* Dependencies */
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

/* Interfaces */
import { NylasOptions } from './nylas-options.interface';
import { NylasOptionsFactory } from './nylas-options-factory.interface';

export interface NylasAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: any[];
    isGlobal?: boolean;
    useExisting?: Type<NylasOptionsFactory>;
    useClass?: Type<NylasOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<NylasOptions> | NylasOptions;
}
