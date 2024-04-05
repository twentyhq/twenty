const INPUT_REGEX = /^([A-Za-z0-9\-\_\.]+)$/;

export const validateObject = (input: object) => {
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

export const validateString = (input: string) => {
  if (!INPUT_REGEX.test(input)) {
    throw new Error('Invalid remote server input');
  }
};
