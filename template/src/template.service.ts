// tslint:disable: variable-name
import { Injectable, Inject, Logger } from '@nestjs/common';
import { TEMPLATE_OPTIONS } from './constants';
import { TemplateOptions } from './interfaces';

/**
 * Sample interface for TemplateService
 *
 * Customize this as needed to describe the TemplateService
 *
 */
interface ITemplateService {
    test(): Promise<any>
}

@Injectable()
/**
 *  You can remove the dependencies on the Logger if you don't need it.  You can also
 *  remove the `async test()` method.
 *
 *  The only thing you need to leave intact is the `@Inject(TEMPLATE_OPTIONS) private _templateOptions`.
 *
 *  That injected dependency gives you access to the options passed in to
 *  TemplateService.
 *
 */
export class TemplateService implements ITemplateService {
    private readonly logger: Logger
    constructor(
        @Inject(TEMPLATE_OPTIONS) private _TemplateOptions: TemplateOptions,
    ) {
        this.logger = new Logger('TemplateService');
        this.logger.log(`Options: ${JSON.stringify(this._TemplateOptions)}`);
    }

    async test(): Promise<any> {
        return 'Hello from TemplateModule!';
    }
}
