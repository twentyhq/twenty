import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { DIFF_SPANS } from './diff-spans';

const DiffCounts = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  font-family: ${APP_PREVIEW_STAGE.terminalFont.mono};
  font-size: 11px;
  gap: 6px;
`;

const ZeroCount = styled.span`
  color: ${APP_PREVIEW_TONES.terminal.text.diffZero};
`;

export function ChangesSummaryDiffCounts({
  added,
  removed,
}: {
  added: number;
  removed: number;
}) {
  return (
    <DiffCounts>
      {added > 0 ? (
        <DIFF_SPANS.Added>+{added}</DIFF_SPANS.Added>
      ) : (
        <ZeroCount>+0</ZeroCount>
      )}
      {removed > 0 ? (
        <DIFF_SPANS.Removed>-{removed}</DIFF_SPANS.Removed>
      ) : (
        <ZeroCount>-0</ZeroCount>
      )}
    </DiffCounts>
  );
}
