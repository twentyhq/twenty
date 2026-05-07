import Link from 'next/link';

import { styled } from '@linaria/react';

import { Container, MarkdownProse } from '@/design-system/components';
import { formatArticleDate, type Article as ArticleData } from '@/lib/articles';
import { theme } from '@/theme';

import { Root } from './Root';

const ArticleEl = styled.article``;

const StyledContainer = styled(Container)`
  max-width: 860px;
  padding: ${theme.spacing(20)} ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: ${theme.spacing(28)} ${theme.spacing(10)};
  }
`;

const BackLink = styled(Link)`
  color: ${theme.colors.primary.text[60]};
  display: inline-flex;
  font-size: ${theme.font.size(3)};
  margin-bottom: ${theme.spacing(8)};
  text-decoration: none;

  &:hover {
    color: ${theme.colors.primary.text[100]};
  }
`;

const Header = styled.header`
  display: grid;
  margin-bottom: ${theme.spacing(10)};
  row-gap: ${theme.spacing(4)};
`;

const Meta = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(10)};
  font-weight: ${theme.font.weight.light};
  line-height: ${theme.lineHeight(11.5)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(15)};
    line-height: ${theme.lineHeight(16.5)};
  }
`;

const Description = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.lineHeight(6.5)};
  margin: 0;
`;

const Tags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Tag = styled.li`
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: 999px;
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2.5)};
  letter-spacing: 0.06em;
  padding: ${theme.spacing(1)} ${theme.spacing(2.5)};
  text-transform: uppercase;
`;

type ArticleProps = {
  post: ArticleData;
};

export function Article({ post }: ArticleProps) {
  return (
    <Root variant="article">
      <ArticleEl>
        <StyledContainer>
          <BackLink href="/articles">← Back to articles</BackLink>
          <Header>
            <Meta>
              {formatArticleDate(post.date)} · {post.readingTimeMinutes} min
              read · {post.author}
            </Meta>
            <Title>{post.title}</Title>
            <Description>{post.description}</Description>
            {post.tags.length > 0 ? (
              <Tags>
                {post.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Tags>
            ) : null}
          </Header>
          <MarkdownProse markdown={post.content} />
        </StyledContainer>
      </ArticleEl>
    </Root>
  );
}
