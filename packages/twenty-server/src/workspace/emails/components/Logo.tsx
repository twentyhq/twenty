import { Img } from '@react-email/components';

const logoStyle = {
  marginBottom: '40px',
};

export const Logo = () => {
  return (
    <Img
      src="https://docs.twenty.com/img/logo-square-dark.svg"
      alt="Cat"
      width="40"
      height="40"
      style={logoStyle}
    />
  );
};
