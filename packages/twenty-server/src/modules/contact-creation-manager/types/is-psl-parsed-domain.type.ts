import { isDefined } from "class-validator";
import psl, { ParsedDomain } from "psl";

export const isParsedDomain = (
  result: ReturnType<typeof psl.parse>,
): result is ParsedDomain =>
  !isDefined(result.error) && Object.prototype.hasOwnProperty.call(result, 'sld');
