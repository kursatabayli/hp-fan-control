interface Props {
  themeColor: string;
}

export const BackgroundEffects = ({ themeColor }: Props) => {
  return (
    <>
      <div
        className="fixed top-[-20%] left-[-10%] w-150 h-150 rounded-full blur-[150px] opacity-20 transition-colors duration-1000 ease-in-out pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />
      <div
        className="fixed bottom-[-20%] right-[-10%] w-125 h-125 rounded-full blur-[120px] opacity-15 transition-colors duration-1000 ease-in-out pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />
    </>
  );
};