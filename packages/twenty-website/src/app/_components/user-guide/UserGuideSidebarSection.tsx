'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { usePathname, useRouter } from 'next/navigation';

import { IconChevronDown, IconChevronRight } from '@/app/_components/ui/icons';
import { Theme } from '@/app/_components/ui/theme/theme';
import { IndexSubtopic } from '@/content/user-guide/constants/UserGuideIndex';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTitle = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${Theme.spacing(2)};
  color: ${Theme.text.color.quarternary};
  padding-bottom: ${Theme.spacing(2)};
  font-family: ${Theme.font.family};
  font-size: ${Theme.font.size.xs};
`;

const StyledSubTopicItem = styled.div<{ isselected: boolean }>`
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
`;

const StyledIcon = styled.div`
  padding: 0px 4px 0px 4px;
`;

const StyledRectangle = styled.div<{ isselected: boolean }>`
  height: 100%;
  width: 2px;
  background: ${(props) =>
    props.isselected
      ? Theme.border.color.plain
      : Theme.background.transparent.light};
`;

const UserGuideSidebarSection = ({
  title,
  subTopics,
}: {
  title: string;
  subTopics: IndexSubtopic[];
}) => {
  const [isUnfolded, setUnfoldedState] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  return (
    <StyledContainer>
      <StyledTitle onClick={() => setUnfoldedState(!isUnfolded)}>
        {isUnfolded ? (
          <StyledIcon>
            <IconChevronDown size={Theme.icon.size.md} />
          </StyledIcon>
        ) : (
          <StyledIcon>
            <IconChevronRight size={Theme.icon.size.md} />
          </StyledIcon>
        )}
        <div>{title}</div>
      </StyledTitle>
      {isUnfolded &&
        subTopics.map((subtopic, index) => {
          const isselected = pathname === `/user-guide/${subtopic.url}`;
          return (
            <StyledSubTopicItem
              key={index}
              isselected={isselected}
              onClick={() => router.push(`/user-guide/${subtopic.url}`)}
            >
              <StyledRectangle isselected={isselected} />
              {subtopic.title}
            </StyledSubTopicItem>
          );
        })}
    </StyledContainer>
  );
};

export default UserGuideSidebarSection;
