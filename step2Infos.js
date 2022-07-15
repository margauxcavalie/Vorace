import {load} from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';
import step2Analysis from './step2Analysis.js';

function getMonth(month)
{
    switch (month)
    {
        case 'janvier':
          return '01';
        case 'février':
            return '02';
        case 'mars':
            return '03';
        case 'avril':
            return '04';
        case 'mai':
            return '05';
        case 'juin':
            return '06';
        case 'juillet':
            return '07';
        case 'août':
            return '08';
        case 'septembre':
            return '09';
        case 'octobre':
            return '10';
        case 'novembre':
            return '11';
        case 'décembre':
            return '12';
        default:
            return '12';
      }
}

export async function fetchNewsInfos(url, href)
{
    let responseCurrentArticle = await fetch(url + href);
    let data = await responseCurrentArticle.text();
    let $ = load(data);

    let newArticleObject = {};
    newArticleObject.title = $('.article-title').text().trim();
    newArticleObject.slug = href.substring(6);
    newArticleObject.content = $('.article-content').text().trim();
    newArticleObject.author = $('.article-author').text().trim().substring(10);    

    let regexDate = /Publié le [A-Za-z]+ (?<date>[ A-Za-z0-9:,]+)/;
    let matchRegexDate = regexDate.exec($('.article-date').text().trim());
    let regexDateFormat = /(?<day>[0-9]+) (?<month>[A-Za-z]+) (?<year>[0-9]+), (?<hours>[:0-9]+)/;
    let matchRegexFormatGroups = regexDateFormat.exec(matchRegexDate).groups;
    let goodFormatMonth = getMonth(matchRegexFormatGroups.month);
    let paddedDays = matchRegexFormatGroups.day.padStart(2, '0');
    let wellFormattedDate = `${matchRegexFormatGroups.year}-${goodFormatMonth}-${paddedDays}T${matchRegexFormatGroups.hours}.000+00:00`;
    newArticleObject.createdAt = Date.parse(wellFormattedDate);

    return newArticleObject;
}

export default async function step2_1(url)
{
    let listLinks = [];
    let linkCurrentPage = '/news';
    while (linkCurrentPage != null)
    {
        let responseCurrentPage = await fetch(url + linkCurrentPage);
        let data = await responseCurrentPage.text();
        let $ = load(data);
        
        $('.article-item').each((i, elt) => {
            listLinks.push($(elt).find('a').attr().href);
        });

        linkCurrentPage = null;
        $('.page-link').each((i, elt) => {
            if ($(elt).text().trim() == 'Page suivante')
                linkCurrentPage = $(elt).attr().href;
        });
    }

    let listPromisesArticlesObjects = [];
    for (let href of listLinks)
    {
        listPromisesArticlesObjects.push(fetchNewsInfos(url, href));
    }
    let listArticlesObjects = await Promise.all(listPromisesArticlesObjects);


    listArticlesObjects.sort((firstArticle, secArticle) => {
        return firstArticle.createdAt - secArticle.createdAt;
    });

    // create news.json
    fs.writeFile('./results/news.json', JSON.stringify(listArticlesObjects, null, 4), err => {
        if (err) {
          console.log(err.message);
        }
    });

    step2Analysis(listArticlesObjects);
    return;
}