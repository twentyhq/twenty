import { useLocation, useNavigate } from 'react-router-dom';

export const useResetLocationHash = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // eslint-disable-next-line twenty/no-navigate-prefer-link
  const resetLocationHash = () => {
    navigate(location.pathname, { replace: true });
  };

  return { resetLocationHash };
};
