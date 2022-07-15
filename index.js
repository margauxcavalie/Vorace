import fs from 'fs';
const SERVER_URL = process.env.SERVER_URL;
import step1 from './step1.js'
import step2Infos from './step2Infos.js';
import step3Infos from './step3Infos.js';

export default async function executeSteps(url) {
    try { // create folder for results
        if (!fs.existsSync('./results'))
            fs.mkdirSync('./results');
    } catch (error) {
        console.log(error.message);
    }

    step1(url);
    step2Infos(url);
    step3Infos(url);
}

executeSteps(SERVER_URL);
