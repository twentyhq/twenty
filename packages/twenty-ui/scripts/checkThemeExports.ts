import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

for (const inputType of ['module', 'commonjs']) {
  const importTheme =
    inputType === 'module'
      ? "import * as theme from 'twenty-ui/theme';"
      : "const theme = require('twenty-ui/theme');";
  const result = spawnSync(
    process.execPath,
    [
      '--conditions=react-server',
      `--input-type=${inputType}`,
      '--eval',
      `${importTheme}
        if (!theme.THEME_LIGHT || !theme.THEME_DARK || !theme.themeCssVariables) {
          throw new Error('Static theme exports are missing');
        }
        if ('ThemeContext' in theme || 'ThemeScopeContext' in theme) {
          throw new Error('Theme contexts must remain private');
        }
      `,
    ],
    { cwd: packageRoot, stdio: 'inherit' },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
