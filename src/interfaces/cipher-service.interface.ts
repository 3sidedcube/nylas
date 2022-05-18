export interface ICipherService {
    encrypt(value: string): string;
    decrypt(encryptedValue: string): string;
}
