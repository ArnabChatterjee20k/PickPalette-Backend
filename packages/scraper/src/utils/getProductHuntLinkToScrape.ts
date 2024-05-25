export default () => {
  const formattedDate = getDate()
  // Construct the URL
  return `https://www.producthunt.com/leaderboard/daily/${formattedDate}`;
};


export const getDate = ()=>{
  // Get today's date
  const today = new Date();

  // Format date as YYYY/MM/DD
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
//   const formattedDate = `${year}/${month}/${day}`;
  return `${year}/${month}/${day}`;
}