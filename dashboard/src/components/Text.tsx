type TextProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Text({ children, className = "" }: TextProps) {
  return (
    <p
      className={`block text-sm leading-relaxed text-gray-300 mb-4 ${className}`}
    >
      {children}
    </p>
  );
}
