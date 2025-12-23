import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
import { throttle } from "@/utils/ext";

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
  { title: "About Us", url: "/about" },
  { title: "Contact Us", url: "/contact" },
  { title: "FAQ", url: "/faq" },
];

const isPathActive = (itemUrl: string, currentPath: string): boolean => {
  if (itemUrl === "/" && currentPath === "/") return true;
  if (itemUrl !== "/" && currentPath.startsWith(itemUrl)) return true;
  return false;
};

interface DesktopMenuItemProps {
  item: MenuItem;
  isActive: boolean;
}

const DesktopMenuItem = React.memo(
  ({ item, isActive }: DesktopMenuItemProps) => {
    if (item.items) {
      return (
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "h-10 px-4 rounded-full transition-colors",
              isActive
                ? "text-foreground bg-accent"
                : "text-muted-foreground bg-transparent hover:text-foreground hover:bg-accent/70"
            )}
          >
            {item.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className='bg-popover backdrop-blur-xl rounded-xl border shadow-lg p-2 w-[320px]'>
            <ul className='grid gap-1'>
              {item.items.map(subItem => (
                <li key={subItem.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={subItem.url}
                      className='flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent focus:bg-accent focus:outline-none'
                    >
                      {subItem.icon && (
                        <div className='shrink-0 mt-0.5'>{subItem.icon}</div>
                      )}
                      <div className='flex flex-col gap-1'>
                        <div className='text-sm font-medium text-foreground'>
                          {subItem.title}
                        </div>
                        {subItem.description && (
                          <p className='text-xs text-muted-foreground leading-relaxed'>
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
        </NavigationMenuItem>
      );
    }

    return (
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link
            to={item.url}
            className={cn(
              "inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
              isActive
                ? "text-foreground bg-accent"
                : "text-muted-foreground bg-transparent hover:text-foreground hover:bg-accent/70"
            )}
          >
            {item.title}
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }
);

DesktopMenuItem.displayName = "DesktopMenuItem";

interface MobileMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  onNavigate: () => void;
}

const MobileMenuItem = React.memo(
  ({ item, isActive, onNavigate }: MobileMenuItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

    if (item.items) {
      return (
        <div className='border-b border-border'>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls={`mobile-submenu-${item.title}`}
            className={cn(
              "w-full flex items-center justify-between py-4 text-left text-base font-medium transition-colors",
              isActive
                ? "text-primary font-semibold"
                : "text-foreground hover:text-primary"
            )}
          >
            {item.title}
            <svg
              className={cn(
                "size-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
          {isOpen && (
            <div
              id={`mobile-submenu-${item.title}`}
              className='flex flex-col gap-1 pb-4 pl-2'
            >
              {item.items.map(subItem => (
                <SheetClose asChild key={subItem.title}>
                  <Link
                    to={subItem.url}
                    onClick={onNavigate}
                    className='flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors focus:outline-2 focus:outline-ring min-h-[44px]'
                  >
                    <div className='text-muted-foreground shrink-0 mt-0.5'>
                      {subItem.icon}
                    </div>
                    <div className='flex flex-col gap-1'>
                      <div className='text-foreground font-medium text-sm'>
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <div className='text-xs text-muted-foreground leading-snug'>
                          {subItem.description}
                        </div>
                      )}
                    </div>
                  </Link>
                </SheetClose>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <SheetClose asChild>
        <Link
          to={item.url}
          onClick={onNavigate}
          className={cn(
            "flex items-center py-4 text-base font-medium border-b border-border transition-colors min-h-[44px]",
            isActive
              ? "text-primary font-semibold"
              : "text-foreground hover:text-primary"
          )}
        >
          {item.title}
        </Link>
      </SheetClose>
    );
  }
);

MobileMenuItem.displayName = "MobileMenuItem";

const Navbar = ({
  logo = { url: "/", title: "Genie" },
  menu = defaultMenu,
  auth = {
    googlelogin: { title: "Login", url: "/login" },
  },
}: NavbarProps) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = useMemo(
    () =>
      throttle(() => {
        setScrolled(window.scrollY > 50);
      }, 100),
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleMobileMenuClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const desktopMenuItems = useMemo(
    () =>
      menu.map(item => (
        <DesktopMenuItem
          key={item.title}
          item={item}
          isActive={isPathActive(item.url, location.pathname)}
        />
      )),
    [menu, location.pathname]
  );

  const mobileMenuItems = useMemo(
    () =>
      menu.map(item => (
        <MobileMenuItem
          key={item.title}
          item={item}
          isActive={isPathActive(item.url, location.pathname)}
          onNavigate={handleMobileMenuClose}
        />
      )),
    [menu, location.pathname, handleMobileMenuClose]
  );

  return (
    <>
      <Link
        to='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-60 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md'
      >
        Skip to content
      </Link>

      <div className='fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4'>
        <nav
          aria-label='Main navigation'
          className={cn(
            "w-full rounded-2xl border transition-all duration-500 ease-in-out",
            scrolled
              ? "max-w-7xl bg-background/80 backdrop-blur-xl shadow-xl border-border/50 py-3 px-6"
              : "max-w-full bg-transparent border-transparent py-3 px-4"
          )}
        >
          <div className='flex items-center justify-between gap-4'>
            <Link
              to={logo.url}
              className='flex items-center gap-2 group focus:outline-2 focus:outline-ring rounded-md'
              aria-label={`${logo.title} home`}
            >
              <div className='relative flex h-9 w-9 items-center justify-center transition-transform group-hover:scale-110'>
                <GenieLogo size={32} />
              </div>
              <span className='text-lg font-bold tracking-tight text-foreground'>
                {logo.title}
              </span>
            </Link>

            <div className='hidden lg:flex items-center gap-2'>
              <NavigationMenu>
                <NavigationMenuList>{desktopMenuItems}</NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className='hidden lg:flex items-center gap-4'>
              <div className='h-6 w-px bg-border' aria-hidden='true' />
              <ThemeToggle />
              <Button
                asChild
                size='sm'
                className='rounded-lg font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:scale-105 focus:shadow-xl min-h-[44px] px-6'
              >
                <Link
                  to={auth.googlelogin.url}
                  className='flex items-center gap-2'
                >
                  {auth.googlelogin.title}
                </Link>
              </Button>
            </div>

            <div className='flex items-center gap-3 lg:hidden'>
              <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    className='rounded-lg min-h-[44px] min-w-[44px]'
                    aria-label='Open navigation menu'
                    aria-expanded={isOpen}
                    aria-controls='mobile-navigation'
                  >
                    {isOpen ? (
                      <X className='size-5' aria-hidden='true' />
                    ) : (
                      <Menu className='size-5' aria-hidden='true' />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  id='mobile-navigation'
                  side='right'
                  className='w-[85vw] max-w-[400px] p-0 flex flex-col'
                  aria-label='Mobile navigation menu'
                >
                  <SheetHeader className='p-6 border-b border-border'>
                    <SheetTitle className='flex items-center gap-2 text-left'>
                      <GenieLogo size={28} />
                      <span className='text-xl font-bold text-foreground'>
                        {logo.title}
                      </span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className='flex-1 overflow-y-auto p-6'>
                    <nav aria-label='Mobile menu'>{mobileMenuItems}</nav>
                  </div>

                  <div className='p-6 border-t border-border bg-muted/30'>
                    <SheetClose asChild>
                      <Button
                        asChild
                        className='w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all'
                      >
                        <Link to={auth.googlelogin.url}>
                          {auth.googlelogin.title}
                        </Link>
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
