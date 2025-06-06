export declare class ScraperServiceZipteh {
    private readonly logger;
    private readonly loginUrl;
    private readonly homeUrl;
    private readonly username;
    private readonly password;
    private readonly artikulFile;
    private readonly resultJsonFile;
    private readonly resultExcelFile;
    constructor();
    handleCron(): Promise<void>;
    private scrape;
}
