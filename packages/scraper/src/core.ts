import { Config } from "./types/Config";
import * as pw from "playwright";
import { Browser, Page } from "playwright";

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
  public count:number;
  constructor(public config: Config) {
    this.count = 0
  }
  async init(): Promise<ProductHuntCrawler> {
    this.browser = await pw.chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    return this;
  }

  async crawl() {
    const {
      url,
      selectors,
      maxQueries,
      include = [],
      exclude = [],
      onVisit,
    } = this.config;
    await this.page.goto(url);
    const links = await this.getAllLinks({
      saveToLogger: false,
      include,
      exclude,
    });
    while (links.length && this.count<maxQueries) {
      //   if (onVisit && !exclude.includes(link)) onVisit(this.page);
      const link = links.shift();
      await this.page.goto(link);
      const visitWebsiteLink = await this.page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("a")).filter(
          (a) => a.innerText === "Visit website"
        );
        if (elements.length) return elements[0].href;
        return null;
      });
    try {
        await this.page.goto(visitWebsiteLink,{timeout:2*60*1000});
    } catch (error) {
        console.log(error)
    }
      await this.takeScreenshot(await this.page.title());
      console.log(this.count)
      this.count++;
    }

    this.browser.close();
  }
  async getAllLinks(option: LinkOption) {
    const { saveToLogger, exclude, include } = option;
    const args = { include, exclude };
    const links = await this.page.evaluate(({ include, exclude }) => {
      return Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter((link) =>
          link.startsWith("https://www.producthunt.com/products")
        );
    }, args);
    const pageTitle = await this.page.title();
    if (saveToLogger) this.saveToLogs({ fileName: pageTitle, data: links });
    return links;
  }

  takeScreenshot(title: string) {
    return this.page.screenshot({ path: `img/${title}.png`, fullPage: true });
  }

  saveToLogs(option: LoggerOption) {
    console.log(option.data);
  }
}
