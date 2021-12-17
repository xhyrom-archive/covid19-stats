const hyttpo = require('hyttpo').default;
const fs = require('fs');
const glob = require('glob');
const AsciiTable = require('ascii-table');
const core = require('@actions/core');
const github = require('@actions/github');

Number.prototype.pad = function() {
    return (this < 10 ? '0' : '') + this;
};
const date = new Date();

const getAverage = (AGtoday, PCRtoday, AGTodayNegative, PCRTodayNegative, HospitalizationsToday, AGPositvityToday, PCRPositvityToday) => {
    const files = glob.sync('**/**/**/latest.json');
    files.pop();
    
    let PCRcount = PCRtoday;
    let AGcount = AGtoday;

    let PCRNegativeCount = PCRTodayNegative;
    let AGNegativeCount = AGTodayNegative;

    let HospitalizationsCount = HospitalizationsToday;

    let PCRPositivityrateCount = PCRPositvityToday;
    let AGPositivityrateCount = AGPositvityToday;

    for(const file of files) {
        if(file.includes(`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`)) continue;

        const content = JSON.parse(fs.readFileSync(file).toString());
        PCRcount += content.PCR.positives_count;
        AGcount = content.AG.positives_count;

        PCRNegativeCount += content.PCR.negatives_count;
        AGNegativeCount += content.AG.negatives_count;

        HospitalizationsCount += content.hospitalizations.total;

        PCRPositivityrateCount += parseFloat(content.PCR.positivity_rate);
        AGPositivityrateCount += content.AG.positivity_rate;
    }
    
    return {
        PCR: PCRcount / files.length,
        AG: AGcount / files.length,
        PCRNegative: PCRNegativeCount / files.length,
        AGNegative: AGNegativeCount / files.length,
        Hospitalizations: HospitalizationsCount / files.length,
        PCRPositivityrate: PCRPositivityrateCount / files.length,
        AGPositivityrate: AGPositivityrateCount / files.length
    }
}


const getSlovakiaStatistics = async() => {
    const web = await (await hyttpo.get('https://korona.gov.sk/koronavirus-na-slovensku-v-cislach/')).data;
    let PCR = {
        positives_count: parseInt(web.split('<!-- REPLACE:koronastats-positives-delta -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        negatives_count: parseInt(web.split('<!-- REPLACE:koronastats-lab-tests-delta -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        positivity_rate: parseFloat(web.split('<!-- REPLACE:koronastats-lab-tests-ratio -->')[1].split('<!-- /REPLACE -->')[0].replace(',', '.').replace('%', '').replace(/\s+/g, ''))
    }
    PCR.negatives_count = PCR.negatives_count - PCR.positives_count;

    let hospitalizations = {
        //increase: parseInt(web.split('<!-- REPLACE:koronastats-hospitalized-covid19-increase -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        total: parseInt(web.split('<!-- REPLACE:koronastats-hospitalized-covid19 -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        patient: {
            intensive: parseInt(web.split('<!-- REPLACE:koronastats-hospitalized-covid19-intensive -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
            ventilation: parseInt(web.split('<!-- REPLACE:koronastats-hospitalized-covid19-ventilation -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, ''))
        }
    }

    for(const line of web.split('\n')) {
        if(line.includes('class="govuk-heading-l govuk-!-margin-bottom-')) {
            const lin = line.split('class="govuk-heading-l govuk-!-margin-bottom-')[1].split('</h')[0];
            if(lin.includes('2">') && !lin.includes('REPLACE')) {
                if(isNaN(parseInt(line.split('2">')[1].split('</h2>')[0]))) hospitalizations.increase = 0;
                else hospitalizations.increase = parseInt(line.split('2">')[1].split('</h2>')[0]);
            }
            //else if(lin.includes('3">') && !lin.includes('REPLACE')) hospitalizations.total = parseInt(line.split('3">')[1]);
        }
    }

    const AG = await (await hyttpo.request({
        url: 'https://data.korona.gov.sk/api/ag-tests/in-slovakia',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })).data.page[0]

    const average = getAverage(AG.positives_count, PCR.positives_count, AG.negatives_count, PCR.negatives_count, hospitalizations.total, AG.positivity_rate, PCR.positivity_rate);

    let table = new AsciiTable('Cases');

    table
        .setHeading('TYPE', '%', 'Positive', 'Negative', 'Average', 'Negative Average')
        .addRow('AG', AG.positivity_rate, AG.positives_count, AG.negatives_count, average.AG, average.AGNegative)
        .addRow('PCR', PCR.positivity_rate, PCR.positives_count, PCR.negatives_count, average.PCR, average.PCRNegative)
        .addRow('Total', (AG.positivity_rate + PCR.positivity_rate), (AG.positives_count + PCR.positives_count), (AG.negatives_count + PCR.negatives_count), (average.AG + average.PCR), (average.AGNegative + average.PCRNegative))
    
    let tableHos = new AsciiTable('Hospitalizations');

    tableHos
        .setHeading('TYPE', 'COUNT')
        .addRow('Increase', hospitalizations.increase)
        .addRow('Intensive', hospitalizations.patient.intensive)
        .addRow('Ventilation', hospitalizations.patient.ventilation)
        .addRow('Average', average.Hospitalizations)
        .addRow('Total', hospitalizations.total)

    let files = {};
    let content = [
        `AG=${AG.positivity_rate},${AG.positives_count},${AG.negatives_count},${average.AG},${average.AGNegative},${average.AGPositivityrate}`,
        `PCR=${PCR.positivity_rate},${PCR.positives_count},${PCR.negatives_count},${average.PCR},${average.PCRNegative},${average.PCRPositivityrate}`,
        `TOTAL=${(AG.positivity_rate + PCR.positivity_rate)},${(AG.positives_count + PCR.positives_count)},${(AG.negatives_count + PCR.negatives_count)},${(average.AG + average.PCR)},${(average.AGNegative + average.PCRNegative)},${(average.AGPositivityrate + average.PCRPositivityrate)}`,
        ``,
        `INCREASE=${hospitalizations.increase}`,
        `INTENSIVE=${hospitalizations.patient.intensive}`,
        `VENTILATION=${hospitalizations.patient.ventilation}`,
        `AVERAGE=${average.Hospitalizations}`,
        `TOTAL=${hospitalizations.total}`,
        ``,
        table.toString(),
        tableHos.toString()
    ].join('\n');

    AG.average = average.AG;
    PCR.average = average.PCR;

    AG.negatives_average = average.AGNegative;
    PCR.negatives_average = average.PCRNegative;

    AG.positivity_rate_average = average.AGPositivityrate;
    PCR.positivity_rate_average = average.PCRPositivityrate;

    hospitalizations.average = average.Hospitalizations;
    
    files['states/Slovakia/latest.txt'] = { contents: content }
    files['states/Slovakia/latest.json'] = { contents: JSON.stringify({
        AG,
        PCR,
        hospitalizations
    }) }
    files[`states/Slovakia/${(date.getFullYear()).pad()}/${(date.getMonth() + 1).pad()}/${(date.getDate()).pad()}/latest.txt`] = { contents: content }
    files[`states/Slovakia/${(date.getFullYear()).pad()}/${(date.getMonth() + 1).pad()}/${(date.getDate()).pad()}/latest.json`] = { contents: JSON.stringify({
        AG,
        PCR,
        hospitalizations
    }) }

    return files;
}

const getCzechiaStatistics = async() => {
    let tests = await hyttpo.request({
        method: 'GET',
        url: `https://onemocneni-aktualne.mzcr.cz/api/v3/zakladni-prehled?apiToken=${process.env.apiToken}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })

    let hospitalizations = await hyttpo.request({
        method: 'GET',
        url: `https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/hospitalizace.json`,
        headers: {
            'Content-Type': 'application/json'
        }
    })

    tests = tests.data['hydra:member'].filter(d => d.datum.includes(`${date.getFullYear().pad()}-${(date.getMonth() + 1).pad()}-${date.getDate().pad(1)}`))[0];
    hospitalizations = hospitalizations.data.data.filter(d => d.datum.includes(`${date.getFullYear().pad()}-${date.getDate().pad(1)}-${(date.getMonth() + 1).pad()}`))[0];

    let PCR = {
        positives_count: tests.potvrzene_pripady_vcerejsi_den,
        negatives_count: NaN,
        positivity_rate: NaN
    }

    let AG = {
        positives_count: NaN,
        negatives_count: NaN,
        positivity_rate: NaN
    }

    hospitalizations = {
        total: tests.aktualne_hospitalizovani,
        increase: NaN,
        patient: {
            intensive: hospitalizations && hospitalizations.jip || 0,
            ventilation: hospitalizations && hospitalizations.kyslik || 0
        }
    }

    const average = getAverage(AG.positives_count, PCR.positives_count, AG.negatives_count, PCR.negatives_count, hospitalizations.total, AG.positivity_rate, PCR.positivity_rate);

    let table = new AsciiTable('Cases');

    table
        .setHeading('TYPE', '%', 'Positive', 'Negative', 'Average', 'Negative Average')
        .addRow('AG', AG.positivity_rate, AG.positives_count, AG.negatives_count, average.AG, average.AGNegative)
        .addRow('PCR', PCR.positivity_rate, PCR.positives_count, PCR.negatives_count, average.PCR, average.PCRNegative)
        .addRow('Total', (AG.positivity_rate + PCR.positivity_rate), (AG.positives_count + PCR.positives_count), (AG.negatives_count + PCR.negatives_count), (average.AG + average.PCR), (average.AGNegative + average.PCRNegative))
    
    let tableHos = new AsciiTable('Hospitalizations');

    tableHos
        .setHeading('TYPE', 'COUNT')
        .addRow('Increase', hospitalizations.increase)
        .addRow('Intensive', hospitalizations.patient.intensive)
        .addRow('Ventilation', hospitalizations.patient.ventilation)
        .addRow('Average', average.Hospitalizations)
        .addRow('Total', hospitalizations.total)

    let files = {};
    let content = [
        `AG=${AG.positivity_rate},${AG.positives_count},${AG.negatives_count},${average.AG},${average.AGNegative},${average.AGPositivityrate}`,
        `PCR=${PCR.positivity_rate},${PCR.positives_count},${PCR.negatives_count},${average.PCR},${average.PCRNegative},${average.PCRPositivityrate}`,
        `TOTAL=${(AG.positivity_rate + PCR.positivity_rate)},${(AG.positives_count + PCR.positives_count)},${(AG.negatives_count + PCR.negatives_count)},${(average.AG + average.PCR)},${(average.AGNegative + average.PCRNegative)},${(average.AGPositivityrate + average.PCRPositivityrate)}`,
        ``,
        `INCREASE=${hospitalizations.increase}`,
        `INTENSIVE=${hospitalizations.patient.intensive}`,
        `VENTILATION=${hospitalizations.patient.ventilation}`,
        `AVERAGE=${average.Hospitalizations}`,
        `TOTAL=${hospitalizations.total}`,
        ``,
        table.toString(),
        tableHos.toString()
    ].join('\n');

    AG.average = average.AG;
    PCR.average = average.PCR;

    AG.negatives_average = average.AGNegative;
    PCR.negatives_average = average.PCRNegative;

    AG.positivity_rate_average = average.AGPositivityrate;
    PCR.positivity_rate_average = average.PCRPositivityrate;

    hospitalizations.average = average.Hospitalizations;
    
    files['states/Czechia/latest.txt'] = { contents: content }
    files['states/Czechia/latest.json'] = { contents: JSON.stringify({
        AG,
        PCR,
        hospitalizations
    }) }
    files[`states/Czechia/${(date.getFullYear()).pad()}/${(date.getMonth() + 1).pad()}/${(date.getDate()).pad()}/latest.txt`] = { contents: content }
    files[`states/Czechia/${(date.getFullYear()).pad()}/${(date.getMonth() + 1).pad()}/${(date.getDate()).pad()}/latest.json`] = { contents: JSON.stringify({
        AG,
        PCR,
        hospitalizations
    }) }

    return files;
}

(async() => {
    const github_token = core.getInput('GITHUB_TOKEN', { required: true });
    const octokit = github.getOctokit(github_token);
    require("octokit-commit-multiple-files")(octokit);

    let globalFiles = {};
    const slovakiaFiles = await getSlovakiaStatistics();
    const czechiaFiles = await getCzechiaStatistics();

    globalFiles = { ...slovakiaFiles, ...czechiaFiles }

    await octokit.rest.repos.createOrUpdateFiles({
        owner: "xHyroM",
        repo: "covid19-stats",
        branch: "master",
        createBranch: false,
        changes: [
          {
            message: `${(date.getFullYear()).pad()}/${(date.getMonth() + 1).pad()}/${(date.getDate()).pad()} stats`,
            files: globalFiles,
          }
        ],
    });
})();