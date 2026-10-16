import { type ApplicationTargetAccess } from 'src/engine/core-modules/authorization/application-reach/types/application-target-access.type';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export const buildLogicFunctionOperationTarget = <TInput>({
  access,
  getId,
}: {
  access: ApplicationTargetAccess;
  getId: (input: TInput) => string | undefined;
}) => ({
  metadataName: 'logicFunction' as const,
  access,
  getId,
  createOutOfReachException: (id: string) =>
    new LogicFunctionException(
      `Logic function with id ${id} not found`,
      LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    ),
});
