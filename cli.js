const ProgressBar = require('progress');
const awesomeStars = require('./index');
const program = require('commander');
const fs = require('fs');
const path = require('path');

const packageConfig = fs.readFileSync(path.join(__dirname, 'package.json'));

program
  .version(JSON.parse(packageConfig).version)
  .option('-i, --infile [file]', 'Input file')
  .option('-o, --outfile [file]', 'Output file')
  .option('-u, --username [string]', 'GitHub username')
  .option('-p, --password [string]', 'GitHub password or token')
  .parse(process.argv);

if (program.infile && program.outfile && program.username && program.password) {
  var bar;
  awesomeStars(program.infile, program.outfile, program.username, program.password,
    (count) => {
      if (count) {
        bar = new ProgressBar('Fetching stars: [:bar] :percent', { total: count, width: 30 });
      } else {
        bar.tick();
      }
    });
} else {
  console.error('All parameters are mandatory');
}
