// null means "not tracked", never zero engagement.
export type CampaignEngagementCounts = {
  clickedCount: number | null;
  clickRate: number | null;
};
