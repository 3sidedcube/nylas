export interface IThreadParameters {
    /**
     * The number of objects to return. Defaults to 100. If set too high, requests may fail to prevent excessively large response bodies..
     */
    limit?: number;

    /**
     * Zero-based offset from default object sorting.
     */
    offset?: number;

    /**
     * Thread View [Allowed: "ids" ┃ "count" ┃ "expanded"].
     */
    view?: string;

    /**
     * Show deleted threads/messages in response
     * @default false
     */
    showDeleted?: boolean;
}
