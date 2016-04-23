const fs = require('fs');
const Q = require('q');
const stringReplaceAsync = require('string-replace-async');
const throat = require('throat');
const GitHubApi = require('github');

// create the pattern for matching the markdown links to github repos
const titlePattern = '(?:\\*\\*)?([^)^★]*)(?: ★[,0-9]+)?(?:\\*\\*)?';
const orgOrUserPattern = '[\\w-_]*';
const repoPattern = '[\\w-_\\.]*';
const rs = '([-*+]{1}) \\[' + titlePattern + '\\]\\(https:\/\/github.com\/(' + orgOrUserPattern + ')\/(' + repoPattern + ')\\)';
const regex = new RegExp(rs, 'g');

const sideEffect = side => d => {
  side();
  return d;
};

const formatNumber = (x) =>
    x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const debugStarCount = throat(2, (orgOrUser, repo) => {
  return new Promise((res, rej) => {
    setTimeout(() => res({
      orgOrUser: orgOrUser,
      repo: repo,
      stars: 25
    }), Math.random() * 100);
  });
});

const DEFAULT_CONFIG = {
  progress: () => {},
  emboldenCount: 0
};

module.exports = (markdown, config) => {

  config = Object.assign({}, DEFAULT_CONFIG, config);

  const github = new GitHubApi({
      version: '3.0.0'
  });
  github.authenticate({
      type: 'basic',
      username: config.username,
      password: config.password
  });

  const starCount = throat(2, (orgOrUser, repo) =>
    Q.nfcall(github.repos.get, {
      user: orgOrUser,
      repo: repo
    })
    .then(repoData => {
      return {
        orgOrUser: repoData.owner.login,
        repo: repoData.name,
        stars: repoData.stargazers_count || 0
      };
    })
  );

  const formatLink = (bullet, title, stars) => {
    const formattedStars = formatNumber(stars.stars);
    const link = '(https://github.com/' + stars.orgOrUser + '/' + stars.repo + ')';
    const fomattedTitle = config.emboldenCount > 0 && stars.stars > config.emboldenCount
      ? '[**' + title + ' ★' + formattedStars + '**]'
      : '[' + title + ' ★' + formattedStars + ']';
    return bullet + ' ' + fomattedTitle + link;
  };

  const matchCount = markdown.match(regex).length;
  config.progress(matchCount);

  const replacer = (match, bullet, title, orgOrUser, repo) =>
      starCount(orgOrUser, repo)
        .then(stars => sideEffect(config.progress)(stars))
        .then(stars => formatLink(bullet, title, stars))
        .catch(err => {
          console.error(err);
          return match;
        });

  return stringReplaceAsync(markdown, regex, replacer);
};
