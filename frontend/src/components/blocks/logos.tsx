import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import mercuryLogo from "@/assets/images/logos/mercury.svg";
import watershedLogo from "@/assets/images/logos/watershed.svg";
import retoolLogo from "@/assets/images/logos/retool.svg";
import descriptLogo from "@/assets/images/logos/descript.svg";

import perplexityLogo from "@/assets/images/logos/perplexity.svg";
import monzoLogo from "@/assets/images/logos/monzo.svg";
import rampLogo from "@/assets/images/logos/ramp.svg";
import raycastLogo from "@/assets/images/logos/raycast.svg";
import arcLogo from "@/assets/images/logos/arc.svg";

type Company = {
  name: string;
  logo: string;
  width: number;
  height: number;
  href: string;
};

export const Logos = () => {
  const topRowCompanies: Company[] = [
    {
      name: "Mercury",
      logo: mercuryLogo,
      width: 143,
      height: 26,
      href: "https://mercury.com",
    },
    {
      name: "Watershed",
      logo: watershedLogo,
      width: 154,
      height: 31,
      href: "https://watershed.com",
    },
    {
      name: "Retool",
      logo: retoolLogo,
      width: 113,
      height: 22,
      href: "https://retool.com",
    },
    {
      name: "Descript",
      logo: descriptLogo,
      width: 112,
      height: 27,
      href: "https://descript.com",
    },
  ];

  const bottomRowCompanies: Company[] = [
    {
      name: "Perplexity",
      logo: perplexityLogo,
      width: 141,
      height: 32,
      href: "https://perplexity.com",
    },
    {
      name: "Monzo",
      logo: monzoLogo,
      width: 104,
      height: 18,
      href: "https://monzo.com",
    },
    {
      name: "Ramp",
      logo: rampLogo,
      width: 105,
      height: 28,
      href: "https://ramp.com",
    },
    {
      name: "Raycast",
      logo: raycastLogo,
      width: 128,
      height: 33,
      href: "https://raycast.com",
    },
    {
      name: "Arc",
      logo: arcLogo,
      width: 90,
      height: 28,
      href: "https://arc.com",
    },
  ];

  return (
    <section className='pb-28 lg:pb-32 overflow-hidden'>
      <div className='container space-y-10 lg:space-y-16'>
        <div className='text-center'>
          <h2 className='mb-4 text-xl md:text-2xl lg:text-3xl text-balance'>
            Powering the world&apos;s best product teams.
            <br className='max-md:hidden' />
            <span className='text-muted-foreground'>
              {" "}
              From next-gen startups to established enterprises.
            </span>
          </h2>
        </div>

        <div className='flex w-full flex-col items-center gap-10'>
          <LogoRow companies={topRowCompanies} gridClassName='grid-cols-4' />
          <LogoRow companies={bottomRowCompanies} gridClassName='grid-cols-5' />
        </div>
      </div>
    </section>
  );
};

type LogoRowProps = {
  companies: Company[];
  gridClassName: string;
};

const LogoRow = ({ companies, gridClassName }: LogoRowProps) => {
  return (
    <>
      {/* Desktop */}
      <div className='hidden md:block'>
        <div
          className={cn(
            "grid items-center justify-items-center gap-x-20 lg:gap-x-28",
            gridClassName
          )}
        >
          {companies.map(company => (
            <Link
              to={company.href}
              target='_blank'
              rel='noopener noreferrer'
              key={company.name}
            >
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                width={company.width}
                height={company.height}
                className='
                  object-contain
                  opacity-50
                  transition-opacity
                  hover:opacity-70
                  dark:invert
                  dark:opacity-100
                '
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className='md:hidden'>
        <div className='flex flex-wrap justify-center gap-x-8 gap-y-6'>
          {companies.map(company => (
            <Link
              to={company.href}
              target='_blank'
              rel='noopener noreferrer'
              key={company.name}
              className='flex items-center justify-center opacity-70 transition-opacity hover:opacity-100'
            >
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className='
                  h-6
                  max-w-[120px]
                  object-contain
                  dark:invert
                '
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
