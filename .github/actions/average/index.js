const fs = require('fs');
const glob = require('glob');
const core = require('@actions/core');
const github = require('@actions/github');

const getAverage = (path) => {
    const files = glob.sync(path);
    files.pop();
    
    let PCRcount = 0;
    let AGcount = 0;

    let PCRNegativeCount = 0;
    let AGNegativeCount = 0;

    let HospitalizationsCount = 0;

    let PCRPositivityrateCount = 0;
    let AGPositivityrateCount = 0;

    for(const file of files) {
        const content = JSON.parse(fs.readFileSync(file).toString());
        PCRcount += content.PCR.positives_count;
        AGcount += content.AG.positives_count;

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
        AGPositivityrate: AGPositivityrateCount / files.length,
    }
}

(async() => {
    const github_token = core.getInput('GITHUB_TOKEN', { required: true });
    const octokit = github.getOctokit(github_token);
    
    const { owner, repo } = github.context.repo;

    if (github.context.eventName !== "push") return;

    const payload = github.context.payload;
    const commitSha = payload.after;

    const commit = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commitSha
    })

    const averageSK = getAverage(`states/Slovakia/**/**/**/latest.json`);
    const latestSK = JSON.parse(fs.readFileSync('states/Slovakia/latest.json').toString());

    const averageCZ = getAverage(`states/Czechia/**/**/**/latest.json`);
    const latestCZ = JSON.parse(fs.readFileSync('states/Czechia/latest.json').toString());

    const content = [
        `**SLOVAKIA**`,
        ``,
        `**POSITIVITY RATE**`,
        `PCR: ${latestSK.PCR.positivity_rate}, AG: ${latestSK.AG.positivity_rate}`,
        `(Average) PCR: ${averageSK.PCRPositivityrate}, AG: ${averageSK.AGPositivityrate}`,
        ``,
        `**NEW CASES**`,
        `PCR: ${latestSK.PCR.positives_count}, AG: ${latestSK.AG.positives_count}`,
        `(Average) PCR: ${averageSK.PCR}, AG: ${averageSK.AG}`,
        ``,
        `**NEGATIVE CASES**`,
        `PCR: ${latestSK.PCR.negatives_count}, AG: ${latestSK.AG.negatives_count}`,
        `(Average) PCR: ${averageSK.PCRNegative}, AG: ${averageSK.AGNegative}`,
        ``,
        `**HOSPITALIZATIONS**`,
        `Increase: ${latestSK.hospitalizations.increase}`,
        `Intensive: ${latestSK.hospitalizations.patient.intensive}`,
        `Ventilation: ${latestSK.hospitalizations.patient.ventilation}`,
        `Average: ${averageSK.Hospitalizations}`,
        `Total: ${latestSK.hospitalizations.total}`,
        ``,
        `**CZECHIA**`,
        ``,
        `**POSITIVITY RATE**`,
        `PCR: ${latestCZ.PCR.positivity_rate}, AG: ${latestCZ.AG.positivity_rate}`,
        `(Average) PCR: ${averageCZ.PCRPositivityrate}, AG: ${averageCZ.AGPositivityrate}`,
        ``,
        `**NEW CASES**`,
        `PCR: ${latestCZ.PCR.positives_count}, AG: ${latestCZ.AG.positives_count}`,
        `(Average) PCR: ${averageCZ.PCR}, AG: ${averageCZ.AG}`,
        ``,
        `**NEGATIVE CASES**`,
        `PCR: ${latestCZ.PCR.negatives_count}, AG: ${latestCZ.AG.negatives_count}`,
        `(Average) PCR: ${averageCZ.PCRNegative}, AG: ${averageCZ.AGNegative}`,
        ``,
        `**HOSPITALIZATIONS**`,
        `Increase: ${latestCZ.hospitalizations.increase}`,
        `Intensive: ${latestCZ.hospitalizations.patient.intensive}`,
        `Ventilation: ${latestCZ.hospitalizations.patient.ventilation}`,
        `Average: ${averageCZ.Hospitalizations}`,
        `Total: ${latestCZ.hospitalizations.total}`
    ].join('\n');

    await octokit.rest.repos.createCommitComment({
        owner,
        repo,
        commit_sha: commit.data.sha,
        body: content
    })
})();