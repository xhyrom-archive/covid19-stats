const hyttpo = require('hyttpo').default;
const fs = require('fs');
const AsciiTable = require('ascii-table');
const core = require('@actions/core');
const github = require('@actions/github');

(async() => {
    const github_token = core.getInput('GITHUB_TOKEN', { required: true });
    const octokit = github.getOctokit(github_token);
    require("octokit-commit-multiple-files")(octokit);

    const web = await (await hyttpo.get('https://korona.gov.sk/koronavirus-na-slovensku-v-cislach/')).data;
    let PCR = {
        positives_count: parseInt(web.split('<!-- REPLACE:koronastats-positives-delta -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        negatives_count: parseInt(web.split('<!-- REPLACE:koronastats-lab-tests-delta -->')[1].split('<!-- /REPLACE -->')[0].replace(/\s+/g, '')),
        positivity_rate: web.split('<!-- REPLACE:koronastats-lab-tests-ratio -->')[1].split('<!-- /REPLACE -->')[0].replace(',', '.').replace('%', '').replace(/\s+/g, '')
    }
    PCR.negatives_count = PCR.negatives_count - PCR.positives_count;

    const AG = await (await hyttpo.request({
        url: 'https://data.korona.gov.sk/api/ag-tests/in-slovakia',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })).data.page[0]

    let table = new AsciiTable('Cases');

    table
        .setHeading('TYP', '%', 'Positive', 'Negative')
        .addRow('AG', AG.positivity_rate, AG.positives_count, AG.negatives_count)
        .addRow('PCR', PCR.positivity_rate, PCR.positives_count, PCR.negatives_count)
        .addRow('Total', AG.positivity_rate + PCR.positivity_rate, AG.positives_count + PCR.positives_count, AG.negatives_count + PCR.negatives_count)

    let date = new Date();

    let files = {};
    files['latest.txt'] = { contents: table.toString() }
    files[`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/latest.txt`] = { contents: table.toString() }

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