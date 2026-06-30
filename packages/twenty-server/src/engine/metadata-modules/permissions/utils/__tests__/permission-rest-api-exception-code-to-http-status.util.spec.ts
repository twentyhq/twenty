import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { permissionRestApiExceptionCodeToHttpStatus } from 'src/engine/metadata-modules/permissions/utils/permission-rest-api-exception-code-to-http-status.util';

describe('permissionRestApiExceptionCodeToHttpStatus', () => {
  it('should return 403 for PERMISSION_DENIED', () => {
    expect(
      permissionRestApiExceptionCodeToHttpStatus(
        PermissionsExceptionCode.PERMISSION_DENIED,
      ),
    ).toBe(403);
  });

  it('should return 403 for role-related forbidden cases', () => {
    expect(
      permissionRestApiExceptionCodeToHttpStatus(
        PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE,
      ),
    ).toBe(403);
  });

  it('should return 403 for NO_AUTHENTICATION_CONTEXT', () => {
    expect(
      permissionRestApiExceptionCodeToHttpStatus(
        PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      ),
    ).toBe(403);
  });

  it('should return 400 for INVALID_ARG', () => {
    expect(
      permissionRestApiExceptionCodeToHttpStatus(
        PermissionsExceptionCode.INVALID_ARG,
      ),
    ).toBe(400);
  });

  it('should return 400 for permission validation errors', () => {
    expect(
      permissionRestApiExceptionCodeToHttpStatus(
        PermissionsExceptionCode.EMPTY_FIELD_PERMISSION_NOT_ALLOWED,
      ),
    ).toBe(400);
  });

  it('should return 404 for ROLE_NOT_FOUND', () => {
    expect(
      permissionRestApiExceptionCodeToHttpStatus(
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      ),
    ).toBe(404);
  });

  it('should return 404 for metadata not found cases', () => {
    expect(
      permissionRestApiExceptionCodeToHttpStatus(
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      ),
    ).toBe(404);
  });

  it('should return 500 for METHOD_NOT_ALLOWED', () => {
    expect(
      permissionRestApiExceptionCodeToHttpStatus(
        PermissionsExceptionCode.METHOD_NOT_ALLOWED,
      ),
    ).toBe(500);
  });

  it('should return 500 for internal error codes', () => {
    expect(
      permissionRestApiExceptionCodeToHttpStatus(
        PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND,
      ),
    ).toBe(500);
  });
});
