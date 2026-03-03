type HeadingProps = {
  children: React.ReactNode;
};

export default function Heading({ children }: HeadingProps) {
  return <h2 className="text-lg font-semibold text-white mb-3">{children}</h2>;
}
