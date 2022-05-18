import { INylasUser } from '.';
import { CipherServiceMissingException } from './exceptions/cipher-service-missing.exception';
import { NoTokenException } from './exceptions/no-token.exception';
import { NotConnectedException } from './exceptions/not-connected.exception';
import { ICipherService } from './interfaces/cipher-service.interface';

export class Connection {
    private static _cipherService?: ICipherService;

    constructor(public readonly accessToken: string, public readonly accountId: string) {}

    static get cipherService() {
        if (!this._cipherService) throw new CipherServiceMissingException();
        return this._cipherService;
    }

    static set cipherService(service: ICipherService) {
        this._cipherService = service;
    }

    static fromUser(user: INylasUser) {
        if (!user.communicationToken) throw new NoTokenException();
        if (!user.nylasAccountId) throw new NotConnectedException();
        const accessToken = Connection.cipherService.decrypt(user.communicationToken);
        return new Connection(accessToken, user.nylasAccountId);
    }

    toUser(): INylasUser {
        const communicationToken = Connection.cipherService.encrypt(this.accessToken);
        return {
            communicationToken,
            nylasAccountId: this.accountId,
        };
    }
}
