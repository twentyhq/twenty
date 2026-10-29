import { resolve } from 'node:path';
import builder from './helpers.cjs';

export const handler = (input) =>
  builder.executeFrontComponentBuilderRequest({
    input,
    yarnEngineDirectory: resolve('yarn-engine'),
  });
