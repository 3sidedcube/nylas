import { SendMessageInput } from './message.interface';
export interface DraftInput extends Partial<SendMessageInput> {}
export interface DraftFilter {
    to?: string;
    cc?: string;
    bcc?: string;
    unread?: boolean;
    starred?: boolean;
    subject?: string;
    any_email?: string;
    thread_id?: string;
}

export interface DraftPagination {
    limit?: number;
    offset?: number;
}