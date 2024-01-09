import { Config } from "./types/Config";
import * as pw from "playwright";
import { Browser, Page } from "playwright";
import { generatePalettes } from "./utils/generatePalettes";
import { savePalette } from "./utils/savePalette";

interface LinkOption {
  saveToLogger: boolean;
  include: string[];
  exclude: string[];
}

interface LoggerOption {
  data: string[];
  fileName: string;
}
export class ProductHuntCrawler {
  public browser: Browser;
  public page: Page;
  public count: number;
  constructor(public config: Config) {
    this.count = 0;
  }
  async init(): Promise<ProductHuntCrawler> {
    this.browser = await pw.chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    return this;
  }

  async crawl() {
    const { url, include = [], exclude = [], maxQueries, onVisit } = this.config;
    const visitedPages = new Set()
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  
      let links = await this.getAllLinks({
        saveToLogger: false,
        include,
        exclude,
      });
  
      while (this.count < maxQueries && links.length) {
        const link = links.shift();
        if(visitedPages.has(link)) continue
        visitedPages.add(link)
  
        // Check count before processing the link
        if (this.count >= maxQueries) {
          break;
        }
  
        await this.page.goto(link, { waitUntil: 'domcontentloaded' });
  
        // Close overlay if present
        try {
          const closeButton = this.page.locator('.overlay').locator('a[title="Close"]').first();
          if (closeButton) {
            await closeButton.click({ timeout: 60000 }); // 60 seconds timeout
          }
          
        } catch (error) {
          console.log(error)
        }
  
        // Wait for the target element to be present and ready
        await this.page.waitForSelector('xpath=//html/body/div[1]/div[2]/div[3]/main/div/div/div[2]/div[2]');
  
        // Additional waiting strategy if needed
        // await this.page.waitForTimeout(2000); // Wait for 2 seconds
  
        const description = await this.page
          .locator('xpath=//html/body/div[1]/div[2]/div[3]/main/div/div/div[2]/div[2]')
          .innerText();
  
        const visitWebsiteLink = await this.page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll("a")).filter(
            (a) => a.innerText === "Visit website"
          );
          return elements.length ? elements[0].href : null;
        });
  
        try {
          if (visitWebsiteLink) {
            await this.page.goto(visitWebsiteLink, { timeout: 2 * 60 * 1000, waitUntil: 'domcontentloaded' });
          }
        } catch (error) {
          console.error('Error navigating to the website:', error.message);
        }
  
        const title = await this.page.title();
        await this.takeScreenshot();
        await this.savePaletteToDB(title, description);
        console.log(this.count);
        this.count++;
      }
    } catch (error) {
      console.error('Error during crawling:', error);
    } finally {
      // Close the browser after crawling
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async getAllLinks(option: LinkOption) {
    const { saveToLogger, exclude, include } = option;
    const args = { include, exclude };
    const links = await this.page.evaluate(({ include, exclude }) => {
      return Array.from(document.querySelectorAll("a"))
        ?.map((a) => a.href)
        ?.filter((link) =>
          link.startsWith("https://www.producthunt.com/products")
        );
    }, args);
    const pageTitle = await this.page.title();
    if (saveToLogger) this.saveToLogs({ fileName: pageTitle, data: links });
    return Array.from(new Set(links));
  }

  takeScreenshot() {
    return this.page.screenshot({ path: "img/test.png", fullPage: true });
  }

  async savePaletteToDB(title: string, description: string) {
    const data = await generatePalettes("img/test.png");
    await savePalette({ description, title, palette: data });
  }

  saveToLogs(option: LoggerOption) {
    console.log(option.data);
  }
}
