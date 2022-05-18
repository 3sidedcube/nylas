import { TemplateOptions } from './interfaces';
import { TEMPLATE_OPTIONS } from './constants';
import { Provider } from '@nestjs/common';

export function createTemplateProviders(options: TemplateOptions): Provider[] {
    return [
        {
            provide: TEMPLATE_OPTIONS,
            useValue: options,
        },
    ];
}
