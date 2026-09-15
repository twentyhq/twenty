import { ApiPath } from 'twenty-shared/types';

interface ApolloPlaygroundOptions {
  path?: ApiPath;
}

export const renderApolloPlayground = ({
  path = ApiPath.GraphQL,
}: ApolloPlaygroundOptions = {}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <body style="margin: 0; overflow-x: hidden; overflow-y: hidden">
      <div id="sandbox" style="height:100vh; width:100vw;"></div>
      <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
      <script>
      new window.EmbeddedSandbox({
        target: "#sandbox",
        // Pass through your server href if you are embedding on an endpoint.
        // Otherwise, you can pass whatever endpoint you want Sandbox to start up with here.
        initialEndpoint: "http://localhost:3000/${path}",
      });
      // advanced options: https://www.apollographql.com/docs/studio/explorer/sandbox#embedding-sandbox
      </script>
      </body>
    </html>`;
};
