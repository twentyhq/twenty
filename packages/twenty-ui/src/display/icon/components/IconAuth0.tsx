import { useTheme } from '@emotion/react';

import IconAuth0Raw from '../assets/icon-auth0-logo-dark.svg?react';

interface IconAuth0Props {
  size?: number;
}

export const IconAuth0 = (props: IconAuth0Props) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconAuth0Raw height={size} width={size} />;
};
