import {message, danger, warn} from "danger"



// Check if package.json was changed, but not yarn.lock
const packageChanged = danger.git.modified_files.includes('package.json');
const lockfileChanged = danger.git.modified_files.includes('yarn.lock');
if (packageChanged && !lockfileChanged) {
  const message = 'Changes were made to package.json, but not to yarn.lock';
  const idea = 'Perhaps you need to run `yarn install`?';
  warn(`${message} - <i>${idea}</i>`);
}

// Check if .env.example was changed, but not enviroment variable documentation
const envChanged = danger.git.modified_files.includes('.env.example') || danger.git.modified_files.includes('environment.service.ts');
const envDocsChanged = danger.git.modified_files.includes('enviroment-variables.mdx');
if (envChanged && !envDocsChanged) {
  const message = 'Changes were made to the enviroment variables, but not to the documentation';
  const idea = 'Please review your changes and check if a change needs to be documented!';
  warn(`${message} - <i>${idea}</i>`);
}


// CLA alert if first time contributor
if(danger.github.pr.author_association === 'FIRST_TIME_CONTRIBUTOR' || danger.github.pr.author_association === 'NONE') {
  message(`Hello there and welcome to our project!`)
  message(`By submitting your Pull Request, you acknowledge that you agree with the terms of our [Contributor License Agreement](https://github.com/twentyhq/twenty/blob/main/.github/CLA.md).`)
  message(`Although we don't have a dedicated legal counsel, having this kind of agreement can protect us from potential legal issues or patent trolls.`)
  message(`Thank you for your understanding.`)
}