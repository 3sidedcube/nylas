import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TEMPLATE_OPTIONS } from './constants';
import {
    TemplateOptions,
    TemplateAsyncOptions,
    TemplateOptionsFactory,
} from './interfaces';
import { createTemplateProviders } from './template.providers';

@Global()
@Module({
    providers: [TemplateService],
    exports: [TemplateService],
})
export class TemplateModule {
    /**
     * Registers a configured Template Module for import into the current module
     */
    public static register(options: TemplateOptions): DynamicModule {
        return {
            module: TemplateModule,
            providers: createTemplateProviders(options),
        };
    }

    /**
     * Registers a configured Template Module for import into the current module
     * using dynamic options (factory, etc)
     */
    public static registerAsync(options: TemplateAsyncOptions): DynamicModule {
        return {
            module: TemplateModule,
            providers: [...this.createProviders(options)],
        };
    }

    private static createProviders(options: TemplateAsyncOptions): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createOptionsProvider(options)];
        }

        return [
            this.createOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }

    private static createOptionsProvider(
        options: TemplateAsyncOptions,
    ): Provider {
        if (options.useFactory) {
            return {
                provide: TEMPLATE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }

        // For useExisting...
        return {
            provide: TEMPLATE_OPTIONS,
            useFactory: async (optionsFactory: TemplateOptionsFactory) =>
                await optionsFactory.createTemplateOptions(),
            inject: [options.useExisting || options.useClass],
        };
    }
}
