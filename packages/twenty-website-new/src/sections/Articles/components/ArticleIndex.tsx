import Link from 'next/link';

import { styled } from '@linaria/react';
import type { CSSProperties } from 'react';

import { ArrowRightIcon, PlusIcon } from '@/icons';
import { formatArticleDate, type Article as ArticleData } from '@/lib/articles';
import { theme } from '@/theme';
import { Container } from '@/design-system/components';

type ArticleCardStyle = CSSProperties & { '--article-card-index': number };

const CORNER_SIZE = 14;
const CORNER_OFFSET = '-7px';

const Section = styled.section`
  background-color: #f4f4f4;
  min-width: 0;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};
  padding-bottom: ${theme.spacing(36)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(20)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(14)};
    padding-bottom: ${theme.spacing(44)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(24)};
  }
`;

const FramedGrid = styled.div`
  position: relative;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(12)};
    padding-left: ${theme.spacing(12)};
    padding-right: ${theme.spacing(12)};
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    padding-bottom: ${theme.spacing(20)};
    padding-left: ${theme.spacing(20)};
    padding-right: ${theme.spacing(20)};
  }
`;

const FrameRail = styled.span`
  background-color: ${theme.colors.primary.border[10]};
  bottom: 0;
  display: none;
  position: absolute;
  top: ${`calc(6px - ${theme.spacing(24)})`};
  width: 1px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const FrameRailLeft = styled(FrameRail)`
  left: 0;
`;

const FrameRailRight = styled(FrameRail)`
  right: 0;
`;

const FrameRailBottom = styled.span`
  background-color: ${theme.colors.primary.border[10]};
  bottom: 0;
  display: none;
  height: 1px;
  left: 0;
  position: absolute;
  right: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const FrameCorner = styled.span`
  align-items: center;
  display: none;
  height: ${CORNER_SIZE}px;
  justify-content: center;
  line-height: 0;
  pointer-events: none;
  position: absolute;
  width: ${CORNER_SIZE}px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
  }
`;

const FrameCornerBottomLeft = styled(FrameCorner)`
  bottom: ${CORNER_OFFSET};
  left: ${CORNER_OFFSET};
`;

const FrameCornerBottomRight = styled(FrameCorner)`
  bottom: ${CORNER_OFFSET};
  right: ${CORNER_OFFSET};
`;

const CardGrid = styled.div`
  display: grid;
  gap: ${theme.spacing(8)};
  grid-template-columns: 1fr;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(10)};
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CardLink = styled(Link)<{ $isLarge: boolean }>`
  @keyframes articleCardEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  animation: articleCardEnter 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--article-card-index) * 90ms + 180ms);
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  color: inherit;
  display: flex;
  flex-direction: column;
  grid-column: ${({ $isLarge }) => ($isLarge ? '1 / -1' : 'auto')};
  overflow: hidden;
  text-decoration: none;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
  will-change: transform;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: ${({ $isLarge }) => ($isLarge ? 'row' : 'column')};
  }

  &:hover {
    border-color: ${theme.colors.primary.border[20]};
    box-shadow: 0 12px 32px -16px rgba(0, 0, 0, 0.18);
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    &:hover {
      transform: none;
    }
  }
`;

const Thumbnail = styled.div<{ $isLarge: boolean }>`
  background: linear-gradient(135deg, #f4f2ec 0%, #e8e3d8 100%);
  flex-shrink: 0;
  height: 200px;
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: ${({ $isLarge }) => ($isLarge ? 'auto' : '240px')};
    min-height: ${({ $isLarge }) => ($isLarge ? '360px' : '0')};
    width: ${({ $isLarge }) => ($isLarge ? '50%' : '100%')};
  }
`;

const ThumbnailBadge = styled.span`
  bottom: ${theme.spacing(4)};
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  left: ${theme.spacing(6)};
  letter-spacing: 0.08em;
  position: absolute;
  text-transform: uppercase;
  z-index: 2;

  @media (min-width: ${theme.breakpoints.md}px) {
    bottom: ${theme.spacing(6)};
    left: ${theme.spacing(8)};
  }
`;

const ContentWrapper = styled.div<{ $isLarge: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: ${({ $isLarge }) =>
      $isLarge
        ? `${theme.spacing(10)} ${theme.spacing(6)} ${theme.spacing(5)}`
        : '0'};
  }
`;

const CardBody = styled.div<{ $isLarge: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  padding: ${theme.spacing(5)} ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${({ $isLarge }) => ($isLarge ? theme.spacing(5) : theme.spacing(3))};
    padding: ${({ $isLarge }) =>
      $isLarge ? '0' : `${theme.spacing(5)} ${theme.spacing(6)}`};
  }
`;

const DateLabel = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Title = styled.h2<{ $isLarge: boolean }>`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(6)};
  font-weight: ${theme.font.weight.light};
  line-height: ${theme.lineHeight(7.5)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${({ $isLarge }) =>
      $isLarge ? theme.font.size(8) : theme.font.size(6.5)};
    line-height: ${({ $isLarge }) =>
      $isLarge ? theme.lineHeight(9.5) : theme.lineHeight(8)};
  }
`;

const Description = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${theme.colors.primary.text[60]};
  display: -webkit-box;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5.5)};
  margin: 0;
  overflow: hidden;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(6)};
  padding-right: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(5)};
  }
`;

const Tag = styled.span`
  align-items: center;
  background-color: ${theme.colors.primary.text[5]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: 999px;
  color: ${theme.colors.primary.text[60]};
  display: inline-flex;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  padding: ${theme.spacing(1.5)} ${theme.spacing(3.5)};
  text-transform: uppercase;
  white-space: nowrap;
`;

const CardFooter = styled.div<{ $isLarge: boolean }>`
  align-items: center;
  border-top: 1px solid ${theme.colors.primary.border[10]};
  display: flex;
  gap: ${theme.spacing(3)};
  justify-content: space-between;
  margin-left: ${theme.spacing(6)};
  margin-right: ${theme.spacing(6)};
  padding-bottom: ${theme.spacing(5)};
  padding-top: ${theme.spacing(5)};

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: ${({ $isLarge }) => ($isLarge ? '0' : theme.spacing(6))};
    margin-right: ${({ $isLarge }) => ($isLarge ? '0' : theme.spacing(6))};
    padding-top: ${({ $isLarge }) =>
      $isLarge ? theme.spacing(6) : theme.spacing(5)};
  }
`;

const AuthorGroup = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${theme.spacing(3)};
  min-width: 0;
`;

const AuthorAvatar = styled.div`
  align-items: center;
  background-color: ${theme.colors.highlight[100]};
  border-radius: 50%;
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  flex-shrink: 0;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const AuthorText = styled.div`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReadIconButton = styled.span`
  align-items: center;
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  color: ${theme.colors.primary.text[80]};
  display: inline-flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 40px;

  a:hover & {
    transform: scale(1.08);
  }
`;

const EmptyState = styled.div`
  background: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  max-width: 720px;
  padding: ${theme.spacing(6)};
`;

const EmptyStateTitle = styled.p`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4.5)};
  font-weight: ${theme.font.weight.medium};
  margin: 0;
`;

type ArticleCardProps = {
  index: number;
  isLarge: boolean;
  post: ArticleData;
};

function ArticleCard({ index, isLarge, post }: ArticleCardProps) {
  const initials = post.author
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2);
  const cardStyle: ArticleCardStyle = { '--article-card-index': index };

  return (
    <CardLink
      $isLarge={isLarge}
      href={`/articles/${post.slug}`}
      style={cardStyle}
    >
      <Thumbnail $isLarge={isLarge}>
        <ThumbnailBadge>
          Article · {post.readingTimeMinutes} min read
        </ThumbnailBadge>
      </Thumbnail>

      <ContentWrapper $isLarge={isLarge}>
        <CardBody $isLarge={isLarge}>
          <DateLabel>{formatArticleDate(post.date)}</DateLabel>
          <Title $isLarge={isLarge}>{post.title}</Title>
          <Description>{post.description}</Description>
        </CardBody>

        {post.tags.length > 0 ? (
          <TagRow>
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagRow>
        ) : null}

        <CardFooter $isLarge={isLarge}>
          <AuthorGroup>
            <AuthorAvatar>{initials}</AuthorAvatar>
            <AuthorText>{post.author}</AuthorText>
          </AuthorGroup>
          <ReadIconButton aria-hidden>
            <ArrowRightIcon size={14} strokeColor="currentColor" />
          </ReadIconButton>
        </CardFooter>
      </ContentWrapper>
    </CardLink>
  );
}

type ArticleIndexProps = {
  posts: readonly ArticleData[];
};

export function ArticleIndex({ posts }: ArticleIndexProps) {
  const lastIndex = posts.length - 1;

  return (
    <Section>
      <StyledContainer>
        <FramedGrid>
          <FrameRailLeft aria-hidden />
          <FrameRailRight aria-hidden />
          <FrameRailBottom aria-hidden />
          <FrameCornerBottomLeft aria-hidden>
            <PlusIcon
              size={CORNER_SIZE}
              strokeColor={theme.colors.highlight[100]}
            />
          </FrameCornerBottomLeft>
          <FrameCornerBottomRight aria-hidden>
            <PlusIcon
              size={CORNER_SIZE}
              strokeColor={theme.colors.highlight[100]}
            />
          </FrameCornerBottomRight>
          {posts.length === 0 ? (
            <EmptyState>
              <EmptyStateTitle>No posts published yet.</EmptyStateTitle>
            </EmptyState>
          ) : (
            <CardGrid>
              {posts.map((post, index) => (
                <ArticleCard
                  index={index}
                  isLarge={index === 0 || index === lastIndex}
                  key={post.slug}
                  post={post}
                />
              ))}
            </CardGrid>
          )}
        </FramedGrid>
      </StyledContainer>
    </Section>
  );
}
