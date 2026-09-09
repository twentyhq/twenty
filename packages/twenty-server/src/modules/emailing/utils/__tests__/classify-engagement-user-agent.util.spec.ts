import { CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS } from 'src/modules/emailing/constants/campaign-engagement-activity-class.constant';
import { classifyEngagementUserAgent } from 'src/modules/emailing/utils/classify-engagement-user-agent.util';

describe('classifyEngagementUserAgent', () => {
  it('treats the Apple Mail privacy proxy as a proxy, not a person', () => {
    expect(classifyEngagementUserAgent('Mozilla/5.0')).toEqual({
      activityClass: CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.PRIVACY_PROXY,
      classificationReasons: ['proxy:apple'],
      clientFamily: 'apple-mail',
    });
  });

  it('flags a security scanner as automation', () => {
    const result = classifyEngagementUserAgent(
      'Mozilla/5.0 (compatible; Mimecast Link Scanner)',
    );

    expect(result.activityClass).toBe(
      CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.SUSPECTED_AUTOMATION,
    );
    expect(result.classificationReasons).toContain('ua:mimecast');
  });

  it('leaves a desktop mail client unclassified', () => {
    expect(
      classifyEngagementUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
      ),
    ).toEqual({
      activityClass: CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.UNCLASSIFIED,
      classificationReasons: [],
      clientFamily: 'unknown',
    });
  });

  it('handles a missing user agent', () => {
    expect(classifyEngagementUserAgent(null).activityClass).toBe(
      CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS.UNCLASSIFIED,
    );
  });
});
