import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export default function PhoneMockup({ src, alt, className = "" }: Props) {
  return (
    <div
      className={`relative mx-auto w-[260px] rounded-[2.6rem] border-[10px] border-ink bg-ink p-0 shadow-2xl shadow-brand-900/30 ${className}`}
    >
      <div className="absolute left-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
      <div className="overflow-hidden rounded-[2rem] bg-white">
        <Image
          src={src}
          alt={alt}
          width={520}
          height={1040}
          className="h-auto w-full"
          priority
        />
      </div>
    </div>
  );
}
