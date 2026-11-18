import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const getInvalidFlatViewFieldRelationScopeError = ({
  message,
  userFriendlyMessage,
}: Pick<
  FlatEntityValidationError,
  'message' | 'userFriendlyMessage'
>): FlatEntityValidationError => ({
  code: ViewExceptionCode.INVALID_VIEW_DATA,
  message,
  userFriendlyMessage,
});
