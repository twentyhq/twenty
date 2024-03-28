'use client';

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';

import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';

const StyledContainer = styled.div`
  ${mq({
    width: '20%',
    display: ['none', 'none', 'flex'],
    flexDirection: 'column',
    background: `${Theme.background.secondary}`,
    borderLeft: `1px solid ${Theme.background.transparent.medium}`,
    borderBottom: `1px solid ${Theme.background.transparent.medium}`,
    padding: `${Theme.spacing(10)} ${Theme.spacing(6)}`,
    gap: `${Theme.spacing(6)}`,
    'body nav': {
      display: ['none', 'none', ''],
    },
  })};
`;

const StyledContent = styled.div`
  position: fixed;
`;

const StyledHeadingText = styled.div`
  font-size: ${Theme.font.size.sm};
  color: ${Theme.text.color.quarternary};
`;

const UserGuideTableContents = () => {
  const router = useRouter();
  return (
    <StyledContainer>
      <StyledContent>
        <StyledHeadingText onClick={() => router.push('/user-guide')}>
          Table of Contents
        </StyledHeadingText>
      </StyledContent>
    </StyledContainer>
  );
};

export default UserGuideTableContents;
