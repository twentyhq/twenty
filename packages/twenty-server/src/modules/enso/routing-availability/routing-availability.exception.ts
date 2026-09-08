import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum RoutingAvailabilityExceptionCode {
  WORKSPACE_MEMBER_NOT_FOUND = 'WORKSPACE_MEMBER_NOT_FOUND',
  NO_WORKSPACE_MEMBER_CONTEXT = 'NO_WORKSPACE_MEMBER_CONTEXT',
}

export class RoutingAvailabilityException extends CustomException<RoutingAvailabilityExceptionCode> {
  constructor(message: string, code: RoutingAvailabilityExceptionCode) {
    super(message, code, {
      userFriendlyMessage: msg`Your lead-routing presence could not be changed.`,
    });
  }
}
