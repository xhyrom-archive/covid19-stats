const fs = require('fs');
const glob = require('glob');
const core = require('@actions/core');
const github = require('@actions/github');

const getAverage = () => {
    const files = glob.sync('**/**/**/latest.json');
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

        PCRPositivityrateCount += content.PCR.positivity_rate;
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

    const average = getAverage();
    const latest = JSON.parse(fs.readFileSync('latest.json').toString());

    const content = [
        `**POSITIVITY RATE**`,
        `PCR: ${latest.PCR.positivity_rate}, AG: ${latest.AG.positivity_rate}`,
        `(Average) PCR: ${average.PCRPositivityrate}, AG: ${average.AGPositivityrate}`,
        ``,
        `**NEW CASES**`,
        `PCR: ${latest.PCR.positives_count}, AG: ${latest.AG.positives_count}`,
        `(Average) PCR: ${average.PCR}, AG: ${average.AG}`,
        ``,
        `**NEGATIVE CASES**`,
        `PCR: ${latest.PCR.negatives_count}, AG: ${latest.AG.negatives_count}`,
        `(Average) PCR: ${average.PCRNegative}, AG: ${average.AGNegative}`,
        ``,
        `**HOSPITALIZATIONS`,
        `Increase: ${latest.hospitalizations.increase}`,
        `Intensive: ${latest.hospitalizations.patient.intensive}`,
        `Ventilation: ${latest.hospitalizations.patient.ventilation}`,
        `Average: ${average.Hospitalizations}`,
        `Total: ${latest.hospitalizations.total}`
    ].join('\n');

    await octokit.rest.repos.createCommitComment({
        owner,
        repo,
        commit_sha: commit.data.sha,
        body: content
    })
})();