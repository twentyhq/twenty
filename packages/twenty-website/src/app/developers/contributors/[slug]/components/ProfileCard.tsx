'use client';

import styled from '@emotion/styled';
import { format } from 'date-fns';

import { GithubIcon } from '@/app/components/Icons';

const ProfileContainer = styled.div`
  display: flex;
  gap: 32px;
  width: 100%;
  align-items: center;
`;

const Avatar = styled.div`
  border: 3px solid #141414;
  width: 96px;
  height: 96px;
  border-radius: 16px;
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .username {
    font-size: 40px;
    font-weight: 700;
    line-height: 48px;
    margin: 0;
    display: flex;
    gap: 12px;
  }

  .duration {
    font-size: 24px;
    font-weight: 400;
    color: #818181;
    margin: 0;
  }
`;

interface ProfileCardProps {
  username: string;
  avatarUrl: string;
  firstContributionAt: string;
}

export const ProfileCard = ({
  username,
  avatarUrl,
  firstContributionAt,
}: ProfileCardProps) => {
  return (
    <ProfileContainer>
      <Avatar>
        <img src={avatarUrl} alt={username} />
      </Avatar>
      <Details>
        <h3 className="username">
          @{username}
          <GithubIcon size="M" color="rgba(0,0,0,1)" />
        </h3>
        <p className="duration">
          Contributing since{' '}
          {format(new Date(firstContributionAt), 'MMMM yyyy')}
        </p>
      </Details>
    </ProfileContainer>
  );
};
