'use client';

import styled from '@emotion/styled';
import { format } from 'date-fns';

import { GithubIcon } from '@/app/_components/ui/icons/SvgIcons';

const ProfileContainer = styled.div`
  display: flex;
  gap: 32px;
  width: 100%;
  align-items: center;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: start;
  }
`;

const Avatar = styled.div`
  border: 3px solid #141414;
  width: 96px;
  height: 96px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    display: block;
    height: 100%;
    object-fit: cover;
  }
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 810px) {
    gap: 8px;
  }

  .username {
    font-size: 40px;
    font-weight: 700;
    line-height: 48px;
    margin: 0;
    display: flex;
    gap: 12px;

    @media (max-width: 810px) {
      font-size: 32px;
      line-height: 28.8px;
    }
  }

  .duration {
    font-size: 24px;
    font-weight: 400;
    color: #818181;
    margin: 0;

    @media (max-width: 810px) {
      font-size: 20px;
      line-height: 28px;
    }
  }
`;

const StyledGithubIcon = styled(GithubIcon)`
  @media (max-width: 810px) {
    width: 20px;
    height: 20px;
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
        <img src={avatarUrl} alt={username} width={100} height={100} />
      </Avatar>
      <Details>
        <h3 className="username">
          @{username}
          <a href={`https://github.com/${username}`} target="_blank">
            <StyledGithubIcon size="M" color="rgba(0,0,0,1)" />
          </a>
        </h3>
        {firstContributionAt && (
          <p className="duration">
            Contributing since{' '}
            {format(new Date(firstContributionAt), 'MMMM yyyy')}
          </p>
        )}
      </Details>
    </ProfileContainer>
  );
};
