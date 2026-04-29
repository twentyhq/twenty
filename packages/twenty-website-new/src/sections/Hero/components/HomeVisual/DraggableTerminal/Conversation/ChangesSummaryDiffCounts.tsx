import { styled } from '@linaria/react';

export const DiffAdded = styled.span`
  color: #2f7d52;
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-weight: 600;
`;

export const DiffRemoved = styled.span`
  color: #a94a4f;
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-weight: 600;
`;

const DiffCounts = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 11px;
  gap: 6px;
`;

const ZeroCount = styled.span`
  color: rgba(0, 0, 0, 0.35);
`;

type ChangesSummaryDiffCountsProps = {
  added: number;
  removed: number;
};

export const ChangesSummaryDiffCounts = ({
  added,
  removed,
}: ChangesSummaryDiffCountsProps) => (
  <DiffCounts>
    {added > 0 ? <DiffAdded>+{added}</DiffAdded> : <ZeroCount>+0</ZeroCount>}
    {removed > 0 ? (
      <DiffRemoved>-{removed}</DiffRemoved>
    ) : (
      <ZeroCount>-0</ZeroCount>
    )}
  </DiffCounts>
);
