import { spawnSync } from 'node:child_process';

const MODULE_FORMATS = ['esm', 'commonjs'];

export const runServerRenderingConsumer = ({
  consumerPath,
  flags,
}: {
  consumerPath: string;
  flags: string[];
}) => {
  for (const moduleFormat of MODULE_FORMATS) {
    const result = spawnSync(
      process.execPath,
      [consumerPath, moduleFormat, ...flags],
      { stdio: 'inherit' },
    );

    if (result.status !== 0) {
      throw new Error(
        `Server rendering consumer failed for ${moduleFormat} (${result.signal ?? `exit code ${result.status}`})`,
      );
    }
  }
};
