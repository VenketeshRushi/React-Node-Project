import { FAQ } from "@/components/blocks/faq";
import { Testimonials } from "@/components/blocks/testimonials";
import { DashedLine } from "@/components/ui/dashed-line";

const FaqPage = () => {
  return (
    <>
      <FAQ
        className='text-center pt-0!'
        className2='max-w-xl lg:grid-cols-1'
        headerTag='h1'
      />
      <DashedLine className='mx-auto max-w-xl' />
      <Testimonials dashedLineClassName='hidden' />
    </>
  );
};

export default FaqPage;
