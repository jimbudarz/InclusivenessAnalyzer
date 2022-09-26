const logger = require("./logger");
const params = require("./params");

// This module will contain platform specific methods that are either specific to GitHub or Azure DevOps

function getWorkingDirectory(){
    return process.env.GITHUB_WORKSPACE;
}

// Azure DevOps supports three states. This method allows custom logic for ADO.
function logBuildFailure(){
    // `failStep` input defined in action metadata file
    const failOnNonInclusiveTermParam = params.readBoolean('failOnNonInclusiveTerm', false);
    
    if (failOnNonInclusiveTermParam){
        logger.info("- Failing if non-inclusive term is found");
        logger.fail("Found non inclusive terms in some files.");
    }
}

module.exports = { getWorkingDirectory, logBuildFailure };