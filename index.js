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

    $('body > div.container-padrao.reserva > div > div > div > div.content-reserva > div > div.col-12.col-lg-9.pr-lg-0 > div:nth-child(3) > div > div').each((i,room) => {
        let nameRooms = $(room).find('div > form > div.row > div.col-12.col-lg-7 > div.row.head-apto > div > span');
        let nameRoom = nameRooms? nameRooms.text() : '';
        console.log(nameRoom);

        let totalPrices = $(room).find('div > form > div.info-reserva-quarto > div.tarifas > div:nth-child(2) > div > div.col-6.col-sm-6 > span');
        let totalPrice = totalPrices? totalPrices.text(): '';
        console.log(totalPrice);

        let dailyPrices = $(room).find('div > form > div.info-reserva-quarto > div.tarifas > div:nth-child(2) > div > div.col-6.col-sm-3 > span > span.valor-sem-desconto > span');
        let dailyPrice = dailyPrices? dailyPrices.text(): '';
        console.log(dailyPrice);

        const setOfAmenities = [];

        let amenities = $(room).find('div > form > div.row > div.col-12.col-lg-7 > div.row.caracteristicas-apto.align-items-center > div');
        if(amenities){
            amenities.each((i,convenience) =>{
                const amenity = $(convenience).attr('title')
                setOfAmenities.push(amenity);
            })
        }else {
            amenities = '';
        }
        console.log(setOfAmenities)

        let imgMain = $(room).find('div > form > div.row > div.col-12.col-lg-5.pr-lg-0 > div > div > div.owl-stage-outer > div > div.owl-item.active > div > a');
        let photoMain = imgMain ? imgMain.attr('href'): '';
        console.log(photoMain)

        const allImages = [];
        let images = $(room).find('div > form > div.row > div.col-12.col-lg-5.pr-lg-0 > div > div > div.owl-stage-outer > div > div.owl-item > div > a');
        if(images){
            images.each((i, imgs) =>{
                const photos = $(imgs).attr('href');
                allImages.push(photos)
            });
        }else{
            images = '';
        }
        console.log(allImages)     
    });
    

    await browser.close();
}

scraperDiaudi()