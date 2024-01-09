import axios from "axios";
const retry = require("async-retry");
interface Options {
  title: string;
  description: string;
  palette: string[];
}
export async function savePalette(options: Options) {
  savePaletteWithFetch(options);
}
function savePaletteWithFetch(dataOptions: Options) {
  let options = {
    method: "POST",
    url: "http://localhost:3000/data",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
    },
    data: dataOptions,
  };

  axios
    .request(options)
    .then(function (response) {
      console.log("success");
    })
    .catch(function (error) {
      console.error(error);
    });
}
