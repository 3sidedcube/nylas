export class CipherServiceMissingException extends Error {
    constructor() {
        super('A Cipher Service must be provided before operating');
    }
}
