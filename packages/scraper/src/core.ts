import { Config } from "./types/Config";
import * as pw from "playwright";
import { Browser, Page } from "playwright";
import { generatePalettes } from "./utils/generatePalettes";
import { savePaletteToCache } from "./utils/savePalette";
import { Logger, getLogger } from "./Logger";

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
  private browser: Browser;
  private page: Page;
  private count: number;
  private generalDataLogger: Logger;
  private linksLogger: Logger;
  private screenshotPath: string;
  constructor(public config: Config) {
    this.count = 0;
    this.screenshotPath = "img/test.png";
  }
  async init(): Promise<ProductHuntCrawler> {
    this.browser = await pw.chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    return this;
  }

  async crawl() {
    /**
     * getting product links from a page
     * then start going to each product page. Here can be a chance of getting some overlay. So close it
     * Collect description and then visit the product main page. Get title from here
     * Screenshot it and save it to the file storage.
     * Generate palette from the taken screenshot
     */
    const { url, maxQueries } = this.config;
    const visitedPages = new Set();
    const errorsInPages = [];
    try {
      await this.navigate(url);
      const links = await this.getAllLinks();

      while (this.count < maxQueries && links.length) {
        const link = links.shift();
        if (visitedPages.has(link)) continue;
        visitedPages.add(link);
        const errorInCrawledPage = await this.crawlPage(link);
        if (errorInCrawledPage) errorsInPages.push(errorInCrawledPage);
        console.log(this.count);
        this.count++;
      }
    } catch (error) {
      console.log({ error, url });
      errorsInPages.push({url,error})
    } finally {
      this.browser.close();
    }

    return errorsInPages
  }

  async crawlPage(link: string) {
    try {
      await this.navigate(link);
      await this.closeOverlayFromProductPageIfPresent();
      const productData = await this.getProductDetails();
      if (productData) {
        const { title, description } = productData;
        await this.takeScreenshot();
        const palette = await generatePalettes(this.screenshotPath);
        savePaletteToCache({ title, description, palette });
        return null;
      }
    } catch (error) {
      console.log({ error, link });
      return { error, link };
    }
  }

  async navigate(url: string, timeout?: number) {
    console.log("visiting url ", url);
    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: timeout || 0,
    });
  }
  async getAllLinks() {
    const links = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll("a"))
        ?.map((a) => a.href)
        ?.filter(
          (link) =>
            link.startsWith("https://www.producthunt.com/products") ||
            link.startsWith("https://www.producthunt.com/posts")
        );
    });
    const uniqueLinks = Array.from(new Set(links));
    return uniqueLinks;
  }
  async closeOverlayFromProductPageIfPresent() {
    const closeButton = this.page
      .locator(".overlay")
      .locator('a[title="Close"]')
      .first();
    if (await closeButton.isVisible()) {
      await closeButton.click({ timeout: 60000 }); // 60 seconds timeout
    }
  }
  async getProductDetails() {
    const descriptionTag = await this.page.waitForSelector(
      "xpath=//html/body/div[1]/div[2]/div[3]/main/div/div/div[2]/div[2]"
    );
    if (!(await descriptionTag.isVisible())) return null;
    const description = await descriptionTag.innerText();
    const visitWebsiteLink = await this.getProductMainPageVisitingLink();
    if (!visitWebsiteLink) return null;
    await this.navigate(visitWebsiteLink, 2 * 60 * 1000);
    const title = await this.page.title();
    return { title, description };
  }
  async takeScreenshot() {
    return this.page.screenshot({ path: this.screenshotPath, fullPage: true });
  }
  async fetchProductPalettesFromProductPageScreenshot() {}

  async getProductMainPageVisitingLink() {
    return await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("a")).filter(
        (a) => a.innerText === "Visit website"
      );
      return elements.length ? elements[0].href : "";
    });
  }
  async savePaletteToDB(title: string, description: string) {
    const data = await generatePalettes("img/test.png");
    savePaletteToCache({ description, title, palette: data });
  }
}
