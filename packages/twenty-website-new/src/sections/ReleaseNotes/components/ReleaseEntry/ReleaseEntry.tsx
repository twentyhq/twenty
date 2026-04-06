import { formatReleaseDisplayDate } from '@/lib/releases/format-release-display-date';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { ReleaseMarkdown } from '../ReleaseMarkdown/ReleaseMarkdown';

const ArticleRow = styled.article`
  column-gap: ${theme.spacing(6)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  row-gap: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    column-gap: ${theme.spacing(10)};
    grid-template-columns: minmax(96px, 132px) minmax(0, 1fr);
    row-gap: 0;
  }
`;

const MetaColumn = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: column;
    padding-top: ${theme.spacing(2)};
  }
`;

const Version = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(5)};
  font-weight: ${theme.font.weight.medium};
  line-height: 1.3;
`;

const DateText = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(3)};
  white-space: nowrap;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: ${theme.spacing(2)};
    white-space: normal;
  }
`;

const ContentColumn = styled.div`
  min-width: 0;
`;

type ReleaseEntryProps = {
  content: string;
  date: string;
  release: string;
};

export function ReleaseEntry({ content, date, release }: ReleaseEntryProps) {
  const displayDate = formatReleaseDisplayDate(date);

  return (
    <ArticleRow>
      <MetaColumn>
        <Version>{release}</Version>
        <DateText>{displayDate || '—'}</DateText>
      </MetaColumn>
      <ContentColumn>
        <ReleaseMarkdown markdown={content} />
      </ContentColumn>
    </ArticleRow>
  );
}
