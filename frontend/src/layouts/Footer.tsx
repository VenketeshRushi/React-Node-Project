import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
  Zap,
  Globe,
  Wifi,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import GenieLogo from "./GenieLogo";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
    badge?: string;
  }[];
}

interface FooterProps {
  logo?: { url: string; title: string };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
}

const defaultMenu: MenuItem[] = [
  {
    title: "Platform",
    links: [
      { text: "Neural Engine", url: "/faq" },
      { text: "Data Grid", url: "/faq" },
      { text: "Integrations", url: "/faq" },
      { text: "Changelog", url: "/faq", badge: "New" },
    ],
  },
  {
    title: "Resources",
    links: [
      { text: "Documentation", url: "/about" },
      { text: "API Reference", url: "/faq" },
      { text: "Community", url: "/about" },
      { text: "Status", url: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { text: "About", url: "/about" },
      { text: "Blog", url: "/about" },
      { text: "Careers", url: "/contact" },
      { text: "Legal", url: "/contact" },
    ],
  },
];

export const Footer = ({
  logo = { url: "/", title: "Genie" },
  tagline = "Transforming Talk into Action",
  menuItems = defaultMenu,
  copyright = "© 2025 Genie Systems Nominal.",
}: FooterProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 3000);
  };

  return (
    <footer className='relative w-full bg-background text-muted-foreground overflow-hidden border-t'>
      <div
        className='absolute inset-0 bg-grid-white/[0.02] pointer-events-none'
        aria-hidden='true'
      />
      <div
        className='absolute -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none'
        aria-hidden='true'
      />
      <div
        className='absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent'
        aria-hidden='true'
      />

      <div className='relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-16 pb-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'>
          <div className='space-y-6'>
            <Link to={logo.url} className='flex items-center gap-2 group w-fit'>
              <div className='relative flex h-10 w-10 items-center justify-center transition-colors'>
                <GenieLogo size={32} />
              </div>
              <div>
                <h2 className='text-xl font-bold text-foreground tracking-tight'>
                  {logo.title}
                </h2>
                <p className='text-muted-foreground max-w-sm leading-relaxed'>
                  {tagline}.
                </p>
              </div>
            </Link>

            <div className='flex gap-4'>
              {[
                { Icon: Twitter, label: "Twitter" },
                { Icon: Github, label: "GitHub" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }, i) => (
                <Link
                  key={i}
                  to='/'
                  aria-label={label}
                  className='p-2 rounded-lg bg-muted hover:bg-muted/80 hover:text-foreground transition-colors border border-transparent hover:border-border'
                >
                  <Icon className='w-5 h-5' />
                </Link>
              ))}
            </div>
          </div>

          <div className='lg:pl-12'>
            <div className='p-1 rounded-2xl bg-linear-to-br from-muted to-muted/50 border'>
              <div className='bg-background rounded-xl p-6 space-y-4'>
                <div className='flex items-center gap-2 text-foreground font-medium'>
                  <Zap className='w-4 h-4 text-yellow-500' />
                  <span>Join the Network</span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Get the latest updates and changelogs delivered to your
                  terminal.
                </p>

                <form
                  onSubmit={handleSubscribe}
                  className='relative flex items-center'
                >
                  <div className='absolute left-3 text-muted-foreground'>
                    <span className='font-mono text-xs text-primary'>
                      {">"}
                    </span>
                  </div>
                  <Input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='enter_email_address...'
                    className='pl-8 pr-12 bg-muted/50 border-input focus:border-primary/50 font-mono text-sm h-12 rounded-lg text-foreground placeholder:text-muted-foreground/50'
                    aria-label='Email address'
                  />
                  <Button
                    size='icon'
                    type='submit'
                    disabled={subscribed}
                    className={cn(
                      "absolute right-1 h-10 w-10 rounded-md transition-all",
                      subscribed
                        ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                        : ""
                    )}
                    aria-label={subscribed ? "Subscribed" : "Subscribe"}
                  >
                    {subscribed ? (
                      <Check className='w-4 h-4' />
                    ) : (
                      <ArrowRight className='w-4 h-4' />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <Separator className='mb-16' />

        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-16'>
          {menuItems.map(section => (
            <div key={section.title} className='space-y-6'>
              <h3 className='text-sm font-mono text-foreground uppercase tracking-widest'>
                {section.title}
              </h3>
              <ul className='space-y-3'>
                {section.links.map(link => (
                  <li key={link.text}>
                    <Link
                      to={link.url}
                      className='group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
                    >
                      <span className='h-px w-0 bg-primary group-hover:w-3 transition-all duration-300' />
                      {link.text}
                      {link.badge && (
                        <span className='text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded ml-1'>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className='hidden lg:block space-y-6'>
            <h3 className='text-sm font-mono text-foreground uppercase tracking-widest'>
              System Status
            </h3>
            <div className='space-y-4'>
              <div className='p-4 rounded-xl border bg-muted/50 space-y-3'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Operational</span>
                  <span className='flex items-center gap-1.5 text-emerald-400'>
                    <span className='relative flex h-2 w-2'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                      <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
                    </span>
                    Online
                  </span>
                </div>
                <Separator />
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground flex items-center gap-1'>
                    <Globe className='w-3 h-3' /> Region
                  </span>
                  <span className='font-mono text-foreground'>US-EAST-1</span>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground flex items-center gap-1'>
                    <Wifi className='w-3 h-3' /> Latency
                  </span>
                  <span className='font-mono text-emerald-400'>24ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <span>{copyright}</span>
            <span className='hidden md:inline mx-2'>•</span>
            <span className='font-mono'>ID: 8942-XJ</span>
          </div>

          <div className='flex gap-6'>
            <Link
              to='/privacy'
              className='hover:text-foreground transition-colors'
            >
              Privacy Protocol
            </Link>
            <Link
              to='/terms'
              className='hover:text-foreground transition-colors'
            >
              Terms of Service
            </Link>
            <Link
              to='/cookies'
              className='hover:text-foreground transition-colors'
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
