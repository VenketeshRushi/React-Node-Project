import { About } from "@/components/blocks/about";
import { AboutHero } from "@/components/blocks/about-hero";
import { Investors } from "@/components/blocks/investors";
import { DashedLine } from "@/components/ui/dashed-line";

export default function AboutPage() {
  return (
    <div>
      <AboutHero />
      <About />
      <div className='pt-28 lg:pt-32'>
        <DashedLine className='container max-w-5xl scale-x-115' />
        <Investors />
      </div>
    </div>
  );
}
