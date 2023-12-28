import { ContentContainer } from '@/app/components/ContentContainer';

const DeveloperDocsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ContentContainer>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            borderRight: '1px solid rgba(20, 20, 20, 0.08)',
            paddingRight: '24px',
            minWidth: '200px',
            paddingTop: '48px',
          }}
        >
          <h4 style={{ textTransform: 'uppercase', color: '#B3B3B3' }}>
            Install & Maintain
          </h4>
          <a style={{ textDecoration: 'none', color: '#333' }} href="/">
            Local setup
          </a>{' '}
          <br />
          <a style={{ textDecoration: 'none', color: '#333' }} href="/">
            Self-hosting
          </a>{' '}
          <br />
          <a style={{ textDecoration: 'none', color: '#333' }} href="/">
            Upgrade guide
          </a>{' '}
          <br /> <br />
          <h4 style={{ textTransform: 'uppercase', color: '#B3B3B3' }}>
            Resources
          </h4>
          <a
            style={{ textDecoration: 'none', color: '#333' }}
            href="/developers/graphql"
          >
            GraphQL API
          </a>{' '}
          <br />
          <a
            style={{ textDecoration: 'none', color: '#333' }}
            href="/developers/rest"
          >
            Rest API
          </a>{' '}
          <br />
          <a style={{ textDecoration: 'none', color: '#333' }} href="/">
            Twenty UI
          </a>{' '}
          <br /> <br />
          <h4 style={{ textTransform: 'uppercase', color: '#B3B3B3' }}>
            Contribute
          </h4>
          <a style={{ textDecoration: 'none', color: '#333' }} href="/">
            Guidelines
          </a>{' '}
          <br />
          <a style={{ textDecoration: 'none', color: '#333' }} href="/">
            Frontend
          </a>{' '}
          <br />
          <a style={{ textDecoration: 'none', color: '#333' }} href="/">
            Backend
          </a>{' '}
          <br />
        </div>
        <div style={{ padding: '24px', minHeight: '80vh', width: '100%' }}>
          {children}
        </div>
      </div>
    </ContentContainer>
  );
};

export default DeveloperDocsLayout;
