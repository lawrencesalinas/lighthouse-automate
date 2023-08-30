// const lighthouse = require('lighthouse');
// const puppeteer = require('puppeeteer');
// const cron = require('node-cron');
import fs from 'fs';
console.log('hello');
import lighthouse from "lighthouse";
import chromeLauncher from 'chrome-launcher';
import puppeteer from "puppeteer";
import cron from 'node-cron';
import { URL, fileURLToPath } from 'url';
import { dirname } from "path";
import XLSX from 'xlsx';
import customConfig from './custom-config.js';
import { log } from 'console';
import { url } from 'inspector';
import { throttling, screenEmulationMetrics, userAgents } from './node_modules/lighthouse/core/config/constants.js';
const { mobile, desktop } = customConfig;




const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const reportSchedule = '0 0 * * *';

// async function runLighthouse(targetUrl, medium) {
//     const browser = await chromeLauncher.launch();
//     const runnerResult = await lighthouse(targetUrl, {port:browser.port}, medium);

//     // console.log(lhr.categories)
//     const reportHtml = runnerResult.report;
//     fs.writeFileSync('lhreport.html', reportHtml);

//     console.log('Report is done for', runnerResult.lhr.finalDisplayedUrl);
//     console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
//     console.log('Accessibility score was', runnerResult.lhr.categories.accessibility.score * 100);
//     console.log('Best Practices score was', runnerResult.lhr.categories['best-practices'].score * 100);
//     console.log('SEO score was', runnerResult.lhr.categories.seo.score * 100);
//     await browser.kill();
//     console.log(`lighthouse scores for ${targetUrl}`);
//     for (const [category, details] of Object.entries(runnerResult.lhr.categories)) {
//         console.log(`- ${details.title}: ${details.score * 100}`);
//     }

//     saveToExcel(runnerResult.lhr)
// }
function initialize() {
    const exists = fs.existsSync('./singlePageResults');
    if(exists === true) {
      return;
    }
    fs.mkdirSync('./singlePageResults')
  }


function saveToExcel(lhr) {
    const wb = XLSX.utils.book_new();

    const summaryData = [
        ['URL', targetUrl],
        ['Date', new Date().toISOString().slice(0, 10)],
        ['', ''],
        ['Category', 'Score'],
    ];

    for (const [category, details] of Object.entries(lhr.categories)) {
        summaryData.push([details.title, details.score * 100]);
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    for (const [category, details] of Object.entries(lhr.categories)) {
        const categoryData = [
            ['Audit', 'Score', 'Weight', 'Description']
        ];

        // console.log(details.auditRefs);
        for (const auditRef of details.auditRefs) {
            const audit = lhr.audits[auditRef.id];
            categoryData.push([audit.title, audit.score, auditRef.weight, audit.description]);
        }

        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, categorySheet, details.title);
    }
    XLSX.writeFile(wb, `Lighthouse_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}




const topPages = [
    "https://www.sheetlabels.com/",
    "https://www.sheetlabels.com/blank-sheet-labels",
    "https://www.sheetlabels.com/custom-labels",
    'https://www.sheetlabels.com/label-printing',
    "https://www.sheetlabels.com/printed/sheet-labels",
    "https://www.sheetlabels.com/printed/roll-labels",
    "https://www.sheetlabels.com/labels/all-label-sizes",
    "https://www.sheetlabels.com/labels/templates",
    "https://www.sheetlabels.com/markets/bottle-labels/beer-bottle-labels",
    "https://www.sheetlabels.com/custom-beer-bottle-labels",
    "https://www.sheetlabels.com/waterproof-labels-shop",
    "https://www.sheetlabels.com/cart/",
    "https://www.sheetlabels.com/checkout/review/",
];

const sheetNames = [
    'Home',
    'blank-labels',
    'custom-labels',
    'label-printing',
    'printed-sheet-labels',
    'roll-labels',
    'all-label-sizes',
    'labels-templates',
    'beer-bottle-labels',
    'custom-beer-bottle',
    'waterproof-labels',
    'cart',
    'checkout-review'
];

const desktopConfig = {
    logLevel: 'info', 
    output: 'html', 
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], 
    maxWaitForFcp: 15 * 1000,
    maxWaitForLoad: 35 * 1000,
    formFactor: 'desktop',
    throttling: throttling.desktopDense4G,
    screenEmulation: screenEmulationMetrics.desktop,
    emulatedUserAgent: userAgents.desktop,
    skipAudits: [
      // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
      'uses-http2',
      // There are always bf-cache failures when testing in headless. Reenable when headless can give us realistic bf-cache insights.
      'bf-cache',
    ],
  }


async function runLighthouse(browser, url, options, index) {
    options.port = (new URL(browser.wsEndpoint())).port;
    const runnerResult = await lighthouse(url, options);
    const reportHtml = runnerResult.report;
    await browser.close();
    fs.writeFileSync(`./singlePageResults/lhreport${index}.html`, reportHtml);
    return runnerResult.lhr;
}

async function navigateToCheckoutPage(browser) {
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://www.sheetlabels.com/preprinted-labels/paid-label-SLP4001');
    await page.waitForTimeout(1000)
    await page.waitForSelector('#FormProduct_roll_count_1',{visible: true});
    await page.evaluate(() => {
        document.querySelector('#FormProduct_roll_count_1').click();
    });
    await page.waitForTimeout(1000)
    await page.waitForSelector('#FormProduct_actionSubmit',{visible: true});
    await page.evaluate(() => {
        document.querySelector('#FormProduct_actionSubmit').click();
    });
    await page.waitForTimeout(2000)
    return page.url();
}


async function runMultiPageLightHouse(urls) {

    initialize()

    const mobileResults = [];
    for (const [i, url] of urls.entries()) {
        const browser = await puppeteer.launch({
            headless: true,
            timeout: 60000,
        
        });
        if (url === 'https://www.sheetlabels.com/checkout/review/') {
            console.log('here')
            await navigateToCheckoutPage(browser);
        }
        const lhr = await runLighthouse(browser, url, mobile, i);
 
        mobileResults.push(lhr);

        console.log(`Lighthouse mobile report generated for ${url}`);
     
    }

    const desktopResults = [];
    for (const [i, url] of urls.entries()) {

        const browser = await puppeteer.launch({
            headless: false,
            timeout: 60000,
            defaultViewport: null,
            // args:['--disable-cpu-throttling']
        });
        if (url === 'https://www.sheetlabels.com/checkout/review/') {
            await navigateToCheckoutPage(browser);
        }

        const lhr = await runLighthouse(browser, url, desktop, i + 1);

        desktopResults.push(lhr);
        console.log(`Lighthouse desktop report generated for ${url}`);

    }
  
    // console.log(results, 'results');
    // return results

    // const reportHtml = runnerResult.report;
    // fs.writeFileSync('lhreport.html', reportHtml);
    // await browser.kill();
    // console.log(`lighthouse scores for ${targetUrl}`);
    // for (const [category, details] of Object.entries(runnerResult.lhr.categories)) {
    //     console.log(`- ${details.title}: ${details.s core * 100}`);
    // }

    lighthouseReportExcel([mobileResults, desktopResults]);
    // saveToExcel(runnerResult.lhr);

}

function lighthouseReportExcel(results) {
    const summaryData = [
        ['Date'],
        [new Date().toISOString().slice(0, 10)],
    ];

    const headers = [
        'Pages',
        'Performance',
        'Accesibillity',
        'Best Practices',
        'SEO',
    ];

    const mobileData = results[0].map(result => {
        const audits = result.categories;
        return [
            result.finalUrl,
            audits.performance.score * 100,
            audits.accessibility.score * 100,
            audits['best-practices'].score * 100,
            audits.seo.score * 100
        ];
    });

    const desktopData = results[1].map(result => {
        const audits = result.categories;
        return [
            result.finalUrl,
            audits.performance.score * 100,
            audits.accessibility.score * 100,
            audits['best-practices'].score * 100,
            audits.seo.score * 100
        ];
    });

    XLSX.utils.aoa_to_sheet(summaryData);
    const ws = XLSX.utils.aoa_to_sheet([
        summaryData,
        [['']],
        [['Mobile']],
        headers,
        ...mobileData,
        [['']],
        [['']],
        [['Desktop']],
        headers,
        ...desktopData,
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');

    results[0].forEach((result, index) => {
        const audits = result.categories;

        const categoryData = [
            ['Page', '', '', result.finalUrl],
            ['Performance', audits.performance.score * 100],
            ['Accesibillity', audits.accessibility.score * 100,],
            ['Best Practices', audits['best-practices'].score * 100,],
            ['SEO', audits.seo.score * 100],
            [''],
        ];

        for (const [category, details] of Object.entries(audits)) {

            categoryData.push([details.title]);
            categoryData.push(['Audit', 'Score', 'Weight', 'Description']);
            for (const auditRef of details.auditRefs) {
                const audit = result.audits[auditRef.id];
                if (audit.score !== 1 && audit.score !== null) {
                    categoryData.push([audit.title, audit.score, auditRef.weight, audit.description]);
                }
            }
            categoryData.push(['']);
        }
        const urlSheet = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, urlSheet, sheetNames[index]);
    });

    XLSX.writeFile(wb, 'Lighthouse_Results.xlsx');
    console.log("Lighthouse saved");
}

runMultiPageLightHouse(topPages).catch((err) => console.error('Error running lighthouse', err))
// runLighthouse('https://www.sheetlabels.com/', mobile).catch((err) => console.error('Error running lighthouse', err));