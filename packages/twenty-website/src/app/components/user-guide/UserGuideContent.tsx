'use client';
import React from 'react';
import styled from '@emotion/styled';

import { FileContent } from '@/app/get-posts';
import { Theme } from '@/app/ui/theme/theme';

const StyledContainer = styled.div`
  width: 60%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-family: ${Theme.font.family};
`;

const StyledWrapper = styled.div`
  width: 79.3%;
  padding: ${Theme.spacing(10)} 0px ${Theme.spacing(20)} 0px;
`;

export default function UserGuideContent({ item }: { item: FileContent }) {
  return (
    <StyledContainer>
      <StyledWrapper>
        <h2>{item.itemInfo.title}</h2>
        <div>{item.content}</div>
      </StyledWrapper>
    </StyledContainer>
  );
}
