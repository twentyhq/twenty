import { computeInputFields } from '../../utils/computeInputFields';

describe('computeInputFields', () => {
  test('should create Person input fields properly', () => {
    const personInfos = {
      type: 'object',
      properties: {
        email: {
          type: 'string',
        },
        xLink: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
            },
            label: {
              type: 'string',
            },
          },
        },
        avatarUrl: {
          type: 'string',
        },
        favorites: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Favorite',
          },
        },
      },
      example: {},
      required: ['avatarUrl'],
    };
    expect(computeInputFields(personInfos)).toEqual([
      { key: 'email', label: 'Email', required: false, type: 'string' },
      {
        key: 'xLink__url',
        label: 'X Link: Url',
        required: false,
        type: 'string',
      },
      {
        key: 'xLink__label',
        label: 'X Link: Label',
        required: false,
        type: 'string',
      },
      { key: 'avatarUrl', label: 'Avatar Url', required: true, type: 'string' },
    ]);
  });
});
