import type { CaseStudyData } from '@/app/case-studies/_constants/types';
import { Container, Eyebrow } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Image from 'next/image';

const Section = styled.section`
  background-color: ${theme.colors.secondary.background[5]};
  color: ${theme.colors.primary.text[100]};
  min-width: 0;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};
  padding-bottom: ${theme.spacing(16)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(16)};

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: row;
    gap: ${theme.spacing(15)};
    padding-bottom: ${theme.spacing(25)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(25)};
  }
`;

const QuoteColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(14)};
  margin: 0 auto;
  max-width: 900px;
  width: 100%;
`;

const QuoteText = styled.p`
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(8)};
  font-weight: ${theme.font.weight.light};
  line-height: ${theme.lineHeight(10)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(12)};
    line-height: ${theme.lineHeight(14)};
  }
`;

const Attribution = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(4)};
`;

const Avatar = styled.div`
  border-radius: ${theme.radius(1)};
  flex-shrink: 0;
  height: 48px;
  overflow: hidden;
  position: relative;
  width: 48px;
`;

const AvatarFallback = styled.div`
  align-items: center;
  background-color: ${theme.colors.highlight[100]};
  color: ${theme.colors.primary.text[100]};
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(5)};
  font-weight: ${theme.font.weight.medium};
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
`;

const AuthorNameRow = styled.div`
  align-items: center;
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  gap: ${theme.spacing(2)};
  line-height: ${theme.lineHeight(5.5)};
`;

const AuthorName = styled.span`
  font-weight: ${theme.font.weight.medium};
`;

const AuthorHandle = styled.span`
  font-weight: ${theme.font.weight.regular};
`;

const AuthorDate = styled.span`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(3.5)};
`;

type TestimonialProps = {
  testimonial: CaseStudyData['testimonial'];
};

export function Testimonial({ testimonial }: TestimonialProps) {
  const initials = testimonial.author.name
    .split(' ')
    .map((word) => word[0])
    .join('');

  return (
    <Section>
      <StyledContainer>
        <QuoteColumn>
          <Eyebrow
            colorScheme="primary"
            heading={{ fontFamily: 'sans', text: testimonial.eyebrow }}
          />

          <QuoteText>{testimonial.quote}</QuoteText>

          <Attribution>
            <Avatar>
              {testimonial.author.avatarSrc ? (
                <Image
                  alt={testimonial.author.name}
                  fill
                  sizes="48px"
                  src={testimonial.author.avatarSrc}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            <AuthorInfo>
              <AuthorNameRow>
                <AuthorName>{testimonial.author.name}</AuthorName>
                <AuthorHandle>{testimonial.author.handle}</AuthorHandle>
              </AuthorNameRow>
              <AuthorDate>{testimonial.author.date}</AuthorDate>
            </AuthorInfo>
          </Attribution>
        </QuoteColumn>
      </StyledContainer>
    </Section>
  );
}
