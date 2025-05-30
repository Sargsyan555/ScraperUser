import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
interface ProductInfo {
  name: string;
  articul: string;
  model: string;
  price: string;
  url: string;
}

@Injectable()
export class CrawlerService {
  private readonly baseUrl = 'http://intertrek.info/engines';
  private async scrapeProductPage(url: string): Promise<ProductInfo> {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const dl = $('dl.dl-horizontal');

    const name = dl.find('dt:contains("описание")').next('dd').text().trim();
    const articul = dl.find('dt:contains("аналоги")').next('dd').text().trim();
    const model = dl.find('dt:contains("модель")').next('dd').text().trim();

    // Fallback for price: try to find a <p> tag with currency-style formatting
    let price = '';
    $('td').each((_, td) => {
      const text = $(td).text().trim();
      if (/^\d[\d\s]*,\d{2}$/.test(text)) {
        price = text;
      }
    });

    return {
      name,
      articul,
      model,
      price,
      url,
    };
  }

  private async extractThirdLevelLinks(
    startUrl: string,
    collector: ProductInfo[],
  ) {
    const visitedPages = new Set<string>();

    const visitPage = async (url: string) => {
      if (visitedPages.has(url)) return;
      visitedPages.add(url);

      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extract product page links from <tbody>
        const productLinks: string[] = [];
        $('tbody a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (
            href &&
            !href.startsWith('javascript:') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('#')
          ) {
            const fullUrl = href.startsWith('http')
              ? href
              : new URL(href, url).href;
            productLinks.push(fullUrl);
          }
        });

        // Visit each product page and collect details
        for (const productUrl of productLinks) {
          try {
            const productData = await this.scrapeProductPage(productUrl);
            collector.push(productData);
          } catch (err) {
            console.warn(`Error scraping product ${productUrl}:`, err.message);
          }
        }

        // Handle pagination
        $('ul.pagination a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href) {
            const nextPageUrl = new URL(href, url).href;
            visitPage(nextPageUrl);
          }
        });
      } catch (err) {
        console.warn(`Error visiting ${url}:`, err.message);
      }
    };

    await visitPage(startUrl);
  }

  async getAllUrls(): Promise<string[]> {
    try {
      const { data: html } = await axios.get(this.baseUrl);
      const $ = cheerio.load(html);

      // Extract first-level URLs
      const firstLevelLinks: string[] = [];
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (
          href &&
          !href.startsWith('javascript:') &&
          !href.startsWith('mailto:') &&
          !href.startsWith('#')
        ) {
          const fullUrl = href.startsWith('http')
            ? href
            : new URL(href, this.baseUrl).href;
          firstLevelLinks.push(fullUrl);
        }
      });

      const secondLevelLinks = new Set<string>();

      // Fetch each first-level page and extract second-level URLs from `.panel-body a`
      for (const url of firstLevelLinks) {
        try {
          const { data: innerHtml } = await axios.get(url);
          const $$ = cheerio.load(innerHtml);

          $$('.panel-body a').each((_, element) => {
            const href = $$(element).attr('href');
            if (
              href &&
              !href.startsWith('javascript:') &&
              !href.startsWith('mailto:') &&
              !href.startsWith('#')
            ) {
              const fullUrl = href.startsWith('http')
                ? href
                : new URL(href, url).href;
              secondLevelLinks.add(fullUrl);
            }
          });
        } catch (innerError) {
          console.warn(
            `Failed to fetch or parse inner page ${url}:`,
            innerError.message,
          );
        }
      }
      const thirdLevelLinks = new Set<string>();
      const collector: ProductInfo[] = [];
      let s = 0;
      for (const link of secondLevelLinks) {
        s = s + 1;
        if (s === 5) {
          break;
        }
        console.log(`➡ Visiting second-level page: ${link}`);
        await this.extractThirdLevelLinks(link, collector);
      }
      console.log('end', thirdLevelLinks);

      return Array.from(secondLevelLinks);
    } catch (error) {
      console.error('Error crawling:', error.message);
      return [];
    }
  }
}
