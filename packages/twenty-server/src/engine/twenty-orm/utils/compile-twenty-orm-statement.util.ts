import { toTwentyOrmException } from 'src/engine/twenty-orm/utils/to-twenty-orm-exception.util';
import {
  type CompiledStatement,
  type NamedParameters,
  compileNamedParameters,
} from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

export const compileTwentyOrmStatement = ({
  sql,
  parameters,
}: {
  sql: string;
  parameters: NamedParameters;
}): CompiledStatement => {
  try {
    return compileNamedParameters(sql, parameters);
  } catch (error) {
    throw toTwentyOrmException(error);
  }
};
