export declare class ScraperServiceSeltex {
    private readonly baseUrl;
    private readonly catalogUrl;
    private readonly logger;
    constructor();
    handleCron(): Promise<void>;
    private downloadAndProcessExcel;
}
