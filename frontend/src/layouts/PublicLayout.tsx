import { Outlet } from "react-router-dom";
import Footer from "@/layouts/Footer";
import Navbar from "@/layouts/Navbar";

export default function PublicLayout() {
  return (
    <div className='flex flex-col min-h-screen w-full bg-linear-to-b from-background via-background/95 to-muted/30'>
      <Navbar />
      <main className='flex flex-1 flex-col items-center justify-center animate-(--animate-fade-slide-in) px-4 py-28 md:py-36 lg:py-36'>
        <div className='w-full'>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
