'use client';
import styled from '@emotion/styled';
import { usePathname } from 'next/navigation';

import { StyledButton } from '@/app/_components/ui/layout/header/styled';
import { Theme } from '@/app/_components/ui/theme/theme';

const StyledContainer = styled.div`
  margin-top: 64px;
  padding: 32px;
  border: 2px solid #141414;
  border-radius: 16px;
  display: flex;
  flex-direction: row;

  h2 {
    margin: 0px;
    font-size: ${Theme.font.size.lg};
  }

  p {
    font-size: ${Theme.font.size.xs};
    margin: 24px 0px 32px;
    color: ${Theme.text.color.tertiary};
    line-height: 1.5;
    text-align: left;
  }

  @media (min-width: 950px) {
    padding: 32px 0px 0px 32px;
  }
`;

const StyledButtonText = styled.div`
  margin-left: 8px;
  text-decoration: none;
`;

const StyledRightColumn = styled.div`
  display: flex;
  border-bottom-right-radius: 16px;
  overflow: hidden;
  min-width: 40%;
  @media (max-width: 950px) {
    display: none;
  }

  @media (min-width: 1530px) {
    justify-content: end;
  }

  img {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    max-width: fit-content;
    margin: 0;
  }
`;

const StyledButtonContainer = styled.div`
  text-decoration: none;

  @media (min-width: 950px) {
    padding-bottom: 32px;
  }
`;

export default function ArticleEditContent() {
  const pathname = usePathname().replace('/section', '');
  return (
    <StyledContainer>
      <div>
        <h2 id="edit">Noticed something to change?</h2>
        <p>
          As an open-source company, we welcome contributions through Github.
          Help us keep it up-to-date, accurate, and easy to understand by
          getting involved and sharing your ideas!
        </p>
        <StyledButtonContainer>
          <a
            href={`https://github.com/twentyhq/twenty/blob/main/packages/twenty-website/src/content${pathname}.mdx`}
            target="_blank"
            style={{ textDecoration: 'none' }}
          >
            <StyledButton>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 0.449951C4.475 0.449951 0 4.92495 0 10.45C0 14.875 2.8625 18.6125 6.8375 19.9375C7.3375 20.025 7.525 19.725 7.525 19.4625C7.525 19.225 7.5125 18.4375 7.5125 17.6C5 18.0625 4.35 16.9875 4.15 16.425C4.0375 16.1375 3.55 15.25 3.125 15.0125C2.775 14.825 2.275 14.3625 3.1125 14.35C3.9 14.3375 4.4625 15.075 4.65 15.375C5.55 16.8875 6.9875 16.4625 7.5625 16.2C7.65 15.55 7.9125 15.1125 8.2 14.8625C5.975 14.6125 3.65 13.75 3.65 9.92495C3.65 8.83745 4.0375 7.93745 4.675 7.23745C4.575 6.98745 4.225 5.96245 4.775 4.58745C4.775 4.58745 5.6125 4.32495 7.525 5.61245C8.325 5.38745 9.175 5.27495 10.025 5.27495C10.875 5.27495 11.725 5.38745 12.525 5.61245C14.4375 4.31245 15.275 4.58745 15.275 4.58745C15.825 5.96245 15.475 6.98745 15.375 7.23745C16.0125 7.93745 16.4 8.82495 16.4 9.92495C16.4 13.7625 14.0625 14.6125 11.8375 14.8625C12.2 15.175 12.5125 15.775 12.5125 16.7125C12.5125 18.05 12.5 19.125 12.5 19.4625C12.5 19.725 12.6875 20.0375 13.1875 19.9375C17.1375 18.6125 20 14.8625 20 10.45C20 4.92495 15.525 0.449951 10 0.449951Z"
                  fill="white"
                />
              </svg>
              <StyledButtonText>Edit Content</StyledButtonText>
            </StyledButton>
          </a>
        </StyledButtonContainer>
      </div>
      <StyledRightColumn>
        <img
          src="/images/user-guide/github/github-edit-content.png"
          alt="twenty github image"
        />
      </StyledRightColumn>
    </StyledContainer>
  );
}
