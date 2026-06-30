import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { Fragment } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { formatReleaseDate, RELEASE_NOTES } from '@/platform/releases';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { SectionShell } from '@/ui';

// Reading measure for the feed: the meta rail + content sit inside one column,
// narrower than the section grid (the old site's 800px readingWide).
const ReadingColumn = styled.div`
  margin-inline: auto;
  max-width: 800px;
  width: 100%;
`;

// Stacked on phones (date above content); a fixed meta rail beside the content
// from md up.
const ReleaseRow = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  row-gap: ${spacing(4)};

  ${mediaUp('md')} {
    column-gap: ${spacing(10)};
    grid-template-columns: minmax(96px, 132px) minmax(0, 1fr);
    row-gap: 0;
  }
`;

const MetaColumn = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(1)};
  }

  ${mediaUp('md')} {
    padding-top: ${spacing(2)};
  }
`;

const Version = styled.h2`
  color: ${color('black-80')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.3;
`;

const ReleaseDate = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  white-space: nowrap;
`;

const Highlights = styled.div`
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const HighlightTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(8)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.25;
`;

// The description renders a <Trans> phrase; its inline <code>/<strong>/<a>
// (preserved from the old release notes) are styled here.
const HighlightBody = styled.p`
  color: ${color('black-80')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 1.65;
  margin-top: ${spacing(4)};

  code {
    background-color: ${color('black-10')};
    border-radius: ${radius(1)};
    font-family: ${fontFamily('mono')};
    font-size: 0.9em;
    padding: 0.1em 0.35em;
  }

  strong {
    font-weight: ${FONT_WEIGHT.medium};
  }

  a {
    color: ${color('blue')};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const HighlightImage = styled.img`
  border-radius: ${radius(2)};
  display: block;
  height: auto;
  margin-top: ${spacing(6)};
  max-width: min(100%, 720px);
  width: auto;
`;

// The rule indents to the content edge from md up (it separates content, not
// the meta rail), matching the old feed.
const Divider = styled.div`
  background-color: ${semanticColor.line};
  height: 1px;
  margin: ${spacing(10)} 0;
  width: 100%;

  ${mediaUp('md')} {
    margin-left: calc(132px + ${spacing(10)});
    width: auto;
  }
`;

export function ReleasesFeed({ locale }: { locale: string }) {
  const i18n = getServerI18n();

  return (
    <SectionShell ariaLabel={i18n._(msg`Releases`)} scheme="light">
      <ReadingColumn>
        {RELEASE_NOTES.map((note, index) => (
          <Fragment key={note.release}>
            <ReleaseRow id={note.release}>
              <MetaColumn>
                <Version>{note.release}</Version>
                <ReleaseDate>
                  {formatReleaseDate(note.date, locale)}
                </ReleaseDate>
              </MetaColumn>
              <Highlights>
                {note.highlights.map((highlight) => {
                  const title = i18n._(highlight.title);
                  return (
                    <div key={title}>
                      <HighlightTitle>{title}</HighlightTitle>
                      <HighlightBody>{highlight.description}</HighlightBody>
                      {highlight.image !== undefined && (
                        <HighlightImage
                          alt=""
                          decoding="async"
                          loading="lazy"
                          src={highlight.image}
                        />
                      )}
                    </div>
                  );
                })}
              </Highlights>
            </ReleaseRow>
            {index < RELEASE_NOTES.length - 1 && <Divider aria-hidden />}
          </Fragment>
        ))}
      </ReadingColumn>
    </SectionShell>
  );
}
