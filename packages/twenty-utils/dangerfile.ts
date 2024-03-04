import { danger, markdown, schedule, warn } from 'danger';
import todos from 'danger-plugin-todos';

function getMdSection(category: string, message: string) {
  return `# ${category} <br>${message}`;
}

// Check if package.json was changed, but not yarn.lock
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

// Check if .env.example was changed, but not environment variable documentation
const envChanged =
  danger.git.modified_files.find((x) => x.includes('.env.example')) ||
  danger.git.modified_files.find((x) => x.includes('environment.service.ts'));
const envDocsChanged = danger.git.modified_files.includes('self-hosting.mdx');
if (envChanged && !envDocsChanged) {
  const message =
    'Changes were made to the environment variables, but not to the documentation';
  const idea =
    'Please review your changes and check if a change needs to be documented!';
  warn(`${message} - <i>${idea}</i>`);
}

// CLA alert if first time contributor
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

// TODOS / Fixme
schedule(todos());
