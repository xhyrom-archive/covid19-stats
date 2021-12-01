const hyttpo = require('hyttpo');
const Data = require('./structures/Data');
const { getPath } = require('./structures/Utils');

class Scraper {
    /**
     * Get everything
     * @param {ScraperDate} path 
     */
    static getAll = async(path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/${path}`)
                .catch(e => {
                    resolve({ error: e.statusCode, message: e.statusText });
                })
                .then(({ data }) => {
                    const cases = new Data(data).getAll();
                    resolve(cases);
                })
        }))();
    }    

    /**
     * Get new cases
     * @param {ScraperDate} path 
     */
    static getCases = async(path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/${path}`)
                .catch(e => {
                    resolve({ error: e.statusCode, message: e.statusText });
                })
                .then(({ data }) => {
                    const cases = new Data(data).getCases();
                    resolve(cases);
                })
        }))();
    }

    /**
     * Get positivity rate
     * @param {ScraperDate} path 
     */
     static getPositivityRate = async(path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/${path}`)
                .catch(e => {
                    resolve({ error: e.statusCode, message: e.statusText });
                })
                .then(({ data }) => {
                    const cases = new Data(data).getPositivityRate();
                    resolve(cases);
                })
        }))();
    }

    /**
     * Get average
     * @param {ScraperDate} path 
     */
     static getAverage = async(path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/${path}`)
                .catch(e => {
                    resolve({ error: e.statusCode, message: e.statusText });
                })
                .then(({ data }) => {
                    const cases = new Data(data).getAverage();
                    resolve(cases);
                })
        }))();
    }

    /**
     * Get hospitalizations
     * @param {ScraperDate} path 
     */
    static getHospitalizations = async(path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/${path}`)
                .catch(e => {
                    resolve({ error: e.statusCode, message: e.statusText });
                })
                .then(({ data }) => {
                    const cases = new Data(data).getHospitalizations();
                    resolve(cases);
                })
        }))();
    }
}

module.exports = Scraper;