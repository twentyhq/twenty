import React from 'react';
import { styled } from '@linaria/react';

const SpinnerWrapper = styled.div`
  width: 24px;
  height: 24px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid black;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Spinner = () => <SpinnerWrapper />;

export default Spinner;
