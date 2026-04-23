/**
 * Public surface of the partner-application domain.
 *
 * The modal provider is mounted globally in `app/layout.tsx` (mirrors
 * `lib/contact-cal`'s pattern) so that `usePartnerApplicationModal` is
 * always safe to call from any section, regardless of which page is
 * rendering it.
 */
export {
  PartnerApplicationModalRoot,
  usePartnerApplicationModal,
} from './PartnerApplicationModalRoot';

export {
  PARTNER_APPLICATION_MODAL_COPY,
  PARTNER_PROGRAM_OPTIONS,
  type PartnerProgramId,
} from './partner-application-modal-data';

export { splitFullName } from './split-full-name';
