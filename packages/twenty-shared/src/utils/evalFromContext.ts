import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@/utils/validation/isDefined';

// Resolves one `{{ path }}` token without Handlebars, which is CommonJS and cannot be tree-shaken from browser bundles.
// Reproduces its `{{{ json <path> }}}` quirks on purpose since in-flight workflows rely on them: own properties only,
// extra params ignored, values JSON round-tripped (Dates become ISO strings, NaN and functions drop).
const TOKEN_PATTERN = /^\{\{([^{}]*)\}\}$/;
const NUMBER_LITERAL_PATTERN = /^-?\d+(\.\d+)?$/;
const WHOLE_CONTEXT_PATHS = ['.', 'this', '@root'];
const CONTEXT_PREFIXES = ['./', 'this.', '@root.'];
const KEYWORD_LITERALS = ['true', 'false', 'null', 'undefined'];

type PathSegment = { value: string; isLiteralSegment: boolean };

const readFirstParam = (expression: string): string | undefined => {
  let param = '';

  for (let index = 0; index < expression.length; ++index) {
    const character = expression.charAt(index);

    if (character === '[') {
      const closingIndex = expression.indexOf(']', index + 1);

      if (closingIndex === -1) {
        return undefined;
      }

      param += expression.slice(index, closingIndex + 1);
      index = closingIndex;
      continue;
    }

    if (/\s/.test(character)) {
      break;
    }

    param += character;
  }

  return param;
};

const parsePathSegments = (path: string): PathSegment[] | undefined => {
  const segments: PathSegment[] = [];
  let current = '';
  let hasCurrent = false;
  let justClosedLiteralSegment = false;

  for (let index = 0; index < path.length; ++index) {
    const character = path[index];

    if (character === '[') {
      if (hasCurrent) {
        return undefined;
      }

      const closingIndex = path.indexOf(']', index + 1);

      if (closingIndex === -1) {
        return undefined;
      }

      segments.push({
        value: path.slice(index + 1, closingIndex),
        isLiteralSegment: true,
      });
      index = closingIndex;
      justClosedLiteralSegment = true;
      continue;
    }

    if (character === '.') {
      if (hasCurrent) {
        segments.push({ value: current, isLiteralSegment: false });
        current = '';
        hasCurrent = false;
        continue;
      }

      if (justClosedLiteralSegment) {
        justClosedLiteralSegment = false;
        continue;
      }

      // A leading dot is not a path and a repeated dot truncates it, as in Handlebars.
      if (segments.length === 0) {
        return undefined;
      }

      return segments;
    }

    if (justClosedLiteralSegment) {
      return undefined;
    }

    current += character;
    hasCurrent = true;
  }

  if (hasCurrent) {
    segments.push({ value: current, isLiteralSegment: false });
  }

  return segments;
};

const readOwnProperty = (target: unknown, key: string): unknown => {
  if (!Object.prototype.hasOwnProperty.call(target, key)) {
    return undefined;
  }

  return (target as Record<string, unknown>)[key];
};

const toJsonValue = (value: unknown): unknown => {
  try {
    const serialized = JSON.stringify(value);

    if (serialized === undefined) {
      return undefined;
    }

    return JSON.parse(serialized);
  } catch {
    return undefined;
  }
};

export const evalFromContext = (
  input: string,
  context: Record<string, unknown>,
) => {
  const tokenMatch = input.match(TOKEN_PATTERN);

  if (tokenMatch === null) {
    return undefined;
  }

  const expression = tokenMatch[1]?.trim();

  if (!isNonEmptyString(expression)) {
    return undefined;
  }

  const param = readFirstParam(expression);

  if (!isNonEmptyString(param)) {
    return undefined;
  }

  if (WHOLE_CONTEXT_PATHS.includes(param)) {
    return toJsonValue(context);
  }

  // Stripped before the `@` guard so `@root.foo` is not rejected as a data variable.
  const contextPrefix = CONTEXT_PREFIXES.find((prefix) =>
    param.startsWith(prefix),
  );
  const normalizedPath =
    contextPrefix === undefined ? param : param.slice(contextPrefix.length);

  // `this..foo` truncated at the repeated dot in Handlebars, leaving the context
  if (contextPrefix !== undefined && normalizedPath.startsWith('.')) {
    return toJsonValue(context);
  }

  if (contextPrefix === undefined) {
    if (param.startsWith('@')) {
      return undefined;
    }

    if (param === 'true') {
      return true;
    }

    if (param === 'false') {
      return false;
    }

    if (param === 'null') {
      return null;
    }

    if (param === 'undefined') {
      return undefined;
    }

    if (NUMBER_LITERAL_PATTERN.test(param)) {
      return Number(param);
    }

    if (
      (param.startsWith('"') && param.endsWith('"') && param.length > 1) ||
      (param.startsWith("'") && param.endsWith("'") && param.length > 1)
    ) {
      return param.slice(1, -1);
    }
  }

  if (param.includes('../')) {
    return undefined;
  }

  const segments = parsePathSegments(normalizedPath);

  if (segments === undefined) {
    return undefined;
  }

  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  if (!isDefined(firstSegment) || !isDefined(lastSegment)) {
    return toJsonValue(context);
  }

  // Handlebars read a trailing number or keyword as a value, so it never resolved; mid-path it is a key.
  if (
    !lastSegment.isLiteralSegment &&
    (NUMBER_LITERAL_PATTERN.test(lastSegment.value) ||
      KEYWORD_LITERALS.includes(lastSegment.value))
  ) {
    return undefined;
  }

  // Handlebars collapsed a leading `[]` to the context, except under `@root.`.
  if (
    contextPrefix !== '@root.' &&
    firstSegment.isLiteralSegment &&
    firstSegment.value === ''
  ) {
    return toJsonValue(context);
  }

  // Handlebars guarded `@root.` hops by truthiness and other paths by `!= null`.
  const shortCircuitsOnFalsy = contextPrefix === '@root.';

  let resolved: unknown = context;

  for (const segment of segments) {
    // Mirrors the compiled guard rather than enumerating falsy values, which would miss NaN.
    const shortCircuits = shortCircuitsOnFalsy
      ? !resolved
      : !isDefined(resolved);

    if (shortCircuits) {
      return toJsonValue(resolved);
    }

    resolved = readOwnProperty(resolved, segment.value);
  }

  return toJsonValue(resolved);
};
