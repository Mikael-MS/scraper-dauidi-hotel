const pup = require('puppeteer');
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('fs');

function formatDate(date) {
   return moment(date).format('DDMMYYYY')
}

function formatPrices(price) {
    let priceSplit = price.split('R$');
    if (priceSplit.length > 1) {
        let priceText = priceSplit[1];
        let numberPrice = '';
        if (priceText.includes('.')) {
            let replacePoint = priceText.replace('.', '');
            let replaceComma = replacePoint.replace(',', '.');
            numberPrice = formatDecimal(replaceComma);
        } else {
            let replaceComma2 = priceText.replace(',', '.');
            numberPrice = formatDecimal(replaceComma2);
        }
        return numberPrice
    }
    return 0
}

function formatDecimal(priceTxt) {
    let nrPrice = parseFloat((priceTxt)).toFixed(2);
    return parseFloat(nrPrice)
}

async function scraperDiaudi(checkin, checkout, adults, children) {
    if (moment().isAfter(checkin) || moment(checkin).isAfter(checkout)) {
        return 'Invalid checkin or checkout';
    }

    const dateCheckin = moment(checkin).format('DD-MM-YYYY');
    const dateCheckout = moment(checkout).format('DD-MM-YYYY');

    const numberAdults = Number(adults);
    if (numberAdults < 1) {
        return 'Enter the number of adults'
    }

    const numberChildren = Number(children);


    let url = `https://sbreserva.silbeck.com.br/diaudihotel/pt-br/reserva/busca/checkin/${dateCheckin}/checkout/${dateCheckout}/adultos-000001/${numberAdults}/criancas-000004/${numberChildren}`

    const browser = await pup.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('body > div.container-padrao.reserva > div > div > div > div.content-reserva > div > div.col-12.col-lg-9.pr-lg-0 > div:nth-child(3) > div');

    const html = await page.content();
    const $ = cheerio.load(html);

    const roomData = [];
    $('body > div.container-padrao.reserva > div > div > div > div.content-reserva > div > div.col-12.col-lg-9.pr-lg-0 > div:nth-child(3) > div > div').each((i, room) => {
    
        let nameRooms = $(room).find('div > form > div.row > div.col-12.col-lg-7 > div.row.head-apto > div > span');
        const nameRoom = nameRooms ? nameRooms.text() : '';

        let totalPrices = $(room).find('div > form > div.info-reserva-quarto > div.tarifas > div:nth-child(2) > div > div.col-6.col-sm-6 > span');
        const totalPrice = totalPrices ? totalPrices.text() : '';

        let dailyPrices = $(room).find('div > form > div.info-reserva-quarto > div.tarifas > div:nth-child(2) > div > div.col-6.col-sm-3 > span > span.valor-sem-desconto > span');
        const dailyPrice = dailyPrices ? dailyPrices.text() : '';


        const setOfAmenities = [];

        const amenities = $(room).find('div > form > div.row > div.col-12.col-lg-7 > div.row.caracteristicas-apto.align-items-center > div');
        if (amenities) {
            amenities.each((i, convenience) => {
                const amenity = $(convenience).attr('title')
                setOfAmenities.push(amenity);
            })
        } else {
            amenities = '';
        }


        let imgMain = $(room).find('div > form > div.row > div.col-12.col-lg-5.pr-lg-0 > div > div > div.owl-stage-outer > div > div.owl-item.active > div > a');
        const photoMain = imgMain ? imgMain.attr('href') : '';


        const allImages = [];
        const images = $(room).find('div > form > div.row > div.col-12.col-lg-5.pr-lg-0 > div > div > div.owl-stage-outer > div > div.owl-item > div > a');
        if (images) {
            images.each((i, imgs) => {
                const photos = $(imgs).attr('href');
                allImages.push(photos)
            });
        } else {
            images = '';
        }

        roomData.push({
            'nameRoom': nameRoom,
            'description': '',
            'totalPrice': formatPrices(totalPrice),
            'dayliPrice': formatPrices(dailyPrice),
            'amenities': setOfAmenities,
            'photoMain': photoMain,
            'photos': allImages,
            'adults': numberAdults,
            'children': numberChildren
        })

        return roomData
    });

    fs.writeFileSync(`./quotation/${formatDate(checkin)}_${formatDate(checkout)}_${adults}`, JSON.stringify(roomData), { encoding: 'utf-8' } )


    await browser.close();
}

let checkin = new Date('2023-06-21');
let checkout = new Date('2023-06-23');
let adults = '2';
let children = '1';

const resp = scraperDiaudi(checkin, checkout, adults, children);
console.log(resp)