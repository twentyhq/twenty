import { CSSProperties } from 'react';

const BACKGROUND_IMAGE_URL =
  'https://framerusercontent.com/images/nqEmdwe7yDXNsOZovuxG5zvj2E.png';

export const container: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '1200px',
  height: '630px',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  fontFamily: 'Gabarito',
};

export const topBackgroundImage: CSSProperties = {
  backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
  position: 'absolute',
  zIndex: '-1',
  width: '1300px',
  height: '250px',
  transform: 'rotate(-11deg)',
  opacity: '0.2',
  top: '-100',
  left: '-25',
};

export const bottomBackgroundImage: CSSProperties = {
  backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
  position: 'absolute',
  zIndex: '-1',
  width: '1300px',
  height: '250px',
  transform: 'rotate(-11deg)',
  opacity: '0.2',
  bottom: '-120',
  right: '-40',
};

export const profileContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '780px',
  margin: '0px 0px 40px',
};

export const styledContributorAvatar = {
  display: 'flex',
  width: '96px',
  height: '96px',
  margin: '0px',
  border: '3px solid #141414',
  borderRadius: '16px',
};

export const profileInfoContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignItems: 'center',
  justifyContent: 'center',
};

export const profileUsernameHeader: CSSProperties = {
  margin: '0px',
  fontSize: '28px',
  fontWeight: '700',
  color: '#141414',
  fontFamily: 'Gabarito',
};

export const profileContributionHeader: CSSProperties = {
  margin: '0px',
  color: '#818181',
  fontSize: '20px',
  fontWeight: '400',
};

export const contributorInfoContainer: CSSProperties = {
  border: '3px solid #141414',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '780px',
  height: '149px',
  backgroundColor: '#F1F1F1',
};

export const contributorInfoBox: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
};

export const contributorInfo: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '32px',
  gap: '16px',
};

export const contributorInfoTitle = {
  color: '#B3B3B3',
  margin: '0px',
  fontWeight: '500',
  fontSize: '24px',
};

export const contributorInfoStats = {
  color: '#474747',
  margin: '0px',
  fontWeight: '700',
  fontSize: '40px',
};

export const infoSeparator: CSSProperties = {
  position: 'absolute',
  right: 0,
  display: 'flex',
  width: '2px',
  height: '85px',
  backgroundColor: '#141414',
};
