import { HalftoneStudio } from '@/app/[locale]/halftone/_components/HalftoneStudio';
import { buildLocalizedMetadata } from '@/lib/seo';

export const generateMetadata = buildLocalizedMetadata({
  path: '/halftone',
  title: 'Halftone Generator | Twenty',
  description: 'Interactive halftone generator exported from Twenty.',
});

export default function HalftonePage() {
  return <HalftoneStudio />;
}
