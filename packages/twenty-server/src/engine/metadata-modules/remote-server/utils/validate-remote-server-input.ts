import { INPUT_REGEX } from 'src/engine/metadata-modules/utils/validate-string-input.utils';

export const validateObjectRemoteServerInput = (input: object) => {
  for (const [key, value] of Object.entries(input)) {
    // Password are encrypted so we don't need to validate them
    if (key === 'password') {
      continue;
    }

    if (!INPUT_REGEX.test(value.toString())) {
      throw new Error('Invalid remote server input');
    }
  }
};
