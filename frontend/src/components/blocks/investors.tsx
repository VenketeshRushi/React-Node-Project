import investor1 from "@/assets/images/investors/1.webp";
import investor2 from "@/assets/images/investors/2.webp";
import investor3 from "@/assets/images/investors/3.webp";
import investor4 from "@/assets/images/investors/4.webp";
import investor5 from "@/assets/images/investors/5.webp";

const investors = [
  {
    name: "Dennis Bouvard",
    company: "Blackbird Ventures",
    image: investor1,
  },
  {
    name: "Renatus Gerard",
    company: "Center Studies",
    image: investor2,
  },
  {
    name: "Leslie Alexander",
    company: "TechNexus",
    image: investor3,
  },
  {
    name: "Matthew Stephens",
    company: "Etymol Cap",
    image: investor4,
  },
  {
    name: "Josephine Newman",
    company: "Vandenberg",
    image: investor5,
  },
];

export function Investors() {
  return (
    <section className='container max-w-5xl py-12'>
      <h2 className='text-foreground text-4xl font-medium tracking-wide'>
        Our investors
      </h2>

      <div className='mt-8 grid grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {investors.map(investor => (
          <div key={investor.name}>
            <img
              src={investor.image}
              alt={investor.name}
              width={120}
              height={120}
              className='object-cover rounded-full'
            />
            <h3 className='mt-3 font-semibold'>{investor.name}</h3>
            <p className='text-muted-foreground'>{investor.company}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
