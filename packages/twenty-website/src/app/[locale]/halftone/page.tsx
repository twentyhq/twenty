import { HalftoneStudio } from '@/app/[locale]/halftone/_components/HalftoneStudio';
import { buildRouteMetadata } from '@/lib/seo';

export const generateMetadata = buildRouteMetadata('halftone');

export default function HalftonePage() {
  return <HalftoneStudio />;
}
