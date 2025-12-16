import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generatePKCEPair } from "@/utils/ext";
import { Link } from "react-router-dom";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox='0 0 24 24' aria-hidden='true'>
    <path
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
      fill='#4285F4'
    />
    <path
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      fill='#34A853'
    />
    <path
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      fill='#FBBC05'
    />
    <path
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      fill='#EA4335'
    />
  </svg>
);

interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface LoginPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onGoogleLogin?: () => void;
  isGoogleLoading?: boolean;
  googleButtonDisabled?: boolean;
}

const TestimonialCard = ({
  testimonial,
  delay,
}: {
  testimonial: Testimonial;
  delay: string;
}) => (
  <div
    className={`animate-(--animate-testimonial-in) ${delay} flex items-start gap-3 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/50 p-5 shadow-lg`}
  >
    <img
      src={testimonial.avatarSrc}
      className='h-10 w-10 object-cover rounded-2xl'
      alt='avatar'
    />
    <div className='text-sm leading-snug'>
      <p className='flex items-center gap-1 font-medium'>{testimonial.name}</p>
      <p className='text-muted-foreground'>{testimonial.handle}</p>
      <p className='mt-1 text-foreground/80'>{testimonial.text}</p>
    </div>
  </div>
);

const LoginPage: React.FC<LoginPageProps> = ({
  title = (
    <span className='font-light text-foreground tracking-tighter'>Welcome</span>
  ),
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onGoogleLogin,
  isGoogleLoading = false,
  googleButtonDisabled = false,
}) => {
  return (
    <div className='w-full max-w-5xl mx-auto'>
      <div className='grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl border bg-background shadow-2xl'>
        {heroImageSrc && (
          <section className='relative hidden md:flex flex-col justify-end p-8 lg:p-12 order-1 md:order-2 min-h-[500px] md:min-h-[600px]'>
            <div className='absolute inset-0 bg-zinc-900'>
              <div
                className='animate-(--animate-slide-right-in) animate-delay-300 absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105'
                style={{ backgroundImage: `url(${heroImageSrc})` }}
              />
            </div>

            {testimonials.length > 0 && (
              <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center'>
                {testimonials[0] && (
                  <div className='hidden md:flex'>
                    <TestimonialCard
                      testimonial={testimonials[0]}
                      delay='animate-delay-1000'
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <section className='flex flex-col justify-center p-8 md:p-12 lg:p-16 order-2 md:order-1 relative z-10 bg-background'>
          <div className='max-w-[360px] mx-auto w-full flex flex-col gap-8'>
            <div className='flex flex-col gap-2'>
              <h1 className='text-3xl font-bold tracking-tight text-foreground'>
                {title}
              </h1>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </div>

            <button
              onClick={onGoogleLogin}
              disabled={isGoogleLoading || googleButtonDisabled}
              className={cn(
                "relative group/btn flex items-center justify-center gap-3 w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium rounded-lg transition-all duration-200",
                "hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              )}
            >
              {isGoogleLoading ? (
                <Loader2 className='w-5 h-5 animate-spin text-zinc-500' />
              ) : (
                <>
                  <GoogleIcon className='w-5 h-5 transition-transform group-hover/btn:scale-110' />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  Secure Authentication
                </span>
              </div>
            </div>

            <p className='px-8 text-center text-xs text-muted-foreground'>
              By clicking continue, you agree to our{" "}
              <Link
                to='/'
                className='underline underline-offset-4 hover:text-primary'
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to='/'
                className='underline underline-offset-4 hover:text-primary'
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed.",
  },
];

const Login = () => {
  const { errorToast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);

      const { codeVerifier, codeChallenge } = await generatePKCEPair(128);
      const state = crypto.randomUUID();

      sessionStorage.setItem("pkce_verifier", codeVerifier);
      sessionStorage.setItem("pkce_state", state);

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.append(
        "client_id",
        import.meta.env.VITE_GOOGLE_CLIENT_ID
      );
      authUrl.searchParams.append(
        "redirect_uri",
        import.meta.env.VITE_GOOGLE_REDIRECT_URI
      );
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", "openid email profile");
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("access_type", "offline");
      authUrl.searchParams.append("prompt", "consent");
      authUrl.searchParams.append("code_challenge", codeChallenge);
      authUrl.searchParams.append("code_challenge_method", "S256");

      window.location.href = authUrl.toString();
    } catch {
      errorToast("Failed to initiate Google Sign In. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className='min-h-3/4! bg-transparent text-foreground'>
      <LoginPage
        heroImageSrc='https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80'
        testimonials={sampleTestimonials}
        onGoogleLogin={handleGoogleLogin}
        isGoogleLoading={isGoogleLoading}
        googleButtonDisabled={isGoogleLoading}
      />
    </div>
  );
};

export default Login;
