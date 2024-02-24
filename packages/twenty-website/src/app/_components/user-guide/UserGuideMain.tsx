'use client';
import styled from '@emotion/styled';

import {
  DeviceType,
  useDeviceType,
} from '@/app/_components/client-utils/useDeviceType';
import { Theme } from '@/app/_components/ui/theme/theme';
import UserGuideCard from '@/app/_components/user-guide/UserGuideCard';
import { UserGuideHomeCards } from '@/content/user-guide/constants/UserGuideHomeCards';

const StyledContainer = styled.div<{ isMobile: boolean }>`
  width: ${({ isMobile }) => (isMobile ? '100%' : '60%')};
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const StyledWrapper = styled.div`
  width: 79.3%;
  padding: ${Theme.spacing(10)} 0px ${Theme.spacing(20)} 0px;
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(8)};
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
`;

const StyledHeading = styled.h1`
  line-height: 38px;
  font-weight: 700;
  font-size: 38px;
  color: ${Theme.text.color.primary};
  margin: 0px;
`;

const StyledSubHeading = styled.h1`
  line-height: 12px;
  font-family: ${Theme.font.family};
  font-size: ${Theme.font.size.sm};
  font-weight: ${Theme.font.weight.regular};
  color: ${Theme.text.color.tertiary};
`;

const StyledContentGrid = styled.div`
  width: 100%;
  padding-top: ${Theme.spacing(6)};
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: auto auto;
  gap: ${Theme.spacing(6)};
`;

const StyledContentFlex = styled.div`
  width: 100%;
  padding-top: ${Theme.spacing(6)};
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(6)};
`;

export default function UserGuideMain() {
  const deviceType = useDeviceType();
  return (
    <StyledContainer isMobile={deviceType === DeviceType.MOBILE}>
      <StyledWrapper>
        <StyledHeader>
          <StyledHeading>User Guide</StyledHeading>
          <StyledSubHeading>
            A brief guide to grasp the basics of Twenty
          </StyledSubHeading>
        </StyledHeader>
        {deviceType === DeviceType.DESKTOP ? (
          <StyledContentGrid>
            {UserGuideHomeCards.map((card) => {
              return <UserGuideCard key={card.title} card={card} />;
            })}
          </StyledContentGrid>
        ) : (
          <StyledContentFlex>
            {UserGuideHomeCards.map((card) => {
              return <UserGuideCard key={card.title} card={card} />;
            })}
          </StyledContentFlex>
        )}
      </StyledWrapper>
    </StyledContainer>
  );
}
