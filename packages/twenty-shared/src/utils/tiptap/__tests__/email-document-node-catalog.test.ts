import {
  EMAIL_DOCUMENT_NODE_CATALOG,
  EMAIL_DOCUMENT_NODE_TYPES,
  isEmailDocumentNodeType,
  isRenderedEmailDocumentNodeType,
} from '../email-document-node-catalog';

describe('EMAIL_DOCUMENT_NODE_CATALOG', () => {
  it('defines every email document node exactly once', () => {
    expect(Object.keys(EMAIL_DOCUMENT_NODE_CATALOG).sort()).toEqual(
      Object.values(EMAIL_DOCUMENT_NODE_TYPES).sort(),
    );
  });

  it('distinguishes nodes rendered by their parent from renderer entries', () => {
    expect(isRenderedEmailDocumentNodeType('paragraph')).toBe(true);
    expect(isRenderedEmailDocumentNodeType('column')).toBe(false);
    expect(isRenderedEmailDocumentNodeType('doc')).toBe(false);
  });

  it('rejects node types outside the email document vocabulary', () => {
    expect(isEmailDocumentNodeType('mentionTag')).toBe(false);
  });
});
