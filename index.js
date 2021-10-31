const pup = require("puppeteer");
const xlsx = require("xlsx");

//Only change the month 3 letter abbreviation. Make sure that the first letter is capitalized
let month = "May";
//           ^^^ These 3 letters

const potentialAud = {
  FBLikes: null,
  TWFollowers: null,
  PIFollowers: null,
  IGFollowers: null,
};

const monthToCollumn = {
  Jan: "B",
  Feb: "C",
  Mar: "D",
  Apr: "E",
  May: "F",
  Jun: "G",
  Jul: "H",
  Aug: "I",
  Sep: "J",
  Oct: "K",
  Nov: "L",
  Dec: "M",
};
OL = monthToCollumn[month];

const wb = xlsx.readFile("dbcopy.xlsx", { cellDates: true });
const ws = wb.Sheets["2021"];
// xlsx.utils.sheet_add_aoa(ws, [["Hi"], ["My"], ["My"], ["Name"], ["is"]], { origin: `${OL}6` });
// console.log(ws["L6"]);
//xlsx.writeFile(wb, "dbcopy.xlsx", { cellDates: true });

(async () => {
  //setting up for webscraping
  const browser = await pup.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36");

  //webscraping beginning
  try {
    await page.goto("https://www.facebook.com/pvplc.org");
    const FBLikes = await page.$eval(
      "#PagesProfileHomeSecondaryColumnPagelet > div > div:nth-child(2) > div > div._4-u2._6590._3xaf._4-u8 > div:nth-child(2) > div > div._4bl9>div",
      (el) => el.textContent
    );
    potentialAud.FBLikes = Number(FBLikes.replace(/\D+/g, ""));
  } catch (e) {
    console.error("Unable to get FB likes");
    potentialAud.FBLikes = "N/A";
  }
  try {
    const FBFollowers = await page.$eval(
      "#PagesProfileHomeSecondaryColumnPagelet > div > div:nth-child(2) > div > div._4-u2._6590._3xaf._4-u8 > div:nth-child(3) > div > div._4bl9 > div",
      (el) => el.textContent
    );
  } catch (error) {
    console.error("Unable to get FB followers");
  }

  try {
    await page.goto("https://twitter.com/PVPLC");
    await page.waitForSelector("div>a>span>span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0");
    const TWFollowers = await page.$eval("div>a>span>span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0", (el) => Number(el.innerHTML));
    potentialAud.TWFollowers = TWFollowers;
  } catch (error) {
    console.error("Unable to get TW Followers");
    potentialAud.TWFollowers = "N/A";
  }

  try {
    await page.goto("https://www.instagram.com/pvplc/");
    await page.waitForSelector("#react-root > section > main > div > header > section > ul > li:nth-child(2) > a > span");
    throw new Error("oops");
    const IGFollowers = await page.$eval("#react-root > section > main > div > header > section > ul > li:nth-child(2) > a > span", (el) => el.innerHTML);
    potentialAud.IGFollowers = Number(IGFollowers.replace(/\D+/g, ""));
  } catch (error) {
    console.error("Unable to get IG followers");
    potentialAud.IGFollowers = "N/A";
  }

  try {
    await page.goto("https://www.pinterest.com/pvplc/");
    await page.waitForSelector("#mweb-unauth-container > div > div.Jea.fZz.jzS.snW.wsz.zI7.iyn.Hsu > div > div > div.Jea.hjj.hs0.mQ8.zI7.iyn.Hsu > div.Jea.gjz.hs0.zI7.iyn.Hsu > div");
    const PIFollowers = await page.$eval(
      "#mweb-unauth-container > div > div.Jea.fZz.jzS.snW.wsz.zI7.iyn.Hsu > div > div > div.Jea.hjj.hs0.mQ8.zI7.iyn.Hsu > div.Jea.gjz.hs0.zI7.iyn.Hsu > div",
      (el) => el.innerHTML
    );
    potentialAud.PIFollowers = Number(PIFollowers.replace(/\D+/g, ""));
  } catch (error) {
    console.error("Unable to get PI followers");
    potentialAud.PIFollowers = "N/A";
  }

  //filling the ponential audience array from the object by creating a 1 length array cuz that's what the sheet_add_aoa wants
  const potentialAudAOA = Object.values(potentialAud).map((item) => {
    let arr = new Array(1);
    arr[0] = item;
    return arr;
  });
  console.log(Object.values(potentialAudAOA));

  //Creating final copy
  xlsx.utils.sheet_add_aoa(ws, potentialAudAOA, { origin: `${OL}6` });
  let name = "dbcopy" + Date.now() + ".xlsx";
  xlsx.writeFile(wb, name, { cellDates: true });
  console.log("File created: ", name);
})();
