import {writeFileSync} from 'fs';
import puppeteer from 'puppeteer';
import * as pptrTestingLibrary from 'pptr-testing-library';
import {startFlow} from 'lighthouse';
import customConfig from './custom-config.js';
const { mobile, desktop } = customConfig;
// import desktop from './node_modules/lighthouse/core/config/lr-desktop-config.js'
// import mobile from './node_modules/lighthouse/core/config//lr-mobile-config.js'

const {getDocument, queries} = pptrTestingLibrary;

async function search(page) {
  const $document = await getDocument(page);
  const $searchBox = await queries.getByLabelText($document, /type to search/i);
  await $searchBox.type('Xbox Series X');
  await Promise.all([
    $searchBox.press('Enter'),
    page.waitForNavigation({waitUntil: ['load', 'networkidle2']}),
  ]);
}
const topPages = [
  "https://www.sheetlabels.com/",
  "https://www.sheetlabels.com/blank-sheet-labels",
  // "https://www.sheetlabels.com/custom-labels",
  // 'https://www.sheetlabels.com/label-printing',
  // "https://www.sheetlabels.com/printed/sheet-labels",
  // "https://www.sheetlabels.com/printed/roll-labels",
  // "https://www.sheetlabels.com/labels/all-label-sizes",
  // "https://www.sheetlabels.com/labels/templates",
  // "https://www.sheetlabels.com/markets/bottle-labels/beer-bottle-labels",
  // "https://www.sheetlabels.com/custom-beer-bottle-labels",
  // "https://www.sheetlabels.com/waterproof-labels-shop",
  // "https://www.sheetlabels.com/cart/",
  // "https://www.sheetlabels.com/checkout/review/",
];
// Setup the browser and Lighthouse.
const browser = await puppeteer.launch({
  headless:false
});
const page = await browser.newPage();
 await page.setCacheEnabled(false);
const flow = await startFlow(page, desktop);

// Phase 1 - Navigate to the landing page.


// Phase 2 - Interact with the page and submit the search form.
// await flow.startTimespan();
// await search(page);     
// await flow.endTimespan();1`


// // Phase 3 - Analyze the new state.
// await flow.snapshot();

// Phase 4 - Navigate to a detail page.
// await flow.navigate(async () => {
//   const $document = await getDocument(page);
//   const $link = await queries.getByText($document, /Xbox Series X 1TB Console/);
//   $link.click();
// });


await flow.navigate("https://www.sheetlabels.com/")
await flow.navigate("https://www.sheetlabels.com/blank-sheet-labels")
await flow.navigate("https://www.sheetlabels.com/custom-labels")
// await flow.navigate('https://www.sheetlabels.com/label-printing')
// await flow.navigate("https://www.sheetlabels.com/printed/sheet-labels")
// await flow.navigate("https://www.sheetlabels.com/printed/roll-labels")
// await flow.navigate("https://www.sheetlabels.com/labels/all-label-sizes")
// await flow.navigate("https://www.sheetlabels.com/labels/templates")
// await flow.navigate("https://www.sheetlabels.com/markets/bottle-labels/beer-bottle-labels")
// await flow.navigate("https://www.sheetlabels.com/custom-beer-bottle-labels")
// await flow.navigate("https://www.sheetlabels.com/waterproof-labels-shop")
// await flow.navigate("https://www.sheetlabels.com/cart/")
// await flow.navigate("https://www.sheetlabels.com/checkout/review/")

// Get the comprehensive flow report.
writeFileSync('report.html', await flow.generateReport());
// Save results as JSON.
writeFileSync('flow-result.json', JSON.stringify(await flow.createFlowResult(), null, 2));

// Cleanup.
await browser.close();


// import { writeFileSync } from 'fs';
// import puppeteer from 'puppeteer';
// import { startFlow } from 'lighthouse';
// import customConfig from './custom-config.js';
// const { mobile, desktop } = customConfig;
// // import desktop from './node_modules/lighthouse/core/config/lr-desktop-config.js'
// // import mobile from './node_modules/lighthouse/core/config//lr-mobile-config.js'

// async function runUserFlow(config, url) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   // Disable cache
//   await page.setCacheEnabled(false);

//   const flow = await startFlow(page, config);

//   // Navigate to the URL
//   await flow.navigate(url);

//   await browser.close();

//   // Save the Lighthouse report
//   const report = await flow.generateReport();
//   const deviceType = config.formFactor;
//   const fileName = `report_${deviceType}_${url.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
//   writeFileSync(fileName, report);
// }

// const urls = [
//   "https://www.sheetlabels.com/",
//   "https://www.sheetlabels.com/blank-sheet-labels",
//   "https://www.sheetlabels.com/custom-labels",
// ];

// (async () => {
//   for (const url of urls) {
//     await runUserFlow(desktop, url); // Run the user flow for mobile
//     // await runUserFlow(desktop, url); // Run the user flow for desktop
//   }
// })();


