export interface IFileProperties {
    filename: string;
    data: any;
    size: number;
    contentType: string;
    messageIds?: string[];
    contentId?: string;
    contentDisposition?: string;
}
