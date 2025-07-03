import psl, { ParsedDomain } from 'psl';
import { isDefined } from 'twenty-shared/utils';

export const isParsedDomain = (
  result: ReturnType<typeof psl.parse>,
): result is ParsedDomain =>
  !isDefined(result.error) &&
  Object.prototype.hasOwnProperty.call(result, 'sld');
