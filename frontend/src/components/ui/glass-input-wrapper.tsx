export const GlassInputWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className='rounded-2xl border border-input bg-background/50 backdrop-blur-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-ring'>
    {children}
  </div>
);
