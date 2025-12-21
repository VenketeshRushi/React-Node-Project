import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, HelpCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsAuthenticated } from "@/stores/auth.store";

export default function NotFound() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  const primaryAction = isAuthenticated
    ? { label: "Go to Dashboard", path: "/dashboard", icon: Home }
    : { label: "Go to Home", path: "/", icon: Home };

  return (
    <div className='container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center lg:min-h-[80vh]'>
      <div className='relative z-10 max-w-2xl space-y-8'>
        <div>
          <h1 className='text-9xl font-bold text-primary select-none'>404</h1>
        </div>

        <div className='space-y-4'>
          <h2 className='relative bg-background text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl'>
            Page Not Found
          </h2>

          <p className='text-lg text-muted-foreground sm:text-xl'>
            Sorry, we couldn&apos;t find the page you&apos;re looking for. The
            page might have been removed, renamed, or the URL might be
            incorrect.
          </p>
        </div>

        <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
          <Button asChild size='lg' className='group min-w-[200px] gap-2'>
            <Link to={primaryAction.path}>
              <primaryAction.icon className='h-5 w-5 transition-transform group-hover:scale-110' />
              {primaryAction.label}
            </Link>
          </Button>

          <Button
            variant='outline'
            size='lg'
            className='group min-w-[200px] gap-2'
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className='h-5 w-5 transition-transform group-hover:-translate-x-1' />
            Go Back
          </Button>
        </div>

        <div className='pt-8 border-t'>
          <p className='text-sm text-muted-foreground mb-4'>
            Or try one of these pages:
          </p>
          <div className='flex flex-wrap items-center justify-center gap-4'>
            {isAuthenticated ? (
              <>
                <Button variant='ghost' size='lg' asChild>
                  <Link to='/dashboard'>Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant='ghost' size='lg' asChild>
                  <Link to='/'>Home</Link>
                </Button>
                <Button variant='ghost' size='lg' asChild>
                  <Link to='/about'>About</Link>
                </Button>
                <Button variant='ghost' size='lg' asChild>
                  <Link to='/faq'>FAQ</Link>
                </Button>
              </>
            )}
            <Button variant='ghost' size='lg' asChild>
              <Link to='/contact' className='gap-2'>
                <Mail className='h-4 w-4' />
                Contact
              </Link>
            </Button>
          </div>
        </div>

        <div className='pt-2'>
          <Button variant='link' size='sm' asChild className='gap-2'>
            <Link to='/faq'>
              <HelpCircle className='h-4 w-4' />
              Need help? Visit our FAQ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
