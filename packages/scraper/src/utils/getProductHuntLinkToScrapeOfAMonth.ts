export default function getProductHuntLinkToScrapeOfAMonth(year: number, month: number): string[] {
    const numDays = new Date(year, month, 0).getDate();
    const links: string[] = [];
    
    for (let day = 1; day <= numDays; day++) {
        const link = `https://www.producthunt.com/leaderboard/daily/${year}/${month}/${day}/all`;
        links.push(link);
    }
    
    return links;
}