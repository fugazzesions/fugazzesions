import { Hero } from '@/components/landing/Hero';
import { UpcomingPreview } from '@/components/landing/UpcomingPreview';

export default function Home() {
  return (
    <>
      <Hero imageSrc="/banner-hero.png" />
      <UpcomingPreview />
    </>
  );
}