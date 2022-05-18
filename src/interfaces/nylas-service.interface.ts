import Draft from 'nylas/lib/models/draft';
import File from 'nylas/lib/models/file';
import Message from 'nylas/lib/models/message';
import Thread from 'nylas/lib/models/thread';
import { DraftInput } from './draft.interface';
import { IFileProperties } from './file.interface';
import { SendMessageInput } from './message.interface';
import { INylasUser } from './nylas-user.interface';

/**
 * Interface for NylasService.
 * Write the service to this specification
 */
export interface INylasService {
    connect(scopes?: string[], email?: string): Promise<string>;
    findThreadByID(user: INylasUser, id: string, expanded?: boolean): Promise<Thread>;
    findThreadsByIDs(user: INylasUser, id: string[], expanded?: boolean): Promise<Thread[]>;
    findMessageByID(user: INylasUser, id: string): Promise<Message>;
    findMessagesByIDs(user: INylasUser, ids: string[]): Promise<Message[]>;
    findDraftById(user: INylasUser, id: string): Promise<Draft>;
    findDraftsByIds(user: INylasUser, ids: string[]): Promise<Draft[]>;
    searchMessages(user: INylasUser, query: string, options?: { limit?: number; offset?: number }): Promise<Message[]>;
    searchThreads(user: INylasUser, query: string, options?: { limit?: number; offset?: number }): Promise<Thread[]>;
    readMessage(user: INylasUser, id: string): Promise<Message>;
    deleteMessage(user: INylasUser, id: string): Promise<Message>;
    createDraft(user: INylasUser, input: DraftInput): Promise<Draft>;
    updateDraft(user: INylasUser, id: string, input: DraftInput): Promise<Draft>;
    deleteDraft(user: INylasUser, id: string, version: number): Promise<Draft>;
    sendDraft(user: INylasUser, id: string): Promise<Draft>;
    send(user: INylasUser, input: SendMessageInput): Promise<Message>;
    fileUpload(user: INylasUser, file: IFileProperties): Promise<File>;
    fileDownload(user: INylasUser, id: string): Promise<any>;
    fileById(user: INylasUser, id: string): Promise<File>;
    filesByIds(user: INylasUser, id: string[]): Promise<File[]>;
    fileDelete(user: INylasUser, id: string): Promise<boolean>;
}
