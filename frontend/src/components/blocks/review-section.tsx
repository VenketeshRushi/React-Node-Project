import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";
import { StarIcon } from "lucide-react"; // Assuming you have lucide-react, standard in shadcn/ui

const reviews = [
  {
    name: "Sarah Chen",
    role: "Product Manager at TechFlow", // Added role for credibility
    body: "This platform transformed how we handle customer feedback. The insights are incredible and actionable.",
    img: "https://avatar.vercel.sh/sarah",
  },
  {
    name: "Marcus Johnson",
    role: "CTO at Nexus",
    body: "Finally, a solution that actually listens to what our customers are saying. Game-changer for our business.",
    img: "https://avatar.vercel.sh/marcus",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of CS at Saphire",
    body: "The AI-powered analysis helped us identify issues we never knew existed. Highly recommend!",
    img: "https://avatar.vercel.sh/emily",
  },
  {
    name: "David Kim",
    role: "Director at K-Corp",
    body: "Seamless integration with our existing workflow. The team adoption was surprisingly smooth.",
    img: "https://avatar.vercel.sh/david",
  },
  {
    name: "Lisa Thompson",
    role: "VP of Sales at Horizon",
    body: "Customer satisfaction scores improved by 40% after implementing their recommendations.",
    img: "https://avatar.vercel.sh/lisa",
  },
  {
    name: "Alex Rivera",
    role: "Founder at StartUp",
    body: "The real-time dashboard gives us insights we can act on immediately. Fantastic product.",
    img: "https://avatar.vercel.sh/alex",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  role,
  body,
}: {
  img: string;
  name: string;
  role: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-80 cursor-pointer overflow-hidden rounded-2xl border p-6 transition-all duration-300 ease-out",
        // Light mode styling
        "border-zinc-200 bg-white/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 hover:border-zinc-300",
        // Dark mode styling
        "dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:hover:border-zinc-700"
      )}
    >
      <div className='flex flex-row items-center gap-3'>
        <img
          className='rounded-full border border-zinc-200 dark:border-zinc-800'
          width={40}
          height={40}
          alt={`${name}'s avatar`}
          src={img}
        />
        <div className='flex flex-col'>
          <figcaption className='text-sm font-semibold text-foreground'>
            {name}
          </figcaption>
          <p className='text-xs font-medium text-muted-foreground'>{role}</p>
        </div>
      </div>

      {/* Added Star Rating for Trust Signal */}
      <div className='mt-3 flex gap-0.5'>
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className='size-3.5 fill-amber-400 text-amber-400'
          />
        ))}
      </div>

      <blockquote className='mt-3 text-sm leading-relaxed text-muted-foreground'>
        {body}
      </blockquote>
    </figure>
  );
};

export function MarqueeReview() {
  return (
    <section className='relative flex w-full flex-col items-center justify-center overflow-hidden py-12 sm:py-16'>
      <div className='space-y-4 text-center mb-12 px-4'>
        {/* Pill Badge */}
        <div className='inline-flex items-center rounded-full border border-zinc-200 bg-white/50 px-3 py-1 text-xs font-medium text-zinc-800 backdrop-blur-[2px] dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200'>
          <span className='flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse'></span>
          Wall of Love
        </div>

        <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-foreground'>
          Trusted by{" "}
          <span className='text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60'>
            industry leaders
          </span>
        </h2>
        <p className='mx-auto max-w-[600px] text-muted-foreground md:text-lg'>
          Join thousands of teams who have transformed their customer insights
          workflow with our platform.
        </p>
      </div>

      <div className='relative w-full max-w-[1400px]'>
        {/* Using mask-image for a true transparent fade */}
        <div className='relative flex flex-col gap-6 mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]'>
          <Marquee pauseOnHover className='[--duration:40s]'>
            {firstRow.map(review => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </Marquee>

          <Marquee reverse pauseOnHover className='[--duration:40s]'>
            {secondRow.map(review => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
