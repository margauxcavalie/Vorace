import fs from 'fs';

export default function step2Analysis(listDetailsNews)
{
    let setAuthors = new Set();
    for (let news of listDetailsNews)
    {
        setAuthors.add(news.author);
    }

    let authorNews = [];
    let listNumberOfCookies = [];
    for (let author of setAuthors)
    {
        // authors & news
        let numberOfNews = listDetailsNews.reduce((accumulator, currentNews) => {
            if (currentNews.author === author)
                return accumulator + 1; 
            return accumulator;
        }, 0);
        let newAuthorData = [author, numberOfNews];
        authorNews.push(newAuthorData);

        // use of word 'cookie'/'cookies'
        let numberOfCookies = listDetailsNews.filter(news => news.author === author)
            .reduce((accumulator, currentNews) => {
                let counterCookie = (currentNews.content.match(/\bcookie[s]?\b/gi) || []).length;
                return accumulator + counterCookie;
            }, 0);

        listNumberOfCookies.push(numberOfCookies);
    }

    // get greatest number of cookies
    const maxCookie = Math.max(...listNumberOfCookies);
    const indexMaxCookie = listNumberOfCookies.indexOf(maxCookie);
    let mostCookieAuthor = authorNews[indexMaxCookie][0];

    authorNews.sort((first, sec) => {
        if (first[1] > sec[1])
            return -1;
        if (first[1] < sec[1])
            return 1;
        return first[0].localeCompare(sec[0]);
    });

    let result = {
        authorNews: authorNews,
        mostCookieAuthor: mostCookieAuthor
    }

    // create news_analysis.json
    fs.writeFile('./results/news_analysis.json', JSON.stringify(result, null, 4), err => {
        if (err) {
          console.log(err.message);
        }
    });

    return;
}