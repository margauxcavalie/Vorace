import {load} from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';

export default async function step1(url)
{
    const response = await fetch(url);
    const data = await response.text();
    const $ = load(data);

    let lineWithNumbers;
    $('.sub-title').each((i, elt) => {
        if ($(elt).text().trim().includes('actuellement'))
            lineWithNumbers = $(elt).text().trim();
    });

    let regexProducts = /actuellement (?<number>[0-9]+) produit/;
    let productNumber = regexProducts.exec(lineWithNumbers).groups.number;

    let regexUsers = /et (?<number>[0-9]+) utilisateur/;
    let userNumber = regexUsers.exec(lineWithNumbers).groups.number;

    let secretMessage = $('.title').find('div').text();

    let result = { 
        productNumber: parseInt(productNumber),
        userNumber: parseInt(userNumber),
        secret: secretMessage
    };

    // create index.json
    fs.writeFile('./results/index.json', JSON.stringify(result, null, 4), err => {
        if (err) {
          console.log(err.message);
        }
    });

    return;
}