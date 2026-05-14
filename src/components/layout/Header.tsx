import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-black flex items-center px-6 gap-3">
      <Link href="/" className="flex items-center h-[21px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="퍼플식스 스튜디오 로고"
          className="h-full w-auto object-contain"
        />
      </Link>
      <div className="w-px h-[1em] bg-white/50" />
      <span className="text-white text-base font-bold">
        퍼플식스스튜디오 마감재&amp;업체DB
      </span>
    </header>
  );
}
