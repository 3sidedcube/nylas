import { InvalidIdException } from './exceptions/invalid-id.exception';
import { InvalidTokenException } from './exceptions/invalid-token.exception';
import { NotFoundException } from './exceptions/not-found.exception';

export function CatchError(name: string): MethodDecorator {
    return function (target, propertyKey, descriptor: TypedPropertyDescriptor<any>) {
        const method = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                return await method.apply(this, args);
            } catch (error: any) {
                switch (error.statusCode) {
                    case 400:
                        throw new InvalidIdException(name);
                    case 401:
                        throw new InvalidTokenException();
                    case 404:
                        throw new NotFoundException(name);
                    default:
                        throw Error(error.message);
                }
            }
        };
    };
}
