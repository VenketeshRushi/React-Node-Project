import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BadgePercent,
  DollarSign,
  Menu,
  ShoppingCart,
  Cpu,
  LayoutGrid,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import GenieLogo from "./GenieLogo";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface NavbarProps {
  logo?: { url: string; title: string };
  menu?: MenuItem[];
  auth?: {
    googlelogin: { title: string; url: string };
  };
}

const defaultMenu: MenuItem[] = [
  {
    title: "Platform",
    url: "/",
    items: [
      {
        title: "Genie",
        description: "Advanced reasoning engine for complex tasks.",
        icon: <Cpu className='size-5 shrink-0 text-primary' />,
        url: "/",
      },
      {
        title: "Resource Grid",
        description: "Manage compute and allocation.",
        icon: <LayoutGrid className='size-5 shrink-0 text-blue-500' />,
        url: "/",
      },
    ],
  },
  {
    title: "Pricing",
    url: "/#pricing",
    items: [
      {
        title: "Protocol: Free",
        description: "For individuals starting out.",
        icon: <ShoppingCart className='size-5 shrink-0 text-emerald-500' />,
        url: "/#pricing",
      },
      {
        title: "Protocol: Startup",
        description: "For scaling teams.",
        icon: <DollarSign className='size-5 shrink-0 text-blue-500' />,
        url: "/#pricing",
      },
      {
        title: "Protocol: Enterprise",
        description: "Enterprise grade infrastructure.",
        icon: <BadgePercent className='size-5 shrink-0 text-primary' />,
        url: "/#pricing",
      },
    ],
  },
  { title: "About Us", url: "/about" },
  { title: "Contact Us", url: "/contact" },
  { title: "FAQ", url: "/faq" },
];

const Navbar = ({
  logo = { url: "/", title: "Genie" },
  menu = defaultMenu,
  auth = {
    googlelogin: { title: "Login", url: "/login" },
  },
}: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for glassmorphism intensity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4'>
      <nav
        className={cn(
          "w-full max-w-6xl rounded-2xl border transition-all duration-300 ease-in-out",
          scrolled
            ? "bg-background/80 backdrop-blur-xl shadow-2xl py-2 px-6"
            : "bg-transparent border-transparent py-4 px-4"
        )}
      >
        <div className='flex items-center justify-between'>
          {/* Logo Section */}
          <Link to={logo.url} className='flex items-center gap-2 group'>
            <div className='relative flex h-9 w-9 items-center justify-center transition-colors'>
              <GenieLogo size={32} />
            </div>
            <span className='text-lg font-bold tracking-tight text-foreground'>
              {logo.title}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className='hidden lg:flex items-center gap-2'>
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map(item => (
                  <NavigationMenuItem key={item.title}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger className='bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent data-[state=open]:bg-accent data-[state=open]:text-foreground h-9 px-4 rounded-full transition-colors'>
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className='bg-popover/95 backdrop-blur-xl rounded-xl p-2 w-lg!'>
                          <ul className='grid gap-1'>
                            {item.items.map(subItem => (
                              <li key={subItem.title}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to={subItem.url}
                                    className='hover:bg-muted hover:text-accent-foreground flex select-none flex-row gap-4 rounded-md p-2 leading-none no-underline outline-none transition-colors'
                                  >
                                    <div className='text-foreground'>
                                      {subItem.icon}
                                    </div>
                                    <div>
                                      <div className='text-sm font-semibold'>
                                        {subItem.title}
                                      </div>
                                      {subItem.description && (
                                        <p className='text-muted-foreground text-sm leading-snug'>
                                          {subItem.description}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.url}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent h-9 px-4 rounded-full transition-colors"
                          )}
                        >
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Actions */}
          <div className='hidden lg:flex items-center gap-4'>
            <div className='h-6 w-px bg-border' />
            <ThemeToggle />
            <Button
              asChild
              size='sm'
              className='rounded-md font-semibold shadow-lg transition-all hover:scale-104'
            >
              <Link
                to={auth.googlelogin.url}
                className='flex items-center gap-1 px-2'
              >
                {auth.googlelogin.title}
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className='flex items-center gap-4 lg:hidden'>
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='rounded-lg'
                  aria-label='Open menu'
                >
                  <Menu className='size-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='top' className='w-full h-full p-0'>
                <div className='flex flex-col h-full'>
                  <SheetHeader className='p-6 border-b'>
                    <SheetTitle className='flex items-center gap-2'>
                      <GenieLogo size={32} />
                      <span className='text-xl font-bold text-foreground'>
                        {logo.title}
                      </span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className='flex-1 overflow-y-auto p-6'>
                    <Accordion
                      type='single'
                      collapsible
                      className='flex w-full flex-col gap-2'
                    >
                      {menu.map(item =>
                        item.items ? (
                          <AccordionItem
                            key={item.title}
                            value={item.title}
                            className='border-b'
                          >
                            <AccordionTrigger className='text-lg font-medium text-foreground hover:no-underline hover:text-primary py-4'>
                              {item.title}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className='flex flex-col gap-2 pb-4 pl-4'>
                                {item.items.map(subItem => (
                                  <SheetClose asChild key={subItem.title}>
                                    <Link
                                      to={subItem.url}
                                      className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors'
                                    >
                                      <div className='text-muted-foreground'>
                                        {subItem.icon}
                                      </div>
                                      <div>
                                        <div className='text-foreground font-medium'>
                                          {subItem.title}
                                        </div>
                                        <div className='text-xs text-muted-foreground'>
                                          {subItem.description}
                                        </div>
                                      </div>
                                    </Link>
                                  </SheetClose>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ) : (
                          <SheetClose asChild key={item.title}>
                            <Link
                              to={item.url}
                              className='flex items-center py-4 text-lg font-medium text-foreground border-b hover:text-primary transition-colors'
                            >
                              {item.title}
                            </Link>
                          </SheetClose>
                        )
                      )}
                    </Accordion>
                  </div>

                  <div className='p-6 border-t bg-muted/50'>
                    <SheetClose asChild>
                      <Button
                        asChild
                        className='w-full h-12 rounded-xl text-lg font-medium shadow-lg'
                      >
                        <Link to={auth.googlelogin.url}>
                          {auth.googlelogin.title}
                        </Link>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
