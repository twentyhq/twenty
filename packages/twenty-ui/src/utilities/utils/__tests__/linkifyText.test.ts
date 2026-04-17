import { linkifyText } from '../linkifyText';

describe('linkifyText', () => {
  it('splits text around a URL into text and link segments', () => {
    expect(linkifyText('visit https://example.com today')).toEqual([
      { type: 'text', content: 'visit ' },
      { type: 'link', content: 'https://example.com' },
      { type: 'text', content: ' today' },
    ]);
  });

  it('returns text as-is when no URLs are present', () => {
    expect(linkifyText('no links here')).toEqual([
      { type: 'text', content: 'no links here' },
    ]);
  });

  it('parses Teams meeting descriptions with angle-bracket URLs and encoded characters', () => {
    const teamsDescription =
      'Need help?<https://aka.ms/JoinTeamsMeeting?omkt=en-GB> | System reference<https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc%40thread.v2>';

    const result = linkifyText(teamsDescription);

    expect(result).toEqual([
      { type: 'text', content: 'Need help?<' },
      {
        type: 'link',
        content: 'https://aka.ms/JoinTeamsMeeting?omkt=en-GB',
      },
      { type: 'text', content: '> | System reference<' },
      {
        type: 'link',
        content:
          'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc%40thread.v2',
      },
      { type: 'text', content: '>' },
    ]);
  });

  it('returns empty array for empty string', () => {
    expect(linkifyText('')).toEqual([]);
  });
});
