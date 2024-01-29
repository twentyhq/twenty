'use client';

import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  padding: 40px;
  gap: 16px;
  border-radius: 12px;
  border: 3px solid #141414;
  width: 100%;

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
  rank: number;
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
