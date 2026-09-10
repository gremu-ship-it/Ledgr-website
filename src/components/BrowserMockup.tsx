import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  url?: string;
  className?: string;
};

export default function BrowserMockup({
  src,
  alt,
  url = "ledgr-react.vercel.app/dashboard",
  className = "",
}: Props) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-brand-900/20 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#f87171]" />
        <span className="h-3 w-3 rounded-full bg-[#fbbf24]" />
        <span className="h-3 w-3 rounded-full bg-[#34d399]" />
        <div className="ml-2 flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
          <span aria-hidden>🔒</span>
          <span className="truncate">{url}</span>
        </div>
      </div>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={760}
        sizes="(max-width: 1024px) 100vw, 620px"
        className="h-auto w-full"
        priority
      />
    </div>
  );
}
