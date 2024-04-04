'use client';

import styled from '@emotion/styled';

import { CardContainer } from '@/app/_components/contributors/CardContainer';
import { PullRequestItem } from '@/app/_components/contributors/PullRequestItem';
import { Title } from '@/app/_components/contributors/Title';

const List = styled.div`
  display: flex;
  gap: 24px;
  flex-direction: column;
  overflow: hidden;
`;
interface PullRequestsProps {
  list: {
    id: string;
    title: string;
    url: string;
    createdAt: string;
    mergedAt: string | null;
    authorId: string;
  }[];
}

export const PullRequests = ({ list }: PullRequestsProps) => {
  return (
    <CardContainer>
      <Title>Pull Requests</Title>
      <List>
        {list.map((pr) => (
          <PullRequestItem
            key={pr.id}
            id={pr.id}
            title={pr.title}
            url={pr.url}
            createdAt={pr.createdAt}
            mergedAt={pr.mergedAt}
            authorId={pr.authorId}
          />
        ))}
      </List>
    </CardContainer>
  );
};
