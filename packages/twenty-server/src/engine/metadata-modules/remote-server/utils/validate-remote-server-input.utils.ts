import { isDefined } from 'class-validator';

import {
  RemoteServerException,
  RemoteServerExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-server.exception';

const INPUT_REGEX = /^([A-Za-z0-9\-_.@]+)$/;

export const validateObjectAgainstInjections = (input: object) => {
  for (const [key, value] of Object.entries(input)) {
    // Password are encrypted so we don't need to validate them
    if (key === 'password') {
      continue;
    }

    if (!isDefined(value)) {
      continue;
    }

    validateStringAgainstInjections(value.toString());
  }
};

export const validateStringAgainstInjections = (input: string) => {
  if (!INPUT_REGEX.test(input)) {
    throw new RemoteServerException(
      'Invalid remote server input',
      RemoteServerExceptionCode.INVALID_REMOTE_SERVER_INPUT,
    );
  }
};
