export class NotConnectedException extends Error {
    constructor() {
        super('That user does not have a Nylas account. Ensure the user has a Nylas Account ID.');
    }
}
