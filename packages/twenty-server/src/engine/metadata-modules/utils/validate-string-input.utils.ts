export const INPUT_REGEX = /^([A-Za-z0-9\-_.@]+)$/;

export const validateStringInput = (input: string) => {
  if (!INPUT_REGEX.test(input)) {
    throw new Error('Invalid string input');
  }
};
