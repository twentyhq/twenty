import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequest } from 'src/utils/extract-request';

export const UserAbility = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = getRequest(context);

    return request.ability;
  },
);
