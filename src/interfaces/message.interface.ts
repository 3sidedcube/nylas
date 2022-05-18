export interface IMessageParameters {
    /**
     * The number of objects to return. Defaults to 100. If set too high, requests may fail to prevent excessively large response bodies..
     */
    limit?: number;

    /**
     * Zero-based offset from default object sorting.
     */
    offset?: number;
}
/* eslint-disable camelcase */
interface User {
    name?: string;
    email: string;
}

export interface SendMessageInput {
    subject: string;
    body: string;
    to: User[];
    from?: User[];
    replyTo?: User[];
    cc?: User[];
    bcc?: User[];
    fileIds?: string[];
}

export interface UpdateMessageInput {
    unread?: boolean;
    starred?: string;
    folder_id?: string;
    label_ids?: string[];
    metadata?: any;
}
