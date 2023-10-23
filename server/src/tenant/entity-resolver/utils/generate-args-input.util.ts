import { stringifyWithoutKeyQuote } from './stringify-without-key-quote.util';

export const generateArgsInput = (args: any) => {
  let argsString = '';

  for (const key in args) {
    // Check if the value is not undefined
    if (args[key] === undefined) {
      continue;
    }

    if (typeof args[key] === 'string') {
      // If it's a string, add quotes
      argsString += `${key}: "${args[key]}", `;
    } else if (typeof args[key] === 'object' && args[key] !== null) {
      // If it's an object (and not null), stringify it
      argsString += `${key}: ${stringifyWithoutKeyQuote(args[key])}, `;
    } else {
      // For other types (number, boolean), add as is
      argsString += `${key}: ${args[key]}, `;
    }
  }

  // Remove trailing comma and space, if present
  if (argsString.endsWith(', ')) {
    argsString = argsString.slice(0, -2);
  }

  return argsString;
};
