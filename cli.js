const ProgressBar = require('progress');
const awesomeStars = require('./index');
const program = require('commander');
const fs = require('fs');
const path = require('path');
const Q = require('q');

const packageConfig = fs.readFileSync(path.join(__dirname, 'package.json'));

program
  .version(JSON.parse(packageConfig).version)
  .option('-i, --infile [file]', 'Input file')
  .option('-o, --outfile [file]', 'Output file')
  .option('-u, --username [string]', 'GitHub username')
  .option('-p, --password [string]', 'GitHub password or token')
  .parse(process.argv);

if (!program.infile || !program.outfile || !program.username || !program.password) {
  console.error('All parameters are mandatory');
  process.exit()
}

Q.nfcall(fs.readFile, program.infile, 'utf8')
  .then(markdown => {
    var bar;
    return awesomeStars(markdown, program.username, program.password,
      (count) => {
        if (count) {
          bar = new ProgressBar('Fetching stars: [:bar] :percent', { total: count, width: 30 });
        } else {
          bar.tick();
        }
      });
  })
  .then(transformedMarkdown => Q.nfcall(fs.writeFile, program.outfile, transformedMarkdown))
  .catch(err => console.error(err));
