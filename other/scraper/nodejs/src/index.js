const hyttpo = require('hyttpo');
const Data = require('./structures/Data');
const { getPath } = require('./structures/Utils');

class Scraper {
    /**
     * Get everything
     * @param {CountryList} country
     * @param {ScraperDate} path 
     */
    static getAll = async(country, path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/states/${country}/${path}`)
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
     * @param {CountryList} country
     * @param {ScraperDate} path 
     */
    static getCases = async(country, path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/states/${country}/${path}`)
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
     * @param {CountryList} country
     * @param {ScraperDate} path 
     */
     static getPositivityRate = async(country, path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/states/${country}/${path}`)
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
     * @param {CountryList} country
     * @param {ScraperDate} path 
     */
     static getAverage = async(country, path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/states/${country}/${path}`)
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
     * @param {CountryList} country
     * @param {ScraperDate} path 
     */
    static getHospitalizations = async(country, path) => {
        if(!path) path = 'latest.json';
        else path = getPath(path);

        return await (async() => new Promise((resolve, reject) => {
            hyttpo.get(`https://xhyrom.github.io/covid19-stats/states/${country}/${path}`)
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