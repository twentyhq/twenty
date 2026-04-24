import { HalftoneStudio } from '@/app/halftone/_components/HalftoneStudio';
import { buildPageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = buildPageMetadata({
  path: '/halftone',
  title: 'Halftone Generator | Twenty',
  description: 'Interactive halftone generator exported from Twenty.',
});

export default function HalftonePage() {
  return <HalftoneStudio />;
}
