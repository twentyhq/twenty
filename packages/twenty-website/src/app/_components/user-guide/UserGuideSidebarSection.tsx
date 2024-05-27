'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { IconPoint } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

import { IconChevronDown, IconChevronRight } from '@/app/_components/ui/icons';
import { Theme } from '@/app/_components/ui/theme/theme';
import { UserGuideArticlesProps } from '@/content/user-guide/constants/getUserGuideArticles';
import { groupArticlesByTopic } from '@/content/user-guide/constants/groupArticlesByTopic';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledIndex = styled.div`
  margin-bottom: 8px;
`;

const StyledTitle = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${Theme.spacing(2)};
  color: ${Theme.text.color.quarternary};
  margin-top: 8px;
  padding-bottom: ${Theme.spacing(2)};
  font-family: ${Theme.font.family};
  font-size: ${Theme.font.size.xs};
  font-weight: 600;
`;

const StyledSubTopicItem = styled.a<{ isselected: boolean }>`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${Theme.spacing(8)};
  color: ${(props) =>
    props.isselected ? Theme.text.color.primary : Theme.text.color.secondary};
  font-weight: ${(props) =>
    props.isselected ? Theme.font.weight.medium : Theme.font.weight.regular};
  font-family: ${Theme.font.family};
  font-size: ${Theme.font.size.xs};
  gap: 19px;
  padding: ${(props) =>
    props.isselected ? '6px 12px 6px 11px' : '0px 12px 0px 11px'};
  background: ${(props) =>
    props.isselected
      ? Theme.background.transparent.light
      : Theme.background.secondary};
  border-radius: ${Theme.border.radius.md};
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }

  &:hover {
    background: #1414140a;
  }

  &:active {
    background: #1414140f;
  }
`;

const StyledIcon = styled.div`
  padding: 0px 4px 0px 4px;
  display: flex;
  align-items: center;
`;

const StyledIconContainer = styled.div`
  margin-left: -8px;
  color: ${Theme.color.gray30};
`;

const StyledCardTitle = styled.p`
  margin: 0px -5px;
  color: ${Theme.color.gray30};
  font-weight: 600;
`;

const StyledRectangle = styled.div<{ isselected: boolean; isHovered: boolean }>`
  height: ${(props) =>
    props.isselected ? '95%' : props.isHovered ? '70%' : '100%'};
  width: 2px;
  background: ${(props) =>
    props.isselected
      ? Theme.border.color.plain
      : props.isHovered
        ? Theme.background.transparent.strong
        : Theme.background.transparent.light};
  transition: height 0.2s ease-in-out;
`;

interface TopicsState {
  [topic: string]: boolean;
}

const UserGuideSidebarSection = ({
  userGuideIndex,
}: {
  userGuideIndex: UserGuideArticlesProps[];
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const topics = groupArticlesByTopic(userGuideIndex);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const path = pathname.includes('user-guide') ? '/user-guide/' : '/docs/';

  const [unfolded, setUnfolded] = useState<TopicsState>(() =>
    Object.keys(topics).reduce((acc: TopicsState, topic: string) => {
      acc[topic] = true;
      return acc;
    }, {}),
  );

  const toggleFold = (topic: string) => {
    setUnfolded((prev: TopicsState) => ({ ...prev, [topic]: !prev[topic] }));
  };

  return (
    <StyledContainer>
      {Object.entries(topics).map(([topic, cards]) => {
        const hasMultipleFiles = cards.some((card) => card.numberOfFiles > 1);

        return (
          <StyledIndex key={topic}>
            {hasMultipleFiles ? (
              <StyledTitle onClick={() => toggleFold(topic)}>
                {unfolded[topic] ? (
                  <StyledIcon>
                    <IconChevronDown size={Theme.icon.size.md} />
                  </StyledIcon>
                ) : (
                  <StyledIcon>
                    <IconChevronRight size={Theme.icon.size.md} />
                  </StyledIcon>
                )}
                <div>{topic}</div>
              </StyledTitle>
            ) : null}

            {unfolded[topic] &&
              cards.map((card) => {
                const isselected = pathname === `${path}${card.fileName}`;

                return (
                  <StyledSubTopicItem
                    key={card.title}
                    isselected={isselected}
                    href={`${path}${card.fileName}`}
                    onClick={() => router.push(`${path}${card.fileName}`)}
                    onMouseEnter={() => setHoveredItem(card.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {card.numberOfFiles > 1 ? (
                      <>
                        <StyledRectangle
                          isselected={isselected}
                          isHovered={hoveredItem === card.title}
                        />
                        {card.title}
                      </>
                    ) : (
                      <>
                        <StyledIconContainer>
                          <IconPoint size={Theme.icon.size.md} />
                        </StyledIconContainer>
                        <StyledCardTitle>{card.title}</StyledCardTitle>
                      </>
                    )}
                  </StyledSubTopicItem>
                );
              })}
          </StyledIndex>
        );
      })}
    </StyledContainer>
  );
};

export default UserGuideSidebarSection;
