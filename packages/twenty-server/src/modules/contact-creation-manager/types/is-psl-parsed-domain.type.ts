import { type parse as pslParse, type ParsedDomain } from 'psl';
import { isDefined } from 'twenty-shared/utils';

export const isParsedDomain = (
  result: ReturnType<typeof pslParse>,
): result is ParsedDomain =>
  !isDefined(result.error) &&
  Object.prototype.hasOwnProperty.call(result, 'sld');
