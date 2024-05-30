'use client';
import React, { useState } from 'react';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  cursor: pointer;
  margin-top: 32px;
  margin-bottom: 16px;
  width: 80%;
  overflow: none;
`;

const StyledTab = styled.div<{ active: boolean }>`
  padding: 10px 20px;
  border-bottom: 2px solid ${(props) => (props.active ? '#000' : 'transparent')};
  font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
`;

interface ArticleTabsProps {
  children: any;
  label1: string;
  label2: string;
  label3?: string;
}

const Tabs = ({ children, label1, label2, label3 }: ArticleTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const labels = label3 ? [label1, label2, label3] : [label1, label2];

  return (
    <div>
      <StyledContainer>
        {labels.map((label, index) => {
          return (
            <StyledTab
              onClick={() => setActiveTab(index)}
              key={label}
              active={activeTab === index}
            >
              {label}
            </StyledTab>
          );
        })}
      </StyledContainer>
      <div>{children[activeTab]}</div>
    </div>
  );
};

export default Tabs;
