'use client';

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';

import { Theme } from '@/app/ui/theme/theme';

const StyledContainer = styled.div`
  width: 20%;
  background: ${Theme.background.secondary};
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${Theme.background.transparent.medium};
  border-bottom: 1px solid ${Theme.background.transparent.medium};
  padding: ${Theme.spacing(10)} ${Theme.spacing(6)};
  gap: ${Theme.spacing(6)};
`;

const StyledHeadingText = styled.div`
  font-size: ${Theme.font.size.sm};
  color: ${Theme.text.color.quarternary};
`;

const UserGuideTableContents = () => {
  const router = useRouter();
  return (
    <StyledContainer>
      <StyledHeadingText onClick={() => router.push('/user-guide')}>
        Table of Contents
      </StyledHeadingText>
    </StyledContainer>
  );
};

export default UserGuideTableContents;
