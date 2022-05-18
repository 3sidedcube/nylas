export class InvalidIdException extends Error {
    constructor(title: string) {
        super(`Invalid ${title} ID`);
    }
}
