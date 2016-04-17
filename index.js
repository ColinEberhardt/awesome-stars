const fs = require('fs')
const rp = require('request-promise');
const Q = require('q');
const stringReplaceAsync = require('string-replace-async');
const throat = require('throat');
const GitHubApi = require('github');

// create the pattern for matching the markdown links to github repos
const titlePattern = '[^\)]*(★ [0-9]+])?';
const orgOrUserPattern = '[\\w-_]*';
const repoPattern = '[\\w-_]*';
const rs = '\\[(' + titlePattern + ')\\]\\(https:\/\/github.com\/(' + orgOrUserPattern + ')\/(' + repoPattern + ')\\)';
const regex = new RegExp(rs, 'g');

const sideEffect = side => d => {
  side()
  return d;
};

module.exports = (inputFile, outputFile, ghUsername, ghPassword, progress) => {

  const github = new GitHubApi({
      version: '3.0.0'
  });
  github.authenticate({
      type: 'basic',
      username: ghUsername,
      password: ghPassword
  });

  const starCount = throat(2, (orgOrUser, repo, cb) =>
    Q.nfcall(github.repos.get, {
      user: orgOrUser,
      repo: repo
    })
    .then((repoData) => {
      if (!repoData.stargazers_count) {
        throw new Error('No stargazer count available :-(')
      }
      return repoData.stargazers_count;
    })
  );

  const debugStarCount = throat(2, (orgOrUser, repo) => {
    return new Promise((res, rej) => {
      setTimeout(() => res(25), Math.random() * 100);
    });
  });

  return Q.nfcall(fs.readFile, inputFile, 'utf8')
    .then((data) => {
      const matchCount = data.match(regex).length;
      progress(matchCount);

      const replacer = (match, title, _, orgOrUser, repo, __, ___, done) =>
          debugStarCount(orgOrUser, repo)
            .then((stars) => sideEffect(progress)(stars))
            .then((stars) => '[' + title + ' ★ ' + stars + '](https://github.com/' + orgOrUser + '/' + repo + ')')
            .catch((err) => match);

      return stringReplaceAsync(data, regex, replacer);
    })
    .then((markdown) => Q.nfcall(fs.writeFile, outputFile, markdown))
    .catch((err) => {
      console.error(err);
    });
}
