export class NoTokenException extends Error {
    constructor() {
        super('A communication token must be provided');
    }
}
