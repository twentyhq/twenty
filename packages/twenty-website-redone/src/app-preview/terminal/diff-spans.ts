import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

const Added = styled.span`
  color: ${APP_PREVIEW_TONES.terminal.text.diffAdded};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
  font-weight: 600;
`;

const Removed = styled.span`
  color: ${APP_PREVIEW_TONES.terminal.text.diffRemoved};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
  font-weight: 600;
`;

export const DIFF_SPANS = { Added, Removed };
