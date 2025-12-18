import Handlebars from 'handlebars';

const isNil = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

const isString = (value: any): value is string => {
  return typeof value === 'string';
};

const VARIABLE_PATTERN = RegExp('\\{\\{([^{}]+)\\}\\}', 'g');

// Pattern to match variableTag nodes in BlockNote/TipTap JSON strings
const VARIABLE_TAG_PATTERN =
  /\{"type":"variableTag","attrs":\{"variable":"(\{\{[^{}]+\}\})"\}\}/g;

export const resolveInput = (
  unresolvedInput: unknown,
  context: Record<string, unknown>,
): unknown => {
  if (isNil(unresolvedInput)) {
    return unresolvedInput;
  }

  if (isString(unresolvedInput)) {
    return resolveString(unresolvedInput, context);
  }

  if (Array.isArray(unresolvedInput)) {
    return resolveArray(unresolvedInput, context);
  }

  if (typeof unresolvedInput === 'object' && unresolvedInput !== null) {
    return resolveObject(unresolvedInput, context);
  }

  return unresolvedInput;
};

const resolveArray = (
  input: unknown[],
  context: Record<string, unknown>,
): unknown[] => {
  const resolvedArray = input;

  for (let i = 0; i < input.length; ++i) {
    resolvedArray[i] = resolveInput(input[i], context);
  }

  return resolvedArray;
};

const resolveObject = (
  input: object,
  context: Record<string, unknown>,
): object => {
  return Object.entries(input).reduce<Record<string, unknown>>(
    (resolvedObject, [key, value]) => {
      const resolvedKey = resolveInput(key, context);

      resolvedObject[
        typeof resolvedKey === 'string' ? resolvedKey : String(resolvedKey)
      ] = resolveInput(value, context);

      return resolvedObject;
    },
    {},
  );
};

const resolveString = (
  input: string,
  context: Record<string, unknown>,
): string => {
  const inputWithResolvedTags = input.replace(
    VARIABLE_TAG_PATTERN,
    (_, variable: string) => {
      const resolvedValue = evalFromContext(variable, context);
      const textValue = isNil(resolvedValue) ? '' : String(resolvedValue);
      const escapedText = JSON.stringify(textValue).slice(1, -1);

      return `{"type":"text","text":"${escapedText}"}`;
    },
  );

  const matchedTokens = inputWithResolvedTags.match(VARIABLE_PATTERN);

  if (!matchedTokens || matchedTokens.length === 0) {
    return inputWithResolvedTags;
  }

  if (
    matchedTokens.length === 1 &&
    matchedTokens[0] === inputWithResolvedTags
  ) {
    return evalFromContext(inputWithResolvedTags, context);
  }

  return inputWithResolvedTags.replace(VARIABLE_PATTERN, (matchedToken, _) => {
    const processedToken = evalFromContext(matchedToken, context);

    return processedToken;
  });
};

const evalFromContext = (input: string, context: Record<string, unknown>) => {
  try {
    Handlebars.registerHelper('json', (input: string) => JSON.stringify(input));

    const inputWithHelper = input
      .replace('{{', '{{{ json ')
      .replace('}}', ' }}}');

    const inferredInput = Handlebars.compile(inputWithHelper)(context, {
      helpers: {
        json: (input: string) => JSON.stringify(input),
      },
    });

    return JSON.parse(inferredInput);
  } catch {
    return undefined;
  }
};
