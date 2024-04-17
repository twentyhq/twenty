'use client';
import styled from '@emotion/styled';

import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import UserGuideCard from '@/app/_components/user-guide/UserGuideCard';
import { USER_GUIDE_HOME_CARDS } from '@/content/user-guide/constants/UserGuideHomeCards';

const StyledContainer = styled.div`
  ${mq({
    width: ['100%', '60%', '60%'],
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  })};
`;

const StyledWrapper = styled.div`
  padding: ${Theme.spacing(10)} 92px ${Theme.spacing(20)};
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (max-width: 800px) {
    padding: ${Theme.spacing(10)} 24px ${Theme.spacing(20)};
  }

  @media (max-width: 800px) {
    align-items: center;
  }
`;

const StyledTitle = styled.div`
  font-size: ${Theme.font.size.sm};
  color: ${Theme.text.color.quarternary};
  font-weight: ${Theme.font.weight.medium};
  margin-bottom: 32px;
  @media (min-width: 380px) and (max-width: 800px) {
    width: 340px;
    margin-bottom: 24px;
  }
  @media (max-width: 380px) {
    width: 280px;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  @media (min-width: 380px) and (max-width: 800px) {
    width: 340px;
  }
  @media (max-width: 380px) {
    width: 280px;
  }
`;

const StyledHeading = styled.h1`
  line-height: 38px;
  font-weight: 700;
  font-size: 40px;
  color: ${Theme.text.color.primary};
  margin: 0px;
  @media (max-width: 800px) {
    font-size: 28px;
  }
`;

const StyledSubHeading = styled.h1`
  line-height: 28.8px;
  font-size: ${Theme.font.size.lg};
  font-weight: ${Theme.font.weight.regular};
  color: ${Theme.text.color.tertiary};
  @media (max-width: 800px) {
    font-size: ${Theme.font.size.sm};
  }
`;

const StyledContent = styled.div`
  ${mq({
    width: '100%',
    paddingTop: `${Theme.spacing(6)}`,
    display: ['flex', 'flex', 'grid'],
    flexDirection: 'column',
    gridTemplateRows: 'auto auto',
    gridTemplateColumns: 'auto auto',
    gap: `${Theme.spacing(6)}`,
  })};
  @media (max-width: 810px) {
    align-items: center;
  }
  @media (min-width: 1200px) {
    justify-content: left;
  }
`;

export default function UserGuideMain() {
  return (
    <StyledContainer>
      <StyledWrapper>
        <StyledTitle>User Guide</StyledTitle>
        <StyledHeader>
          <StyledHeading>User Guide</StyledHeading>
          <StyledSubHeading>
            A brief guide to grasp the basics of Twenty
          </StyledSubHeading>
        </StyledHeader>
        <StyledContent>
          {USER_GUIDE_HOME_CARDS.map((card) => {
            return <UserGuideCard key={card.title} card={card} />;
          })}
        </StyledContent>
      </StyledWrapper>
    </StyledContainer>
  );
}
