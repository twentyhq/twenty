import { McpServerExceptionCode } from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { validateMcpServerSignInInputOrThrow } from 'src/engine/metadata-modules/mcp-server/utils/validate-mcp-server-sign-in-input-or-throw.util';

describe('validateMcpServerSignInInputOrThrow', () => {
  it('rejects a sign-in scope next to an explicit connection provider', () => {
    expect(() =>
      validateMcpServerSignInInputOrThrow({
        connectionProviderId: 'provider-id',
        signInScope: 'USER',
      }),
    ).toThrow(
      expect.objectContaining({
        code: McpServerExceptionCode.INVALID_MCP_SERVER_INPUT,
      }),
    );
  });

  it.each([
    { connectionProviderId: 'provider-id', signInScope: undefined },
    { connectionProviderId: 'provider-id', signInScope: null },
    { connectionProviderId: undefined, signInScope: 'WORKSPACE' as const },
    { connectionProviderId: null, signInScope: 'USER' as const },
    { connectionProviderId: undefined, signInScope: undefined },
  ])('accepts %o', (input) => {
    expect(() => validateMcpServerSignInInputOrThrow(input)).not.toThrow();
  });
});
