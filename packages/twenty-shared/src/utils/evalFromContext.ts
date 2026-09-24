import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@/utils/validation/isDefined';

// Resolves a single `{{ path }}` token against a context object.
//
// This replaces a Handlebars `{{{ json <path> }}}` compile whose only purpose
// was to read a value out of the context: Handlebars is CommonJS, so bundlers
// cannot tree-shake it, and it reached every browser consumer of this package
// through the utils barrel for what is a property lookup.
//
// The quirks below are Handlebars' own and are reproduced deliberately, because
// workflows already in flight were authored against them:
//   - a bare numeric path segment never resolves (`arr.0`), only `arr.[0]` does
//   - only own properties resolve, so prototype access is denied
//   - extra space-separated params are ignored (they were helper params)
//   - the value is JSON round-tripped, so Dates become ISO strings, NaN and
//     Infinity become null, and functions or circular values become undefined
const TOKEN_PATTERN = /^\{\{([^{}]*)\}\}$/;
const NUMBER_LITERAL_PATTERN = /^-?\d+(\.\d+)?$/;
const WHOLE_CONTEXT_PATHS = ['.', 'this', '@root'];
const CONTEXT_PREFIXES = ['./', 'this.', '@root.'];
const KEYWORD_LITERALS = ['true', 'false', 'null', 'undefined'];

type PathSegment = { value: string; isLiteralSegment: boolean };

// Reads the first space-separated token, treating `[...]` as atomic so that
// `{{step.[key with space] extra}}` still yields `step.[key with space]`
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

      // An empty segment: a leading dot is not a path at all, while a repeated
      // dot mid-path truncates it, both matching how Handlebars parsed these
      if (segments.length === 0) {
        return undefined;
      }

      return segments;
    }

    // Anything other than a separator straight after `[...]`, such as `[a]b`
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

  // Stripped before the `@` guard below, so `@root.foo` stays a path rooted at
  // the context rather than being rejected as an unsupported data variable
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

  if (firstSegment === undefined || lastSegment === undefined) {
    return toJsonValue(context);
  }

  // A number or a keyword read as a value rather than a key, so a path ending in
  // one never resolved. Mid-path they are ordinary keys: `arr.0` is undefined
  // but `arr.0.length` is not, and `[0]` works in either position
  if (
    !lastSegment.isLiteralSegment &&
    (NUMBER_LITERAL_PATTERN.test(lastSegment.value) ||
      KEYWORD_LITERALS.includes(lastSegment.value))
  ) {
    return undefined;
  }

  // A leading `[]` collapsed the whole path to the context in Handlebars, but
  // only for a bare path: under `@root.` it stayed an ordinary empty-string key
  if (
    contextPrefix !== '@root.' &&
    firstSegment.isLiteralSegment &&
    firstSegment.value === ''
  ) {
    return toJsonValue(context);
  }

  // Handlebars guarded each hop, but with a different test depending on how the
  // path started: `x != null ? x.key : x` for a bare or `this.` path, and a
  // plain truthiness check for an `@root.` data lookup, so walking through 0 or
  // '' yields that value there rather than undefined
  const shortCircuitsOnFalsy = contextPrefix === '@root.';

  let resolved: unknown = context;

  for (const segment of segments) {
    // Mirrors the compiled guard exactly rather than enumerating falsy values,
    // which would miss NaN and anything else JavaScript counts as falsy
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
