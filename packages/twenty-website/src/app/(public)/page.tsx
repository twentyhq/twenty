import { ContentContainer } from '../_components/ui/layout/ContentContainer';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <ContentContainer>
      <div style={{ minHeight: '60vh', marginTop: '50px' }}>
        Part of the website is built directly with Framer, including the
        homepage. <br />
        We use Cloudflare to split the traffic between the two sites.
      </div>
    </ContentContainer>
  );
}
