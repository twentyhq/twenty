import { parseWorkspaceIdFromAwsSesResourceArn } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/parse-workspace-id-from-aws-ses-resource-arn.util';

describe('parseWorkspaceIdFromAwsSesResourceArn', () => {
  // Tenant ARNs carry an opaque AWS id segment after the tenant name that must be discarded
  it.each([
    {
      label: 'tenant ARN (drops the AWS-assigned tenant-id segment)',
      arn: 'arn:aws:ses:us-east-1:123456789012:tenant/twenty-workspace-ws1/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    },
    {
      label: 'configuration-set ARN (single segment after resource type)',
      arn: 'arn:aws:ses:us-east-1:123456789012:configuration-set/twenty-workspace-ws1',
    },
    {
      label: 'identity ARN (single segment after resource type)',
      arn: 'arn:aws:ses:us-east-1:123456789012:identity/twenty-workspace-ws1',
    },
  ])('extracts the workspaceId from a $label', ({ arn }) => {
    expect(parseWorkspaceIdFromAwsSesResourceArn(arn)).toBe('ws1');
  });

  it('preserves the workspaceId verbatim when it is a UUID', () => {
    expect(
      parseWorkspaceIdFromAwsSesResourceArn(
        'arn:aws:ses:us-east-1:123456789012:tenant/twenty-workspace-20202020-cb1b-4e35-b50f-2bbd09c3b1ee/9b1deb4d',
      ),
    ).toBe('20202020-cb1b-4e35-b50f-2bbd09c3b1ee');
  });

  // The prefix check alone stops foreign SES resources; an empty workspaceId would yield an empty WHERE downstream
  it.each([
    {
      label: 'foreign prefix',
      arn: 'arn:aws:ses:us-east-1:123456789012:tenant/some-other-prefix/abc',
    },
    {
      label: 'empty workspaceId after the prefix',
      arn: 'arn:aws:ses:us-east-1:123456789012:tenant/twenty-workspace-/abc',
    },
    {
      label: 'malformed ARN with no resource segment',
      arn: 'arn:aws:ses:us-east-1:123456789012:tenant',
    },
    { label: 'empty string', arn: '' },
  ])('returns null for $label', ({ arn }) => {
    expect(parseWorkspaceIdFromAwsSesResourceArn(arn)).toBeNull();
  });
});
