const SNAKE_CASE_REGEX = /^(?!.*__)[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;

export const isSnakeCaseString = (str: string) => SNAKE_CASE_REGEX.test(str);
