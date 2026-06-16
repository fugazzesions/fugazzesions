import { Hero } from '@/components/landing/Hero';
import { QuickSections } from '@/components/landing/QuickSections';
import { UpcomingPreview } from '@/components/landing/UpcomingPreview';

export default function Home() {
  return (
    <>
      <Hero />
      <QuickSections />
      <UpcomingPreview />
    </>
  );
}