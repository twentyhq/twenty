import { HELPED_DATA } from '@/app/(home)/_constants/helped';
import { TESTIMONIALS_DATA as HOME_TESTIMONIALS_DATA } from '@/app/(home)/_constants/testimonials';
import { THREE_CARDS_ILLUSTRATION_DATA as HOME_THREE_CARDS_DATA } from '@/app/(home)/_constants/three-cards-illustration';
import { FAQ_DATA } from '@/app/_constants/faq';
import { FOOTER_DATA } from '@/app/_constants/footer';
import { TESTIMONIALS_DATA as PARTNER_TESTIMONIALS_DATA } from '@/app/partner/_constants/testimonials';
import { THREE_CARDS_ILLUSTRATION_DATA as PARTNER_THREE_CARDS_DATA } from '@/app/partner/_constants/three-cards-illustration';
import { PLANS_DATA } from '@/app/pricing/_constants/plans';
import { HERO_DATA as PRODUCT_HERO_DATA } from '@/app/product/_constants/hero';
import { THREE_CARDS_ILLUSTRATION_DATA as PRODUCT_THREE_CARDS_DATA } from '@/app/product/_constants/three-cards';
import { QUOTE_DATA } from '@/app/why-twenty/_constants/quote';
import { STEPPER_DATA } from '@/app/why-twenty/_constants/stepper';

const addIfGlb = (urls: Set<string>, src: string) => {
  if (src.toLowerCase().endsWith('.glb')) {
    urls.add(src);
  }
};

// Single list of on-disk GLBs used across marketing routes; keeps HTTP cache warm after first paint.
export const getAllWebsiteGlbUrls = (): string[] => {
  const urls = new Set<string>();

  addIfGlb(urls, FOOTER_DATA.illustration.src);
  addIfGlb(urls, FAQ_DATA.illustration.src);
  addIfGlb(urls, HOME_TESTIMONIALS_DATA.illustration.src);

  for (const card of HOME_THREE_CARDS_DATA.illustrationCards) {
    addIfGlb(urls, card.illustration.src);
  }

  for (const card of HELPED_DATA.cards) {
    addIfGlb(urls, card.illustration.src);
  }

  addIfGlb(urls, PLANS_DATA.pro.illustration.src);
  addIfGlb(urls, PLANS_DATA.organization.illustration.src);

  addIfGlb(urls, PRODUCT_HERO_DATA.illustration.src);

  for (const card of PRODUCT_THREE_CARDS_DATA.illustrationCards) {
    addIfGlb(urls, card.illustration.src);
  }

  for (const card of PARTNER_THREE_CARDS_DATA.illustrationCards) {
    addIfGlb(urls, card.illustration.src);
  }

  addIfGlb(urls, PARTNER_TESTIMONIALS_DATA.illustration.src);

  addIfGlb(urls, STEPPER_DATA.illustration.src);
  addIfGlb(urls, QUOTE_DATA.illustration.src);

  return [...urls];
};
