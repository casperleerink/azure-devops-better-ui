export const Kbd = ({ children }: { children: React.ReactNode }) => {
  return (
    <kbd className="bg-alpha/4 border-alpha/5 flex size-4 items-center justify-center rounded border text-xs font-normal">
      {children}
    </kbd>
  );
};
