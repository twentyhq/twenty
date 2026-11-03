import { msg, t } from '@lingui/core/macro';
import { AGENT_AVATAR_COLORS, AGENT_AVATAR_SHAPES } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateAgentAvatar = ({
  avatarColor,
  avatarShape,
}: {
  avatarColor?: string | null;
  avatarShape?: string | null;
}): FlatEntityValidationError<AiExceptionCode>[] => {
  const errors: FlatEntityValidationError<AiExceptionCode>[] = [];

  if (
    isDefined(avatarColor) &&
    !AGENT_AVATAR_COLORS.some((color) => color === avatarColor)
  ) {
    const allowedColors = AGENT_AVATAR_COLORS.join(', ');

    errors.push({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
      message: t`Avatar color must be one of: ${allowedColors}`,
      userFriendlyMessage: msg`Invalid avatar color`,
    });
  }

  if (
    isDefined(avatarShape) &&
    !AGENT_AVATAR_SHAPES.some((shape) => shape === avatarShape)
  ) {
    const allowedShapes = AGENT_AVATAR_SHAPES.join(', ');

    errors.push({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
      message: t`Avatar shape must be one of: ${allowedShapes}`,
      userFriendlyMessage: msg`Invalid avatar shape`,
    });
  }

  return errors;
};
