import styled from '@emotion/styled';

const Link = styled.a`
  display: block;
  image-rendering: pixelated;
  flex-shrink: 0;
  background-size: 100% 100%;
  border-radius: 8px;
  height: 40px;
  width: 40px;
  background-image: url('/images/core/logo.svg');
  opacity: 1;
`;

export const Logo = () => {
  return <Link href="/" />;
};
