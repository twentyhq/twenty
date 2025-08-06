import Handlebars from 'handlebars';

const isNil = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

const isString = (value: any): value is string => {
  return typeof value === 'string';
};

const VARIABLE_PATTERN = RegExp('\\{\\{(.*?)\\}\\}', 'g');

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
  const matchedTokens = input.match(VARIABLE_PATTERN);

  if (!matchedTokens || matchedTokens.length === 0) {
    return input;
  }

  if (matchedTokens.length === 1 && matchedTokens[0] === input) {
    return evalFromContext(input, context);
  }

  return input.replace(VARIABLE_PATTERN, (matchedToken, _) => {
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

    return JSON.parse(inferredInput) ?? '';
  } catch (exception) {
    return undefined;
  }
};
