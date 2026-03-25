import { type CSSProperties } from 'react';

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

export const backgroundImage: CSSProperties = {
  position: 'absolute',
  width: '1250px',
  height: '850px',
  transform: 'rotate(-7deg)',
  opacity: '0.8',
  backgroundImage: `
  linear-gradient(
    158.4deg,
    rgba(255, 255, 255, 0.8) 30.69%,
    #FFFFFF 35.12%,
    rgba(255, 255, 255, 0.8) 60.27%,
    rgba(255, 255, 255, 0.64) 38.88%
  ),
  url(${BACKGROUND_IMAGE_URL})`,
};

export const profileContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '970px',
  height: '134px',
  margin: '0px 0px 55px',
};

export const styledContributorAvatar = {
  display: 'flex',
  width: '134px',
  height: '134px',
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
  fontSize: '39px',
  fontWeight: '700',
  color: '#141414',
  fontFamily: 'Gabarito',
};

export const profileContributionHeader: CSSProperties = {
  margin: '0px',
  color: '#818181',
  fontSize: '27px',
  fontWeight: '400',
};

export const contributorInfoContainer: CSSProperties = {
  border: '3px solid #141414',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '970px',
  height: '209px',
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
  fontSize: '33px',
};

export const contributorInfoStats = {
  color: '#474747',
  margin: '0px',
  fontWeight: '700',
  fontSize: '55px',
};

export const infoSeparator: CSSProperties = {
  position: 'absolute',
  right: 0,
  display: 'flex',
  width: '2px',
  height: '120px',
  backgroundColor: '#141414',
};
