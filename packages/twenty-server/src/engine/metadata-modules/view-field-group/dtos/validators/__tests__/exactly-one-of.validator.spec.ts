import { IsOptional, validateSync } from 'class-validator';

import { ExactlyOneOf } from 'src/engine/metadata-modules/view-field-group/dtos/validators/exactly-one-of.validator';

@ExactlyOneOf(['text', 'email'])
class ReplyInput {
  @IsOptional()
  text?: string;

  @IsOptional()
  email?: { subject: string };
}

const validate = (input: Partial<ReplyInput>) =>
  validateSync(Object.assign(new ReplyInput(), input));

describe('ExactlyOneOf', () => {
  it('should accept exactly one of the properties', () => {
    expect(validate({ text: 'Hello' })).toHaveLength(0);
    expect(validate({ email: { subject: 'Hello' } })).toHaveLength(0);
  });

  it('should refuse both properties', () => {
    expect(
      validate({ text: 'Hello', email: { subject: 'Hello' } }),
    ).toHaveLength(1);
  });

  it('should refuse neither property', () => {
    expect(validate({})).toHaveLength(1);
  });
});
