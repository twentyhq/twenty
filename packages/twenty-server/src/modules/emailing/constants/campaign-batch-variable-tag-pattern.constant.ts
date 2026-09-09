// Matches the positional tags compileCampaignBatchTemplate emits for campaign
// variables ({{v_h_0}}, {{v_t_0}}, {{v_u_0}}); the capture is the variable index.
export const CAMPAIGN_BATCH_VARIABLE_TAG_PATTERN = /\{\{v_[htu]_(\d+)\}\}/g;
