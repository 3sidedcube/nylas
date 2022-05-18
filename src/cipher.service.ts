import crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { NYLAS_OPTIONS } from './constants';
import { NylasOptions } from './interfaces';
import { ICipherService } from './interfaces/cipher-service.interface';

/**
 * Basic encryption/decryption helper service
 * @description This is not intended to be cryptographically secure,
 * the encrypted value should be treated with caution and stored in an encrypted
 * data store. Do not rely on this implementation for security, it is more a means of
 * obfuscation.
 */
@Injectable()
export class CipherService implements ICipherService {
    private key: Buffer;

    private algorithm = 'aes-192-ctr';

    constructor(@Inject(NYLAS_OPTIONS) _NylasOptions: NylasOptions) {
        this.key = crypto.scryptSync(_NylasOptions.encryption.key, 'salt', 24);
    }

    encrypt(value: string) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        const encrypted = cipher.update(value, 'utf-8', 'hex');

        return [encrypted + cipher.final('hex'), Buffer.from(iv).toString('hex')].join('|');
    }

    decrypt(encryptedValue: string) {
        const [encrypted, iv] = encryptedValue.split('|');
        if (!iv) throw new Error('IV not found');
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));
        return decipher.update(encrypted, 'hex', 'utf-8') + decipher.final('utf-8');
    }
}
