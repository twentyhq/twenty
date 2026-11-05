import { toTwentyOrmException } from 'src/engine/twenty-orm/utils/to-twenty-orm-exception.util';
import {
  type CompiledStatement,
  compileNamedParameters,
} from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

export const compileTwentyOrmStatement = (
  ...args: Parameters<typeof compileNamedParameters>
): CompiledStatement => {
  try {
    return compileNamedParameters(...args);
  } catch (error) {
    throw toTwentyOrmException(error);
  }
};
