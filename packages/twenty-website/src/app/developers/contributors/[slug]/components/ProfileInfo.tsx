'use client';

import styled from '@emotion/styled';

import { CardContainer } from '@/app/developers/contributors/[slug]/components/CardContainer';

const Container = styled(CardContainer)`
  flex-direction: row;

  .item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    flex-basis: 0;

    .title {
      font-size: 24px;
      color: #b3b3b3;
      margin: 0;
    }

    .value {
      font-size: 56px;
      font-weight: 700;
      color: #474747;
    }
  }

  .separator {
    width: 2px;
    background-color: #141414;
    border-radius: 40px;
  }
`;

interface ProfileInfoProps {
  mergedPRsCount: number;
  rank: string;
  activeDays: number;
}

export const ProfileInfo = ({
  mergedPRsCount,
  rank,
  activeDays,
}: ProfileInfoProps) => {
  return (
    <>
      <Container>
        <div className="item">
          <p className="title">Merged PR</p>
          <span className="value">{mergedPRsCount}</span>
        </div>
        <div className="separator"></div>
        <div className="item">
          <p className="title">Rank</p>
          <span className="value">{rank}%</span>
        </div>
        <div className="separator"></div>
        <div className="item">
          <p className="title">Active Days</p>
          <span className="value">{activeDays}</span>
        </div>
      </Container>
    </>
  );
};
