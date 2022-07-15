import { load } from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';
import step3Analysis from './step3Analysis.js';

export async function getAllURLByCategory(rootURL, urlCategory) {
    let listLinks = [];
    let linkCurrentPage = urlCategory;
    while (linkCurrentPage != null) {
        let responseCurrentPage = await fetch(rootURL + linkCurrentPage);
        let data = await responseCurrentPage.text();
        let $ = load(data);

        $('.product-item').each((i, elt) => {
            listLinks.push($(elt).find('a').attr().href);
        });

        linkCurrentPage = null;
        $('.page-link').each((i, elt) => {
            if ($(elt).text().trim() === 'Page suivante')
                linkCurrentPage = $(elt).attr().href;
        });
    }

    return listLinks;
}

export async function downloadImage(imageURL, imageName) {
    return new Promise(async (resolve, reject) => {
        try { // create folder for images
            if (!fs.existsSync('./images'))
                fs.mkdirSync('./images');
        } catch (error) {
            console.log(error.message);
        }

        let image = await fetch(imageURL);
        let stream = image.body.pipe(fs.createWriteStream('./images/' + imageName));
        stream.on('finish', () => {
            return resolve();
        });
    });
}

// returns an object with the useful informations in the header:
// x-ratelimit-remaining & x-ratelimit-reset.
// the fullHeader must be given in JSON format.
export function getHeaderUsefulInfos(fullHeader) {
    let infos = {
        'x-ratelimit-remaining': fullHeader['x-ratelimit-remaining'],
        'x-ratelimit-reset': fullHeader['x-ratelimit-reset'],
        'x-ratelimit-interval': fullHeader['x-ratelimit-interval']
    };

    return infos;
}

export async function fetchCategoriesURLs(url, category) {
    return await getAllURLByCategory(url, '/category/' + category);
}

// returns { infos:..., response:... }
export async function fetchInfosProduct(rootURL, urlProduct) {
    const response = await fetch(urlProduct);
    if (response.status !== 200)
        throw new Error(response.statusText);

    const data = await response.text();
    const $ = load(data);

    let name = $('.product-title').text().trim();
    let description = $('.product-information').find($('.product-content')).text().trim();
    let price = parseFloat($('.product-price').text().trim());

    let stock = $('.product-stock').text().trim();
    let regexStock = /plus que (?<quantity>[0-9]+) !/; // stock
    let matchStockGroups = regexStock.exec(stock).groups;

    let tagsList = [];
    $('.tag').each((i, elt) => {
        tagsList.push($(elt).text().trim()); // tags
    });

    let imageURL = $('.product-picture').find('img').attr().src; // download image
    let regexNameImage = /product-images\/(?<nameImage>[0-9A-Za-z_.-]+)/;
    let NameImageGroups = regexNameImage.exec(imageURL).groups;
    await downloadImage(rootURL + imageURL, NameImageGroups.nameImage); // async ?

    let regexCategory = /category\/(?<nameCategory>[A-Za-z0-9-]+)\//; // category
    let categoryGroups = regexCategory.exec(urlProduct).groups;

    let productInfos = {
        name: name,
        description: description,
        price: price,
        stock: parseInt(matchStockGroups.quantity),
        tags: tagsList,
        image: NameImageGroups.nameImage,
        category: categoryGroups.nameCategory
    }

    return { infos: productInfos, response: response };
}

export function iterateOverCategory(url, categoryURLs, numberExecs, reset) {
    return new Promise(async (resolve, reject) => {
        if (categoryURLs === undefined || categoryURLs.length === 0)
            return resolve([]);

        let counter = 0;
        let beginningTime = new Date();
        let listPromisesProducts = [];
        if (numberExecs === null) {
            let firstProduct = await fetchInfosProduct(url, `${url}${categoryURLs[0]}`); // /!\ Object
            counter++;
            let responseFirstProduct = getHeaderUsefulInfos(firstProduct.response.headers.raw());
            listPromisesProducts.push(firstProduct);
            numberExecs = parseInt(responseFirstProduct['x-ratelimit-remaining']) + 1;
            reset = responseFirstProduct['x-ratelimit-interval'] + '200';
            for (let i = 1; (i < numberExecs) && i < categoryURLs.length; i++) {
                listPromisesProducts.push(fetchInfosProduct(url, `${url}${categoryURLs[i]}`));
                counter++;
            }
        }
        else {
            for (let i = 0; (i < numberExecs) && i < categoryURLs.length; i++) {
                listPromisesProducts.push(fetchInfosProduct(url, `${url}${categoryURLs[i]}`));
                counter++;
            }
        }
        let listProducts = await Promise.all(listPromisesProducts);
        let endingTime = new Date();

        if (counter < categoryURLs.length) {
            setTimeout(() => {
                iterateOverCategory(url, categoryURLs.slice(counter), numberExecs, reset).then(nextProduct => { resolve(listProducts.concat(nextProduct)); });
            }, reset - (endingTime.getTime() - beginningTime.getTime()));
        }
        else
            resolve(listProducts);
    });
}

export default async function step3Infos(url) {
    let listCategories = [];
    const response = await fetch(url); // page d'accueil
    const data = await response.text();
    const $ = load(data);

    $('.h-link').each((i, elt) => {
        if ($(elt).text().trim() !== 'News')
            listCategories.push($(elt).text().trim());
    })

    let listPromisesCategoriesURLs = [];
    for (let category of listCategories) {
        listPromisesCategoriesURLs.push(fetchCategoriesURLs(url, category));
    }
    let listCategoriesURLs = await Promise.all(listPromisesCategoriesURLs);


    let listPromisesAll = [];
    for (let categoryURLs of listCategoriesURLs) {
        listPromisesAll.push(iterateOverCategory(url, categoryURLs, null, 0));
    }

    let listAll = await Promise.all(listPromisesAll);

    let finalList = [];
    for (let category of listAll) {
        for (let product of category) {
            finalList.push(product.infos);
        }
    }
    let saveForSecondStep = finalList;

    finalList.sort((first, sec) => {
        if (first.category.localeCompare(sec.category) !== 0)
            return first.category.localeCompare(sec.category);
        else
            return first.name.localeCompare(sec.name);
    });

    // create products.json
    fs.writeFile('./results/products.json', JSON.stringify(finalList, null, 4, 0), err => {
        if (err) {
            console.log(err.message);
        }
    });

    step3Analysis(saveForSecondStep, listCategories);
    return;
}
