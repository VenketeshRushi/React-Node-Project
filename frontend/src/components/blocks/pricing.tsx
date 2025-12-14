import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    description: "Free for everyone",
    features: [
      "Unlimited members",
      "2 teams",
      "500 issues",
      "Slack and Github integrations",
    ],
    featured: false,
    buttonText: "Get Started",
  },
  {
    name: "Startup",
    monthlyPrice: "$8",
    yearlyPrice: "$6",
    description: "For growing teams",
    features: [
      "All free plan features and...",
      "Unlimited teams",
      "Unlimited issues and file uploads",
      "Admin roles",
    ],
    featured: true,
    buttonText: "Get Started",
  },
  {
    name: "Enterprise",
    monthlyPrice: "$8",
    yearlyPrice: "$6",
    description: "For large organizations",
    features: [
      "All free plan features and...",
      "SuperNotebook LLM AGI",
      "Free daily catered lunch",
      "random HIPPA audits",
    ],
    featured: false,
    buttonText: "Contact Sales",
  },
];

export const Pricing = ({ className }: { className?: string }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className={cn("py-24 lg:py-28", className)} id='pricing'>
      <div className='container mx-auto px-6'>
        <div className='mx-auto max-w-4xl text-center mb-20'>
          <div className='space-y-4 text-center'>
            <h2 className='text-2xl tracking-tight md:text-4xl lg:text-5xl'>
              Pricing
            </h2>
            <p className='text-muted-foreground mx-auto max-w-xl leading-snug text-balance'>
              Use Genie for free with your whole team. Upgrade to enable
              unlimited issues, enhanced security controls, and additional
              features.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl p-8 transition-all duration-500 hover:scale-105 min-h-[600px] ${
                plan.featured
                  ? "bg-linear-to-b from-primary/10 via-primary/10 to-accent/20 border-2 border-primary/30 shadow-2xl shadow-primary/20 lg:-translate-y-4"
                  : "bg-card/60 backdrop-blur-md border border-border/50 hover:border-border/80 hover:bg-card/80"
              }`}
            >
              {plan.featured && (
                <div className='absolute -top-6 left-1/2 -translate-x-1/2'>
                  <div className='rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-lg'>
                    Most Popular
                  </div>
                </div>
              )}

              <div className='flex flex-col flex-1'>
                <div className='text-center mb-8'>
                  <h3 className='text-2xl font-bold mb-4 text-foreground'>
                    {plan.name}
                  </h3>

                  <div className='mb-4'>
                    <span className='text-5xl font-bold text-foreground'>
                      {isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    {plan.name !== "Free" && (
                      <span className='text-muted-foreground text-lg'>
                        /user/mo
                      </span>
                    )}
                  </div>

                  <div className='h-8 flex items-center justify-center mb-4'>
                    {plan.name !== "Free" ? (
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={isAnnual}
                          onCheckedChange={() => setIsAnnual(!isAnnual)}
                          aria-label='Toggle annual billing'
                        />
                        <span className='text-sm font-medium text-muted-foreground'>
                          {isAnnual ? "Billed annually" : "Billed monthly"}
                        </span>
                      </div>
                    ) : (
                      <p className='text-muted-foreground text-sm'>
                        {plan.description}
                      </p>
                    )}
                  </div>
                </div>

                <ul className='space-y-4 flex-1 mb-8'>
                  {plan.features.map(feature => (
                    <li key={feature} className='flex items-start gap-3'>
                      <Check className='h-5 w-5 shrink-0 text-primary mt-0.5' />
                      <span className='text-muted-foreground'>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant='outline'
                  size='lg'
                  className={`w-full rounded-2xl font-semibold transition-all duration-300 cursor-pointer ${
                    plan.featured
                      ? "border border-border hover:shadow-xl hover:shadow-primary/25 text-primary hover:text-primary"
                      : "hover:bg-accent"
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className='text-center mt-16 space-y-6'>
          <p className='text-muted-foreground text-lg'>
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className='flex flex-wrap justify-center gap-8 text-sm'>
            {["No setup fees", "Cancel anytime", "Secure payment"].map(item => (
              <span
                key={item}
                className='flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/30'
              >
                <Check className='h-4 w-4 text-primary' />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
