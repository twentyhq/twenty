'use client';
import React, { useState } from 'react';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  cursor: pointer;
  margin-top: 32px;
  margin-bottom: 16px;
  width: 80%;
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
            <div
              onClick={() => setActiveTab(index)}
              style={{
                padding: '10px 20px',
                borderBottom:
                  activeTab === index
                    ? '2px solid #000'
                    : '2px solid transparent',
                fontWeight: activeTab === index ? 'bold' : 'normal',
              }}
            >
              {label}
            </div>
          );
        })}
      </StyledContainer>
      <div>{children[activeTab]}</div>
    </div>
  );
};

export default Tabs;
