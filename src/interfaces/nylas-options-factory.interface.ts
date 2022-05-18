import { NylasOptions } from './nylas-options.interface';

export interface NylasOptionsFactory {
    createNylasOptions(): Promise<NylasOptions> | NylasOptions
}
