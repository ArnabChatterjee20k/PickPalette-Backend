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
  public browser: Browser;
  public page: Page;
  public count: number;
  public generalDataLogger: Logger;
  public linksLogger: Logger;

  constructor(public config: Config) {
    this.count = 0;
    this.generalDataLogger = getLogger("general");
    this.linksLogger = getLogger("links");
  }
  async init(): Promise<ProductHuntCrawler> {
    this.browser = await pw.chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    return this;
  }

  async crawl() {
    const {
      url,
      include = [],
      exclude = [],
      maxQueries,
      onVisit,
    } = this.config;
    const visitedPages = new Set();
    try {
      await this.page.goto(url, { waitUntil: "domcontentloaded" });

      let links = await this.getAllLinks({
        saveToLogger: false,
        include,
        exclude,
      });

      while (this.count < maxQueries && links.length) {
        const link = links.shift();
        if (visitedPages.has(link)) continue;
        visitedPages.add(link);

        // Check count before processing the link
        if (this.count >= maxQueries) {
          break;
        }

        try {
          console.log("Going to ", link);
          await this.page.goto(link, { waitUntil: "domcontentloaded" });
        } catch (error) {
          console.log(error);
          break;
        }

        // Close overlay if present
        try {
          const closeButton = this.page
            .locator(".overlay")
            .locator('a[title="Close"]')
            .first();
          if (await closeButton.isVisible()) {
            await closeButton.click({ timeout: 60000 }); // 60 seconds timeout
          }
        } catch (error) {
          console.log(error);
        }

        try {
          await this.page.waitForSelector(
            "xpath=//html/body/div[1]/div[2]/div[3]/main/div/div/div[2]/div[2]"
          );
          const description = await this.page
            .locator(
              "xpath=//html/body/div[1]/div[2]/div[3]/main/div/div/div[2]/div[2]"
            )
            .innerText();

          const visitWebsiteLink = await this.page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll("a")).filter(
              (a) => a.innerText === "Visit website"
            );
            return elements.length ? elements[0].href : null;
          });

          try {
            if (visitWebsiteLink) {
              await this.page.goto(visitWebsiteLink, {
                timeout: 2 * 60 * 1000,
                waitUntil: "domcontentloaded",
              });
            }
          } catch (error) {
            console.error("Error navigating to the website:", error.message);
          }
          try {
            const title = await this.page.title();
            await this.takeScreenshot();
            await this.savePaletteToDB(title, description);
          } catch (error) {
            console.log(error);
          }
        } catch (error) {
          (await this.generalDataLogger).error({
            product: link,
            error: error.message,
          });
        }

        // Additional waiting strategy if needed
        // await this.page.waitForTimeout(2000); // Wait for 2 seconds
        console.log(this.count);
        this.count++;
      }
    } catch (error) {
      console.error("Error during crawling:", error);
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
        ?.filter(
          (link) =>
            link.startsWith("https://www.producthunt.com/products") ||
            link.startsWith("https://www.producthunt.com/posts")
        );
    }, args);
    const pageTitle = await this.page.title();
    const uniqueLinks = Array.from(new Set(links));
    (await this.linksLogger).info({ links: uniqueLinks });
    return uniqueLinks;
  }

  takeScreenshot() {
    return this.page.screenshot({ path: "img/test.png", fullPage: true });
  }

  async savePaletteToDB(title: string, description: string) {
    const data = await generatePalettes("img/test.png");
    savePaletteToCache({ description, title, palette: data });
  }
}
