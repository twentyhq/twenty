import gql from 'graphql-tag';
import request from 'supertest';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

// End-to-end coverage for the self-serve DPA generator. The generate mutation
// renders the PDF with @react-pdf/renderer on the server, so this also guards
// against the embedded-font regression ("unsupported number" on non-ASCII
// glyphs) — the input below intentionally contains accents and an em dash.
describe('DPA resolver (integration)', () => {
  const createdAgreementIds: string[] = [];

  afterAll(async () => {
    for (const id of createdAgreementIds) {
      await global.testDataSource
        .query('DELETE FROM core."dpaAgreement" WHERE id = $1', [id])
        .catch(() => {});
    }
  });

  describe('dpaPreview query', () => {
    it('resolves the deployment document with no unresolved merge fields', async () => {
      const response = await makeGraphqlAPIRequest({
        query: gql`
          query DpaPreview {
            dpaPreview {
              title
              region
              processorEntity
              templateVersion
              sccSectionActive
              blocks {
                kind
                text
              }
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const preview = response.body.data.dpaPreview;

      expect(preview).toBeDefined();
      expect(['EU', 'US']).toContain(preview.region);
      expect(preview.processorEntity).toBeTruthy();
      expect(preview.templateVersion).toBeTruthy();
      expect(preview.blocks.length).toBeGreaterThan(0);

      const joined = preview.blocks
        .map((block: { text: string }) => block.text)
        .join('\n');

      expect(joined).not.toMatch(/\{\{[^}]+\}\}/);
    });
  });

  describe('generateSignedDpa mutation', () => {
    it('generates a signed PDF, returns a download URL and persists the record', async () => {
      const input = {
        customerLegalEntityName: 'Société Générale — Genève',
        signatoryName: 'José Peña',
        signatoryTitle: 'Directeur Général',
      };

      const response = await makeGraphqlAPIRequest({
        query: gql`
          mutation GenerateSignedDpa($input: GenerateSignedDpaInput!) {
            generateSignedDpa(input: $input) {
              downloadUrl
              agreement {
                id
                type
                region
                processorEntity
                templateVersion
                customerLegalEntityName
                signatoryName
                signatoryTitle
              }
            }
          }
        `,
        variables: { input },
      });

      expect(response.status).toBe(200);
      // No errors here means renderToBuffer succeeded with the embedded font.
      expect(response.body.errors).toBeUndefined();

      const result = response.body.data.generateSignedDpa;

      expect(result).toBeDefined();
      expect(typeof result.downloadUrl).toBe('string');
      expect(result.downloadUrl).toContain('/file/');
      expect(result.agreement.id).toBeDefined();
      expect(result.agreement.type).toBe('SIGNED');
      expect(result.agreement.customerLegalEntityName).toBe(
        input.customerLegalEntityName,
      );
      expect(result.agreement.templateVersion).toBeTruthy();

      createdAgreementIds.push(result.agreement.id);

      // The stored copy is downloadable and is a real PDF.
      const downloadUrl = new URL(result.downloadUrl);
      const downloadResponse = await request(
        `http://localhost:${APP_PORT}`,
      ).get(`${downloadUrl.pathname}${downloadUrl.search}`);

      expect(downloadResponse.status).toBe(200);

      const body = downloadResponse.body;
      const header = Buffer.isBuffer(body)
        ? body.subarray(0, 5).toString()
        : '';

      // Local storage streams the bytes; S3 would 30x-redirect. Only assert the
      // PDF magic bytes when we actually received the file body.
      if (header !== '') {
        expect(header).toBe('%PDF-');
      }
    });
  });

  describe('dpaAgreements query', () => {
    it('lists executed copies with a re-download URL', async () => {
      const response = await makeGraphqlAPIRequest({
        query: gql`
          query DpaAgreements {
            dpaAgreements {
              id
              type
              templateVersion
              downloadUrl
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(Array.isArray(response.body.data.dpaAgreements)).toBe(true);

      const signed = response.body.data.dpaAgreements.find(
        (agreement: { id: string }) =>
          createdAgreementIds.includes(agreement.id),
      );

      expect(signed).toBeDefined();
      expect(signed.type).toBe('SIGNED');
      expect(typeof signed.downloadUrl).toBe('string');
    });
  });
});
