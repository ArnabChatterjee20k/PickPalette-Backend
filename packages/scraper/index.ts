import { cache } from "./src/cache";
import { ProductHuntCrawler } from "./src/core";
import { Config } from "./src/types/Config";
import { savePalette, saveToVectorDB } from "./src/utils/savePalette";
const config: Config = {
  maxQueries: 40,
  selectors: [],
  url: "https://www.producthunt.com/leaderboard/daily/2023/7/3",
};
async function run_crawler() {
    try {
        const crawler = await new ProductHuntCrawler(config).init();
        await crawler.crawl();
        await saveToVectorDB();
    } catch (error) {
        console.log(error.message);
    }
}

async function getFile() {
  interface Data {
    title: string;
    description: string;
    palette: string[];
  }
  const res = await fetch("http://localhost:3000/data");
  const data: Data[] = await res.json();

  const set = new Set();
  data.forEach((d) => set.add(d.title));
  console.log(Array.from(set).length);
}
run_crawler()