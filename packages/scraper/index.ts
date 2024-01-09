import { ProductHuntCrawler } from "./src/core";
import { Config } from "./src/types/Config";
const config : Config= {
    maxQueries:40,
    selectors:[],
    url:"https://www.producthunt.com/leaderboard/monthly/2023/12"
}
async function test(){
    const crawler = await new ProductHuntCrawler(config).init()
    crawler.crawl()
}
test()
