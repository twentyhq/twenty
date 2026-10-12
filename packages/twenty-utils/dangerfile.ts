import { danger, markdown, schedule, warn } from 'danger';
import todos from 'danger-plugin-todos';

function getMdSection(category: string, message: string) {
  return `# ${category} <br>${message}`;
}

const packageChanged = danger.git.modified_files.find((x) =>
  x.includes('package.json'),
);
const lockfileChanged = danger.git.modified_files.find((x) =>
  x.includes('yarn.lock'),
);
if (packageChanged && !lockfileChanged) {
  const message = 'Changes were made to package.json, but not to yarn.lock';
  const idea = 'Perhaps you need to run `yarn install`?';
  warn(`${message} - <i>${idea}</i>`);
}

const envExampleChanged = danger.git.modified_files.find((x) => 
  x.includes('.env.example')
);

if (envExampleChanged) {
  const message = 'Changes were made to .env.example';
  const idea = 'Please make sure any new environment variables are properly documented with metadata in config-variables.ts';
  warn(`${message} - <i>${idea}</i>`);
}

if (
  danger.github &&
  danger.github.pr &&
  (danger.github.pr.author_association === 'FIRST_TIME_CONTRIBUTOR' ||
    danger.github.pr.author_association === 'NONE')
) {
  markdown(
    getMdSection(
      'Welcome!',
      `
Hello there, congrats on your first PR! We're excited to have you contributing to this project.
By submitting your Pull Request, you acknowledge that you agree with the terms of our [Contributor License Agreement](https://github.com/twentyhq/twenty/blob/main/.github/CLA.md).`,
    ),
  );
}

schedule(todos());
