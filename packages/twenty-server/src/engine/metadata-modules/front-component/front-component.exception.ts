import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum FrontComponentExceptionCode {
  FRONT_COMPONENT_NOT_FOUND = 'FRONT_COMPONENT_NOT_FOUND',
  FRONT_COMPONENT_ALREADY_EXISTS = 'FRONT_COMPONENT_ALREADY_EXISTS',
  INVALID_FRONT_COMPONENT_INPUT = 'INVALID_FRONT_COMPONENT_INPUT',
  FRONT_COMPONENT_CREATE_FAILED = 'FRONT_COMPONENT_CREATE_FAILED',
  FRONT_COMPONENT_NOT_READY = 'FRONT_COMPONENT_NOT_READY',
}

const getFrontComponentExceptionUserFriendlyMessage = (
  code: FrontComponentExceptionCode,
) => {
  switch (code) {
    case FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND:
      return msg`Front component not found.`;
    case FrontComponentExceptionCode.FRONT_COMPONENT_ALREADY_EXISTS:
      return msg`A front component with this name already exists.`;
    case FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT:
      return msg`Invalid front component input.`;
    case FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED:
      return msg`Failed to create front component.`;
    case FrontComponentExceptionCode.FRONT_COMPONENT_NOT_READY:
      return msg`Front component is not ready.`;
    default:
      assertUnreachable(code);
  }
};
const FRONT_COMPONENT_EXCEPTION_CATEGORY_BY_CODE = {
  [FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND]: 'NOT_FOUND',
  [FrontComponentExceptionCode.FRONT_COMPONENT_ALREADY_EXISTS]: 'CONFLICT',
  [FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT]: 'BAD_USER_INPUT',
  [FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED]: 'BAD_USER_INPUT',
  [FrontComponentExceptionCode.FRONT_COMPONENT_NOT_READY]: 'NOT_FOUND',
} as const satisfies Record<FrontComponentExceptionCode, ExceptionCategory>;

export class FrontComponentException extends CustomException<FrontComponentExceptionCode> {
  constructor(
    message: string,
    code: FrontComponentExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getFrontComponentExceptionUserFriendlyMessage(code),
      category: FRONT_COMPONENT_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
