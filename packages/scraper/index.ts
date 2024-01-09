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

async function getFile(){
    interface Data{
        title:string,
        description:string,
        palette:string[]
    }
    const res = await fetch("http://localhost:3000/data")
    const data:Data[] = await res.json()

    const set = new Set()
    data.forEach(d=>set.add(d.title))
    console.log(Array.from(set).length)
}
getFile()