import { FAQ } from "@/components/blocks/faq";
import { Features } from "@/components/blocks/features";
import { Hero } from "@/components/blocks/hero";
import { Logos } from "@/components/blocks/logos";
import { Pricing } from "@/components/blocks/pricing";
import { ResourceAllocation } from "@/components/blocks/resource-allocation";
import { MarqueeReview } from "@/components/blocks/review-section";
import { Testimonials } from "@/components/blocks/testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <Logos />
      <Features />
      <ResourceAllocation />
      <Testimonials />
      <Pricing />
      <MarqueeReview />
      <FAQ />
    </>
  );
}
