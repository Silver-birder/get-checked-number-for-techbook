const puppeteer = require('puppeteer');
let page;
const login = "https://techbookfest.org/user/signin";

async function getBrowserPage() {
    // Launch headless Chrome. Turn off sandbox so Chrome can run under root.
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    return browser.newPage();
}

exports.getChecked = async (req, res) => {

    if (!page) {
        page = await getBrowserPage();
    }

    await page.goto(login);
    // wait login element
    await page.waitForSelector('#mat-input-0');
    await page.waitForSelector('#mat-input-1');
    // type email and password (from env)
    await page.type("#mat-input-0", process.env.EMAIL);
    await page.type("#mat-input-1", process.env.PASSWORD);
    // click login button
    await page.click('.mat-raised-button.mat-primary');
    // wait checked number
    await page.waitFor('mat-card-content > span.ng-star-inserted', {timeout: 120000});
    // get checked elements
    const data = await page.evaluate((selector) => {
        return document.querySelector(selector).textContent;
    }, 'mat-card-content > span.ng-star-inserted');
    // match 「被チェック数:1」-> 1
    const checked = parseInt(data.match(/\d+$/)[0]);
    res.set('Content-Type', 'application/json');
    res.send({'data':checked});
};