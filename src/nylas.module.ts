import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { NylasService } from './nylas.service';
import { NYLAS_OPTIONS } from './constants';
import { NylasOptions, NylasAsyncOptions, NylasOptionsFactory } from './interfaces';
import { createNylasProviders } from './nylas.providers';
import { CipherService } from './cipher.service';

@Global()
@Module({
    providers: [NylasService, CipherService],
    exports: [NylasService],
})
export class NylasModule {
    /**
     * Registers a configured Nylas Module for import into the current module
     */
    public static register(options: NylasOptions): DynamicModule {
        return {
            global: options.isGlobal ?? true,
            module: NylasModule,
            providers: createNylasProviders(options),
        };
    }

    /**
     * Registers a configured Nylas Module for import into the current module
     * using dynamic options (factory, etc)
     */
    public static registerAsync(options: NylasAsyncOptions): DynamicModule {
        return {
            global: options.isGlobal ?? true,
            module: NylasModule,
            providers: [...this.createProviders(options)],
        };
    }

    private static createProviders(options: NylasAsyncOptions): Provider[] {
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

    private static createOptionsProvider(options: NylasAsyncOptions): Provider {
        if (options.useFactory) {
            return {
                provide: NYLAS_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }

        // For useExisting...
        return {
            provide: NYLAS_OPTIONS,
            useFactory: async (optionsFactory: NylasOptionsFactory) => await optionsFactory.createNylasOptions(),
            inject: [options.useExisting || options.useClass],
        };
    }
}
