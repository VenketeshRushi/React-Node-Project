import {
  ArrowRight,
  Blend,
  ChartNoAxesColumn,
  CircleDot,
  Diamond,
} from "lucide-react";
import { DashedLine } from "@/components/ui/dashed-line";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import heroImg from "@/assets/images/hero.webp";

const features = [
  {
    title: "Tailored workflows",
    description: "Track progress across custom issue flows for your team.",
    icon: CircleDot,
  },
  {
    title: "Cross-team projects",
    description: "Collaborate across teams and departments.",
    icon: Blend,
  },
  {
    title: "Milestones",
    description: "Break projects down into concrete phases.",
    icon: Diamond,
  },
  {
    title: "Progress insights",
    description: "Track scope, velocity, and progress over time.",
    icon: ChartNoAxesColumn,
  },
];

export const Hero = () => {
  return (
    <section className='py-6 lg:py-8 pt-0'>
      <div className='container flex flex-col justify-between gap-8 md:gap-14 lg:flex-row lg:gap-20'>
        <div className='flex-1'>
          <h1 className='max-w-3xl text-3xl tracking-tight text-foreground md:text-4xl lg:text-5xl'>
            Empowering Ideas Through{" "}
            <span className='text-primary'>Design</span>,{" "}
            <span className='text-primary'>Engineering</span> &{" "}
            <span className='text-primary'>Web Innovation</span>
          </h1>

          <p className='mt-5 text-lg text-muted-foreground md:text-xl'>
            We are a modern digital agency providing resource allocation,
            product design, and web development solutions that help businesses
            scale efficiently.
          </p>

          <div className='mt-8 flex flex-wrap items-center gap-4'>
            <Button asChild>
              <Link to='#contact'>Start a Project</Link>
            </Button>

            <Button variant='outline' className='gap-2 shadow-md' asChild>
              <Link to='/services'>
                Explore Our Services
                <ArrowRight className='size-4' />
              </Link>
            </Button>
          </div>
        </div>

        <div className='relative flex flex-1 flex-col justify-center space-y-5 pt-10 lg:pl-10 lg:pt-0'>
          <DashedLine
            orientation='vertical'
            className='absolute left-0 top-0 hidden lg:block'
          />
          <DashedLine
            orientation='horizontal'
            className='absolute top-0 lg:hidden'
          />

          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className='flex gap-2.5 lg:gap-5'>
                <Icon className='mt-1 size-4 shrink-0 text-foreground lg:size-5' />
                <div>
                  <h2 className='font-semibold text-foreground'>
                    {feature.title}
                  </h2>
                  <p className='max-w-xs text-sm text-muted-foreground'>
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className='mt-12 md:mt-20 lg:container lg:mt-24'>
        <div className='relative aspect-video w-full overflow-hidden lg:aspect-21/9'>
          <img
            src={heroImg}
            alt='Hero showcasing our design and development work'
            className='w-full h-full rounded-2xl object-cover shadow-lg'
            loading='eager'
          />
        </div>
      </div>
    </section>
  );
};
