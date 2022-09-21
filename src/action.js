const getNonInclusiveTerms = require("./non-inclusive-terms");
const getFilesFromDirectory = require("./read-files");
const checkFileForPhrase = require("./file-content");

const logger = require("./logger");
const params = require("./params");

async function run() {
  try {
    // `failStep` input defined in action metadata file
    const failStep = params.read('failStep');

    // `exclude-words` input defined in action metadata file
    const excludeTerms = params.read('excludeterms');
    var exclusions = excludeTerms.split(',');
    if (excludeTerms !== '')
      logger.info(`Excluding terms: ${exclusions}`);

    var passed = true;

    const dir = process.env.GITHUB_WORKSPACE;
    //const dir = `C:/Temp`;
    //const dir = process.cwd().replaceAll("\\", "/");

    const nonInclusiveTerms = await getNonInclusiveTerms();

    // list all files in the directory
    var filenames = getFilesFromDirectory(dir);

    filenames.forEach(filename => {
      logger.debug(`Scanning file: ${filename}`);
      //core.startGroup(`Scanning file: ${filename}`);

      nonInclusiveTerms.forEach(phrase => {
        if (!exclusions.includes(phrase.term)) {
          var lines = checkFileForPhrase(filename, phrase.term);

          if (lines.length > 0) {
            // The Action should fail
            passed = false;

            //core.warning(`Found the term '${phrase.term}', consider using alternatives: ${phrase.alternatives}`);
            lines.forEach(line => {
              logger.warn(`File:  ${line.file} Line: ${line.number}\n\r${line.content}`, line.file, line.number, 0, `Found the term '${phrase.term}', consider using alternatives: ${phrase.alternatives}`);
              //core.warning(`\t[Line ${line.number}] ${line.content}`, { file: line.file, startLine: line.number.toString(), startColumn: 3, title: `Found the term '${phrase.term}', consider using alternatives: ${phrase.alternatives}` });
            });
          }
        }
        else
        logger.debug(`Skipping the term: '${phrase.term}'`);
      });

      //core.endGroup();
    });

    if (!passed)
      if (failStep === 'true')
        logger.fail("Found non inclusive terms in some files.");
      //else
      //  logger.warn("Found non inclusive terms in some files.");

  } catch (error) {
    logger.fail(error.message);
  }
}

run();