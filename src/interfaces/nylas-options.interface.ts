import { Logger } from 'winston';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NylasOptions {
    /**
     * Register the module globally? Default `true`
     */
    isGlobal?: boolean;

    /**
     * Winston compatible logger.
     * Default will be used if not provided.
     */
    logger?: Logger;

    /**
     * Client ID
     */
    clientId: string;

    /**
     * Secret key for authentication
     */
    clientSecret: string;

    /**
     * Specify an alternative Nylas server to use
     * @example ireland.api.nylas.com
     */
    apiServer?: string;

    /**
     * OAuth options
     */
    authentication: {
        /**
         * Redirect after connection
         */
        redirectURI: string;

        /**
         * Default scopes to pass for all connections
         */
        defaultScopes?: string[];
    };

    /**
     * Encryption options
     */
    encryption: {
        /**
         * Cipher key for access tokens
         */
        key: string;
    };
}
