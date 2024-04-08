import styled from '@emotion/styled';

export const CardContainer = styled.div`
  border: 3px solid #141414;
  width: 100%;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  gap: 32px;
  flex-direction: column;
  background-color: #fafafa;

  @media (max-width: 810px) {
    padding: 24px;
  }
`;
