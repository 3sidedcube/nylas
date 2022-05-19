/* eslint-disable no-useless-return */
// tslint:disable: variable-name
import { Injectable, Inject, Scope } from '@nestjs/common';
import Nylas from 'nylas';
import Draft from 'nylas/lib/models/draft';
import EmailParticipant from 'nylas/lib/models/email-participant';
import File from 'nylas/lib/models/file';
import Message from 'nylas/lib/models/message';
import Thread from 'nylas/lib/models/thread';
import { CipherService } from './cipher.service';
import { Connection } from './Connection';
import { NYLAS_OPTIONS } from './constants';
import { INylasService, NylasOptions } from './interfaces';
import { IMessageParameters, SendMessageInput, UpdateMessageInput } from './interfaces/message.interface';
import { INylasUser } from './interfaces/nylas-user.interface';
import { IThreadParameters } from './interfaces/thread.interface';
import * as crypto from 'crypto';
import { EmptyQueryException } from './exceptions/empty-query.exception';
import { DraftFilter, DraftInput, DraftPagination } from './interfaces/draft.interface';
import { Logger } from 'winston';
import { IFileProperties } from './interfaces/file.interface';
import { Label } from 'nylas/lib/models/folder';
import { CatchError } from './catch-errors';
import { NotFoundException } from './exceptions/not-found.exception';

@Injectable({
    scope: Scope.DEFAULT,
})
export class NylasService implements INylasService {
    private logger?: Logger;
    constructor(@Inject(NYLAS_OPTIONS) private _NylasOptions: NylasOptions, cipherService: CipherService) {
        Nylas.config({
            ..._NylasOptions,
        });
        Connection.cipherService = cipherService;
        this.logger = _NylasOptions.logger;
    }

    /**
     * Generate an OAuth set up URL
     * @param scopes Connection scopes. Overrides `defaultScopes`
     * @param email Email to authenticate for to skip Nylas hosted page for input
     * @returns URL to direct user to
     */
    async connect(scopes?: string[], email?: string): Promise<string> {
        return Nylas.urlForAuthentication({
            redirectURI: this._NylasOptions.authentication.redirectURI,
            scopes: scopes ?? this._NylasOptions.authentication.defaultScopes,
            ...(email ? { loginHint: email } : {}),
        });
    }

    /**
     * Disconnects a nylas account
     * @param nylasAccountId ID of nylas account to disconnect
     */
    async disconnect(nylasAccountId?: string): Promise<any> {
        return Nylas.accounts.delete(nylasAccountId);
    }

    /**
     * Verifies incoming nylas webhooks via it's signature
     * @param rawBody The raw body to generate the signature from
     * @param signature The signature provided via the webhook's request header
     * @returns Boolean if verification was successful and signature is valid
     */
    verifyWebhook(rawBody: string, signature: string): boolean {
        const digest = crypto.createHmac('sha256', this._NylasOptions.clientSecret).update(rawBody).digest('hex');
        return digest === signature;
    }

    /**
     * Exchange a connection code for an access token
     * @description Save returned access token to persistent storage
     * @param code OAuth connection code
     * @returns Nylas user
     */
    async exchange(code: string): Promise<INylasUser> {
        const token = await Nylas.exchangeCodeForToken(code);
        const connection = new Connection(token.accessToken, token.accountId);
        return connection.toUser();
    }

    /**
     * Find Message by its ID
     * @param user Nylas User
     * @param id Message Id
     * @returns Message
     */
    @CatchError('Message')
    async findMessageByID(user: INylasUser, id: string): Promise<Message> {
        const connection = Connection.fromUser(user);
        return Nylas.with(connection.accessToken).messages.find(id);
    }

    /**
     * Find Messages by its IDs
     * @param user Nylas User
     * @param id Message Id
     * @returns Messages
     */
    @CatchError('Message')
    async findMessagesByIDs(user: INylasUser, ids: string[]): Promise<Message[]> {
        const connection = Connection.fromUser(user);
        if (ids.length > 0) {
            const messages = await Promise.all(
                ids.map(async (id) => {
                    return Nylas.with(connection.accessToken).messages.find(id);
                }),
            );
            return messages;
        }
        return Nylas.with(connection.accessToken).messages.list();
    }

    /**
     * Search Messages
     * @param user Nylas Account
     * @param query Query
     * @param options Message Parameters
     * @returns Messages
     */
    async searchMessages(user: INylasUser, query: string, options?: IMessageParameters): Promise<Message[]> {
        if (!query) {
            throw new EmptyQueryException();
        }
        const connection = Connection.fromUser(user);
        return Nylas.with(connection.accessToken).messages.search(query, { ...options });
    }

    /**
     * Find a nylas account via it's ID
     * @param accountId ID of nylas account to find
     * @returns Account if found
     */
    async findAccountByID(accountId: string): Promise<any> {
        return Nylas.accounts.find(accountId);
    }

    /**
     * Find a thread by its ID
     * @param user Connected account
     * @param id Thread ID
     * @param expanded If Thread view is to be expanded
     * @returns Thread if found
     */
    @CatchError('Threads')
    async findThreadByID(user: INylasUser, id: string, expanded?: boolean): Promise<Thread> {
        const connection = Connection.fromUser(user);
        return Nylas.with(connection.accessToken).threads.find(id, expanded ? { view: 'expanded' } : {});
    }

    /**
     * Find list of Threads by IDs
     * @param user Connected account
     * @param ids Message IDs
     * @param expanded If Thread view is to be expanded
     * @returns Thread if found
     */
    @CatchError('Threads')
    async findThreadsByIDs(user: INylasUser, ids: string[], expanded?: boolean): Promise<Thread[]> {
        const connection = Connection.fromUser(user);
        if (ids.length > 0) {
            return Nylas.with(connection.accessToken).threads.list({
                in: ids,
                view: expanded ? 'expanded' : undefined,
            });
            // const threads = await Promise.all(
            //     ids.map(async (id) => {
            //         return Nylas.with(connection.accessToken).threads.find(id, expanded ? { view: 'expanded' } : {});
            //     }),
            // );
            // return threads;
        }
        return Nylas.with(connection.accessToken).threads.list();
    }

    /**
     * Search Threads
     * @param user Connected account
     * @param query Query to search Threads
     * @param options Query options
     * @returns List of Threads found
     */
    @CatchError('Threads')
    async searchThreads(user: INylasUser, query: string, options?: IThreadParameters): Promise<Thread[]> {
        const connection = Connection.fromUser(user);
        return Nylas.with(connection.accessToken).threads.search(query, { ...options });
    }

    /**
     * Sends Message to Email Account
     * @param user Connected account
     * @param input Message properties
     * @returns Message
     */
    @CatchError('Message')
    async send(user: INylasUser, input: SendMessageInput): Promise<Message> {
        const connection = Connection.fromUser(user);

        const to = input.to.map((participant) => new EmailParticipant({ ...participant }));
        let from = [];
        let bcc = [];
        let cc = [];
        const files = [];

        if (input.from) {
            from = input.from.map((participant) => new EmailParticipant({ ...participant }));
        }
        if (input.bcc) {
            bcc = input.bcc.map((participant) => new EmailParticipant({ ...participant }));
        }
        if (input.cc) {
            cc = input.to.map((participant) => new EmailParticipant({ ...participant }));
        }

        if (input.fileIds) {
            await Promise.all(
                input.fileIds.map(async (id) => {
                    const e = await Nylas.with(connection.accessToken).files.find(id);
                    files.push(e);
                }),
            );
        }

        const draft = new Draft(Nylas.with(connection.accessToken), {
            subject: input.subject,
            body: input.body,
            to,
            from,
            bcc,
            cc,
            files,
            date: new Date(),
        });

        return await draft.send();
    }

    /**
     * Uploads File
     * @param user  Connected account
     * @param file File Properties
     * @returns new File
     */
    @CatchError('File')
    async fileUpload(user: INylasUser, properties: IFileProperties): Promise<File> {
        const connection = Connection.fromUser(user);
        const file = new File(Nylas.with(connection.accessToken), properties);
        return file.upload();
    }

    /**
     * Download a File by its ID
     * @param user Nylas User
     * @param id File Id
     * @returns File Binary Object
     */
    @CatchError('File')
    async fileDownload(user: INylasUser, id: string): Promise<any> {
        const file = await this.fileById(user, id);
        return file.download();
    }

    /**
     * Find File by its ID
     * @param user Nylas User
     * @param id User Id
     * @returns File
     */
    @CatchError('File')
    async fileById(user: INylasUser, id: string): Promise<File> {
        const connection = Connection.fromUser(user);
        return Nylas.with(connection.accessToken).files.find(id);
    }

    /**
     * Find list of Files by IDs
     * @param user Nylas User
     * @param id User Id
     * @returns List of Files found
     */
    @CatchError('Files')
    async filesByIds(user: INylasUser, ids: string[]): Promise<File[]> {
        const files = await Promise.all(
            ids.map(async (id) => {
                return this.fileById(user, id);
            }),
        );
        return files;
    }

    /**
     * Deletes File by ID
     * @param user  Connected account
     * @param id Id string
     * @returns boolean
     */
    @CatchError('File')
    async fileDelete(user: INylasUser, id: string): Promise<boolean> {
        const connection = Connection.fromUser(user);
        return Nylas.with(connection.accessToken).files.delete(id);
    }

    /**
     * Delete Message by its ID
     * @param user Nylas User
     * @param id Message Id
     * @returns Message
     */
    @CatchError('Message')
    async deleteMessage(user: INylasUser, id: string): Promise<Message> {
        const connection = Connection.fromUser(user);
        const message = await Nylas.with(connection.accessToken).messages.find(id);

        // Each account has 8 default labels such as "inbox", "all", "trash", "archive", "drafts","sent","spam","important"
        const labels: Label[] = await Nylas.with(connection.accessToken).labels.list();
        const trashLabel = labels.find((label) => label.name === 'trash');
        if (!trashLabel) throw new NotFoundException('Label');

        message.labels.push(trashLabel);

        return message.save();
    }

    /**
     * Read Message by its ID
     * Deprecated: please use updateMessage
     * @param user Nylas User
     * @param id Message Id
     * @returns Message
     */
    @CatchError('Message')
    async readMessage(user: INylasUser, id: string): Promise<Message> {
        return this.updateMessage(user, id, { unread: false });
    }

    /**
     * Read Message by its ID
     * @param user Nylas User
     * @param id Message Id
     * @returns Message
     */
    @CatchError('Message')
    async updateMessage(user: INylasUser, id: string, updatedFields: UpdateMessageInput): Promise<Message> {
        const connection = Connection.fromUser(user);
        const message = await Nylas.with(connection.accessToken).messages.find(id);
        const updatedKeys = Object.keys(updatedFields);
        updatedKeys.forEach((key) => {
            const value = updatedFields[key];
            if ((value && message[key]) !== undefined) message[key] = value;
        });
        return message.save();
    }

    /**
     * Create a New Draft
     * @param user Nylas Account
     * @param input Draft Input
     * @returns Draft
     */
    @CatchError('Draft')
    async createDraft(user: INylasUser, input: DraftInput): Promise<Draft> {
        const connection = Connection.fromUser(user);
        const { subject, body, to, from, bcc, cc, files } = await this.draftHelper(input, connection.accessToken);

        const draft = new Draft(Nylas.with(connection.accessToken), {
            subject,
            body,
            to,
            from,
            bcc,
            cc,
            files,
            date: new Date(),
        });

        return draft.save();
    }

    /**
     * Helper method to map all senders/recipients
     * @param input DraftInput
     * @param accessToken string
     * @returns Draft
     */
    async draftHelper(input: DraftInput, accessToken: string) {
        let subject = '';
        let body = '';
        let to = [];
        let from = [];
        let bcc = [];
        let cc = [];
        const files = [];

        if (input.subject) {
            subject = input.subject;
        }

        if (input.body) {
            body = input.body;
        }

        if (input.to) {
            to = input.to.map((participant) => new EmailParticipant({ ...participant }));
        }

        if (input.from) {
            from = input.from.map((participant) => new EmailParticipant({ ...participant }));
        }
        if (input.bcc) {
            bcc = input.bcc.map((participant) => new EmailParticipant({ ...participant }));
        }
        if (input.cc) {
            cc = input.cc.map((participant) => new EmailParticipant({ ...participant }));
        }

        if (input.fileIds) {
            await Promise.all(
                input.fileIds.map(async (id) => {
                    const e = await Nylas.with(accessToken).files.find(id);
                    files.push(e);
                }),
            );
        }

        return { subject, body, to, from, bcc, cc, files };
    }

    /**
     * Updates an existing Draft
     * @param user Nylas Account
     * @param id Draft ID
     * @param input Draft Input
     * @returns Draft
     */
    @CatchError('Draft')
    async updateDraft(user: INylasUser, id: string, input: DraftInput): Promise<Draft> {
        const connection = Connection.fromUser(user);
        const draft = await Nylas.with(connection.accessToken).drafts.find(id);

        const { subject, body, to, from, bcc, cc, files } = await this.draftHelper(input, connection.accessToken);
        if (subject) draft.subject = subject;

        if (body) draft.body = body;

        if (from) {
            draft.from = from;
        }
        if (to) {
            draft.to = to;
        }
        if (bcc) {
            draft.bcc = bcc;
        }
        if (cc) {
            draft.cc = cc;
        }

        if (files) {
            draft.files = files;
        }

        return draft.save();
    }

    /**
     * Deletes a Draft
     * @param user Nylas Account
     * @param id Draft ID
     * @param version Draft version
     * @returns null
     */
    @CatchError('Draft')
    async deleteDraft(user: INylasUser, id: string, version = 0): Promise<Draft> {
        const connection = Connection.fromUser(user);
        return Nylas.with(connection.accessToken).drafts.delete(id, { version });
    }

    /**
     * Find Draft by Id
     * @param user Nylas Account
     * @param id Draft Id
     * @returns Draft
     */
    @CatchError('Draft')
    async findDraftById(user: INylasUser, id: string): Promise<Draft> {
        const connection = Connection.fromUser(user);
        return Nylas.with(connection.accessToken).drafts.find(id);
    }
    /**
     * Returns a list of Drafts
     * @param user Nylas Account
     * @param filter Draft filter parameters
     * @param options Draft pagination options
     * @returns Drafts
     */
    @CatchError('Draft')
    async drafts(user: INylasUser, filter: DraftFilter, options?: DraftPagination): Promise<Draft[]> {
        const connection = Connection.fromUser(user);
        return Nylas.with(connection.accessToken).drafts.list({ ...filter, ...options });
    }

    /**
     * Sends out an existing Draft
     * @param user Nylas Account
     * @param id Draft ID
     * @returns Draft
     */
    @CatchError('Draft')
    async sendDraft(user: INylasUser, id: string): Promise<Draft> {
        const connection = Connection.fromUser(user);
        const draft = await Nylas.with(connection.accessToken).drafts.find(id);
        return draft.send();
    }

    /**
     * Finds Drafts by IDs
     * @param user Nylas Account
     * @param ids Drafts IDs
     * @returns Drafts
     */
    @CatchError('Drafts')
    async findDraftsByIds(user: INylasUser, ids: string[]): Promise<Draft[]> {
        const connection = Connection.fromUser(user);
        if (ids.length > 0) {
            const drafts = await Promise.all(
                ids.map(async (id) => {
                    return Nylas.with(connection.accessToken).drafts.find(id);
                }),
            );
            return drafts;
        }
        return await Nylas.with(connection.accessToken).drafts.list();
    }
}
