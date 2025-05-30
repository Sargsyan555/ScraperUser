export declare class CrawlerService {
    private readonly baseUrl;
    private scrapeProductPage;
    private extractThirdLevelLinks;
    getAllUrls(): Promise<string[]>;
}
