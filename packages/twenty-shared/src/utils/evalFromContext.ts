import Handlebars from 'handlebars';

export const evalFromContext = (
  input: string,
  context: Record<string, unknown>,
) => {
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
