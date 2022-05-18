export class EmptyQueryException extends Error {
    constructor() {
        super('Query string must contain at least one character');
    }
}
