const pup = require('puppeteer');
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('fs');

async function scraperDiaudi() {

    let url = `https://sbreserva.silbeck.com.br/diaudihotel/pt-br/reserva/busca/checkin/16-06-2023/checkout/20-06-2023/adultos-000001/2/criancas-000004/1`

    const browser = await pup.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('body > div.container-padrao.reserva > div > div > div > div.content-reserva > div > div.col-12.col-lg-9.pr-lg-0 > div:nth-child(3) > div');

    const html = await page.content();
    const $ = cheerio.load(html);

    const nameSuite = $('#apartamento_categoria_2339 > div.row > div.col-12.col-lg-7 > div.row.head-apto > div > span').text();
    console.log('Name Room:',nameSuite);

    await browser.close();
}

scraperDiaudi()