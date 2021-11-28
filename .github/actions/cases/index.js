const hyttpo = require('hyttpo').default;
const fs = require('fs');
const glob = require('glob');
const AsciiTable = require('ascii-table');
const core = require('@actions/core');
const github = require('@actions/github');

const getAverage = () => {
    const files = glob.sync('**/**/**/latest.json');
    files.pop();
    
    let PCRcount = 0;
    let AGcount = 0;
    for(const file of files) {
        const content = JSON.parse(fs.readFileSync(file).toString());
        PCRcount += content.PCR.positives_count;
        AGcount = content.AG.positives_count;
    }
    
    return {
        PCR: PCRcount / files.length,
        AG: AGcount / files.length
    }
}

(async() => {
    const github_token = core.getInput('GITHUB_TOKEN', { required: true });
    const octokit = github.getOctokit(github_token);
    require("octokit-commit-multiple-files")(octokit);

    const web = await (await hyttpo.get('https://korona.gov.sk/koronavirus-na-slovensku-v-cislach/')).data;
    let PCR = {
        positives_count: parseInt(web.split('<!-- REPLACE:koronastats-positives-delta -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        negatives_count: parseInt(web.split('<!-- REPLACE:koronastats-lab-tests-delta -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        positivity_rate: parseFloat(web.split('<!-- REPLACE:koronastats-lab-tests-ratio -->')[1].split('<!-- /REPLACE -->')[0].replace(',', '.').replace('%', '').replace(/\s+/g, ''))
    }
    PCR.negatives_count = PCR.negatives_count - PCR.positives_count;

    let hospitalizations = {
        increase: parseInt(web.split('<!-- REPLACE:koronastats-hospitalized-increase -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        total: parseInt(web.split('<!-- REPLACE:koronastats-hospitalized -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        patient: {
            intensive: parseInt(web.split('<!-- REPLACE:koronastats-hospitalized-covid19-intensive -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
            ventilation: parseInt(web.split('<!-- REPLACE:koronastats-hospitalized-covid19-ventilation -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, ''))
        }
    }

    const AG = await (await hyttpo.request({
        url: 'https://data.korona.gov.sk/api/ag-tests/in-slovakia',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })).data.page[0]

    const average = getAverage();

    let table = new AsciiTable('Cases');

    table
        .setHeading('TYPE', '%', 'Positive', 'Negative', 'Average')
        .addRow('AG', AG.positivity_rate, AG.positives_count, AG.negatives_count, average.AG)
        .addRow('PCR', PCR.positivity_rate, PCR.positives_count, PCR.negatives_count, average.PCR)
        .addRow('Total', (AG.positivity_rate + PCR.positivity_rate), (AG.positives_count + PCR.positives_count), (AG.negatives_count + PCR.negatives_count), (average.AG + average.PCR))
    
    let tableHos = new AsciiTable('Hospitalizations');

    tableHos
        .setHeading('TYPE', 'COUNT')
        .addRow('Increase', hospitalizations.increase)
        .addRow('Intensive', hospitalizations.patient.intensive)
        .addRow('Ventilation', hospitalizations.patient.ventilation)
        .addRow('Total', hospitalizations.total)

    let date = new Date();

    let files = {};
    let content = [
        `AG=${AG.positivity_rate},${AG.positives_count},${AG.negatives_count},${average.AG}`,
        `PCR=${PCR.positivity_rate},${PCR.positives_count},${PCR.negatives_count},${average.PCR}`,
        `TOTAL=${(AG.positivity_rate + PCR.positivity_rate)},${(AG.positives_count + PCR.positives_count)},${(AG.negatives_count + PCR.negatives_count)},${(average.AG + average.PCR)}`,
        ``,
        `INCREASE=${hospitalizations.increase}`,
        `INTENSIVE=${hospitalizations.patient.intensive}`,
        `VENTILATION=${hospitalizations.patient.ventilation}`,
        `TOTAL=${hospitalizations.total}`,
        ``,
        table.toString(),
        tableHos.toString()
    ].join('\n');

    AG.average = average.AG;
    PCR.average = average.PCR;
    
    files['latest.txt'] = { contents: content }
    files['latest.json'] = { contents: JSON.stringify({
        AG,
        PCR,
        hospitalizations
    }) }
    files[`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/latest.txt`] = { contents: content }
    files[`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/latest.json`] = { contents: JSON.stringify({
        AG,
        PCR,
        hospitalizations
    }) }

    // Check
    const latestOldContent = await octokit.rest.repos.getContent({
        owner: "xHyroM",
        repo: "covid19-stats",
        path: `latest.json`,
    })

    if(latestOldContent.data.content === Buffer.from(content).toString('base64')) {
        console.log('Any change.')
        return;
    }

    await octokit.rest.repos.createOrUpdateFiles({
        owner: "xHyroM",
        repo: "covid19-stats",
        branch: "master",
        createBranch: false,
        changes: [
          {
            message: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} stats`,
            files: files,
          }
        ],
    });
})();