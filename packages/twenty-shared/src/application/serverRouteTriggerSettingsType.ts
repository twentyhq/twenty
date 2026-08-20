export type ServerRouteTriggerSettings = {
  forwardedRequestHeaders?: string[];
  // Opt-in because a resolver written for POST throws on a bodyless request, and
  // GET is the one method crawlers, link unfurlers and scanners send unprompted.
  isGetAllowed?: boolean;
};
