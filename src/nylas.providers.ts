import { NylasOptions } from './interfaces';
import { NYLAS_OPTIONS } from './constants';
import { Provider } from '@nestjs/common';

export function createNylasProviders(options: NylasOptions): Provider[] {
    return [
        {
            provide: NYLAS_OPTIONS,
            useValue: options,
        },
    ];
}
