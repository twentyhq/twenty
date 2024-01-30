import styled from '@emotion/styled';

const Item = styled.div``;

interface PullRequestItemProps {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  mergedAt: string | null;
  authorId: string;
}

export const PullRequestItem = ({
  id,
  title,
  url,
  createdAt,
  mergedAt,
  authorId,
}: PullRequestItemProps) => {
  const prNumber = url.split('/').slice(-1)[0];
  const isMerged = mergedAt ? true : false;
  return (
    <Item key={id}>
      <div>Icon</div>
      <div className="details">
        <h4>{title}</h4>
        <p>
          #{prNumber} by {authorId.slice(1)}
        </p>
      </div>
    </Item>
  );
};
