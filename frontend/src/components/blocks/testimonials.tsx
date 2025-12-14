import { ArrowRight } from "lucide-react";
import { DashedLine } from "@/components/ui/dashed-line";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

import amyChase from "@/assets/images/testimonials/amy-chase.webp";
import jonasKotara from "@/assets/images/testimonials/jonas-kotara.webp";
import kevinYam from "@/assets/images/testimonials/kevin-yam.webp";
import kundoMarta from "@/assets/images/testimonials/kundo-marta.webp";

const items = [
  {
    quote:
      "Switching to Genie streamlined our workflow and boosted team focus instantly.",
    author: "Sophia Martinez",
    role: "Product Manager",
    company: "FlowSpace Labs",
    image: amyChase,
  },
  {
    quote:
      "Genie automated most of our reporting — now our engineers can actually build.",
    author: "Daniel Kim",
    role: "Lead Engineer",
    company: "TechNova",
    image: jonasKotara,
  },
  {
    quote:
      "Running a startup is chaos — Genie gave us structure without slowing us down.",
    author: "Kevin Yam",
    role: "Founder",
    company: "Launchverse",
    image: kevinYam,
  },
  {
    quote: "Genie feels like an extra team member who never forgets a task.",
    author: "Lena Howard",
    role: "Co-founder",
    company: "Nimbus AI",
    image: kundoMarta,
  },
  {
    quote:
      "Our entire roadmap lives inside Genie now — and it’s actually enjoyable to manage.",
    author: "Priya Patel",
    role: "Product Lead",
    company: "Visionary Labs",
    image: amyChase,
  },
  {
    quote:
      "We replaced three separate tools with Genie Simpler, faster, and more reliable.",
    author: "John Doe",
    role: "CTO",
    company: "CloudEdge",
    image: jonasKotara,
  },
  {
    quote:
      "The collaboration features are so smooth, our weekly standups cut in half.",
    author: "Emily Zhang",
    role: "Project Manager",
    company: "DesignCore",
    image: kevinYam,
  },
  {
    quote:
      "Genie keeps our distributed team aligned better than any app we’ve used.",
    author: "Mark Jensen",
    role: "Operations Head",
    company: "RemoteFlow",
    image: kundoMarta,
  },
];

export const Testimonials = ({
  className,
  dashedLineClassName,
}: {
  className?: string;
  dashedLineClassName?: string;
}) => {
  return (
    <>
      <section className={cn("overflow-hidden py-12 lg:py-24", className)}>
        <div className='container'>
          <div className='space-y-4'>
            <h2 className='text-2xl tracking-tight md:text-4xl lg:text-5xl'>
              Trusted by product builders
            </h2>
            <p className='text-muted-foreground max-w-md leading-snug'>
              Genie is built on the habits that make the best product teams
              successful: staying focused, moving quickly, and always aiming for
              high-quality work.
            </p>
            <Button variant='outline' className='shadow-md'>
              Read our Customer Stories <ArrowRight className='size-4' />
            </Button>
          </div>

          <div className='relative mt-8 -mr-[max(3rem,calc((100vw-80rem)/2+3rem))] md:mt-12 lg:mt-20'>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className='w-full'
            >
              <CarouselContent>
                {items.map((testimonial, index) => (
                  <CarouselItem
                    key={index}
                    className='xl:basis-1/3.5 grow basis-4/5 sm:basis-3/5 md:basis-2/5 lg:basis-[28%] 2xl:basis-[24%]'
                  >
                    <Card className='bg-muted h-full overflow-hidden border-none p-0'>
                      <CardContent className='flex h-full flex-col p-0'>
                        <div className='relative h-[288px] lg:h-[328px] overflow-hidden'>
                          <img
                            src={testimonial.image}
                            alt={testimonial.author}
                            className='absolute inset-0 w-full h-full object-cover object-top'
                          />
                        </div>

                        <div className='flex flex-1 flex-col justify-between gap-10 p-6'>
                          <blockquote className='font-display text-lg leading-none! font-medium md:text-xl lg:text-2xl'>
                            {testimonial.quote}
                          </blockquote>
                          <div className='space-y-0.5'>
                            <div className='text-primary font-semibold'>
                              {testimonial.author}, {testimonial.role}
                            </div>
                            <div className='text-muted-foreground text-sm'>
                              {testimonial.company}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className='mt-8 flex gap-3'>
                <CarouselPrevious className='bg-muted hover:bg-muted/80 static size-14.5 translate-x-0 translate-y-0 transition-colors [&>svg]:size-6 lg:[&>svg]:size-8' />
                <CarouselNext className='bg-muted hover:bg-muted/80 static size-14.5 translate-x-0 translate-y-0 transition-colors [&>svg]:size-6 lg:[&>svg]:size-8' />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      <DashedLine
        orientation='horizontal'
        className={cn("mx-auto max-w-[80%]", dashedLineClassName)}
      />
    </>
  );
};
