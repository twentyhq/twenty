'use client';

import styled from '@emotion/styled';

import { CardContainer } from '@/app/developers/contributors/[slug]/components/CardContainer';
import { PullRequestItem } from '@/app/developers/contributors/[slug]/components/PullRequestItem';
import { Title } from '@/app/developers/contributors/[slug]/components/Title';

const List = styled.div`
  display: flex;
  gap: 24px;
  flex-direction: column;
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
