import { format } from 'date-fns';
import { ImageResponse } from 'next/og';

import { getContributorActivity } from '@/app/(public)/contributors/utils/get-contributor-activity';
import {
  backgroundImage,
  container,
  contributorInfo,
  contributorInfoBox,
  contributorInfoContainer,
  contributorInfoStats,
  contributorInfoTitle,
  infoSeparator,
  profileContainer,
  profileContributionHeader,
  profileInfoContainer,
  profileUsernameHeader,
  styledContributorAvatar,
} from '@/app/api/contributors/[slug]/og.png/style';

const GABARITO_FONT_CDN_URL =
  'https://fonts.cdnfonts.com/s/105143/Gabarito-Medium-BF651cdf1f3f18e.woff';

const getGabarito = async () => {
  const fontGabarito = await fetch(GABARITO_FONT_CDN_URL).then((res) =>
    res.arrayBuffer(),
  );

  return fontGabarito;
};

export async function GET(request: Request) {
  try {
    const url = request.url;
    const splitUrl = url.split('/');
    const usernameIndex =
      splitUrl.findIndex((part) => part === 'contributors') + 1;
    const username = splitUrl[usernameIndex];

    const contributorActivity = await getContributorActivity(username);
    if (contributorActivity) {
      const {
        firstContributionAt,
        mergedPRsCount,
        rank,
        activeDays,
        contributorAvatar,
      } = contributorActivity;

      const imageResponse = await new ImageResponse(
        (
          <div style={container}>
            <div style={backgroundImage}></div>
            <div style={profileContainer}>
              <img src={contributorAvatar} style={styledContributorAvatar} />
              <div style={profileInfoContainer}>
                <h1 style={profileUsernameHeader}>@{username} x Twenty</h1>
                <h2 style={profileContributionHeader}>
                  Since {format(new Date(firstContributionAt), 'MMMM yyyy')}
                </h2>
              </div>
              <svg
                width="134"
                height="134"
                viewBox="0 0 136 136"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2343_96406)">
                  <path
                    d="M136 2.28882e-05H0L0.000144482 136H136V2.28882e-05ZM27.27 50.6401C27.27 43.2101 33.3 37.1801 40.73 37.1801H66.64C67.02 37.1801 67.37 37.4101 67.53 37.7601C67.69 38.1101 67.62 38.5201 67.36 38.8101L61.68 44.9801C60.69 46.0501 59.3 46.6701 57.84 46.6701H40.8C38.57 46.6701 36.76 48.4801 36.76 50.7101V60.8901C36.76 62.2001 35.7 63.2601 34.39 63.2601H29.65C28.34 63.2601 27.28 62.2001 27.28 60.8901V50.6401H27.27ZM107.88 85.3601C107.88 92.7901 101.85 98.82 94.42 98.82H83.41C75.98 98.82 69.95 92.7901 69.95 85.3601V66.0901C69.95 64.7801 70.44 63.5201 71.33 62.5501L77.75 55.5801C78.02 55.2901 78.44 55.1901 78.82 55.3301C79.19 55.4801 79.44 55.83 79.44 56.23V85.3001C79.44 87.5301 81.25 89.3401 83.48 89.3401H94.36C96.59 89.3401 98.4 87.5301 98.4 85.3001V50.7101C98.4 48.4801 96.59 46.6701 94.36 46.6701H81.71C80.26 46.6701 78.88 47.2801 77.89 48.3401L40.16 89.3401H62.83C64.14 89.3401 65.2 90.4001 65.2 91.7101V96.4501C65.2 97.7601 64.14 98.82 62.83 98.82H32.28C29.51 98.82 27.26 96.5701 27.26 93.8001V91.29C27.26 90.03 27.73 88.8201 28.59 87.8901L70.89 41.9401C73.69 38.9001 77.62 37.1801 81.75 37.1801H94.41C101.84 37.1801 107.87 43.2101 107.87 50.6401V85.3601H107.88Z"
                    fill="black"
                  />
                  <path
                    d="M27.27 50.6401C27.27 43.2101 33.3 37.1801 40.73 37.1801H66.64C67.02 37.1801 67.37 37.4101 67.53 37.7601C67.69 38.1101 67.62 38.5201 67.36 38.8101L61.68 44.9801C60.69 46.0501 59.3 46.6701 57.84 46.6701H40.8C38.57 46.6701 36.76 48.4801 36.76 50.7101V60.8901C36.76 62.2001 35.7 63.2601 34.39 63.2601H29.65C28.34 63.2601 27.28 62.2001 27.28 60.8901V50.6401H27.27Z"
                    fill="white"
                  />
                  <path
                    d="M107.88 85.3601C107.88 92.7901 101.85 98.82 94.42 98.82H83.41C75.98 98.82 69.95 92.7901 69.95 85.3601V66.0901C69.95 64.7801 70.44 63.5201 71.33 62.5501L77.75 55.5801C78.02 55.2901 78.44 55.1901 78.82 55.3301C79.19 55.4801 79.44 55.83 79.44 56.23V85.3001C79.44 87.5301 81.25 89.3401 83.48 89.3401H94.36C96.59 89.3401 98.4 87.5301 98.4 85.3001V50.7101C98.4 48.4801 96.59 46.6701 94.36 46.6701H81.71C80.26 46.6701 78.88 47.2801 77.89 48.3401L40.16 89.3401H62.83C64.14 89.3401 65.2 90.4001 65.2 91.7101V96.4501C65.2 97.7601 64.14 98.82 62.83 98.82H32.28C29.51 98.82 27.26 96.5701 27.26 93.8001V91.29C27.26 90.03 27.73 88.8201 28.59 87.8901L70.89 41.9401C73.69 38.9001 77.62 37.1801 81.75 37.1801H94.41C101.84 37.1801 107.87 43.2101 107.87 50.6401V85.3601H107.88Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2343_96406">
                    <rect width="136" height="136" rx="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div style={contributorInfoContainer}>
              <div style={contributorInfoBox}>
                <div style={contributorInfo}>
                  <h3 style={contributorInfoTitle}>Merged PR</h3>
                  <p style={contributorInfoStats}>{mergedPRsCount}</p>
                </div>
                <div style={infoSeparator} />
              </div>
              <div style={contributorInfoBox}>
                <div style={contributorInfo}>
                  <h3 style={contributorInfoTitle}>Ranking</h3>
                  <p style={contributorInfoStats}>{rank}%</p>
                </div>
                <div style={infoSeparator} />
              </div>
              <div style={contributorInfoBox}>
                <div style={contributorInfo}>
                  <h3 style={contributorInfoTitle}>Active Days</h3>
                  <h1 style={contributorInfoStats}>{activeDays}</h1>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: 'Gabarito',
              data: await getGabarito(),
              style: 'normal',
            },
          ],
        },
      );
      return imageResponse;
    }
  } catch (error) {
    return new Response(`error: ${error}`, {
      status: 500,
    });
  }
}
