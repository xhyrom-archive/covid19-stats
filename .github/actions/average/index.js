const fs = require('fs');
const glob = require('glob');
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
        `(NEW CASES) PCR: ${latest.PCR.positives_count}, AG: ${latest.AG.positives_count}`
        `(AVERAGE) PCR: ${average.PCR}, AG: ${average.AG}`,
    ].join('\n');

    await octokit.rest.repos.createCommitComment({
        owner,
        repo,
        commit_sha: commit.data.sha,
        body: content
    })
})();