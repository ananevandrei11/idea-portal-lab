import { logout } from "@/actions/auth";
import Link from "next/link";

interface HeaderProps {
  email?: string;
}

export function Header({ email }: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-7 rounded-md bg-white grid place-items-center">
            <span className="text-zinc-950 text-xs font-medium">▲</span>
          </div>
          <span className="text-white text-sm font-medium tracking-tight">IPL</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/account" className="size-7 rounded-full bg-zinc-700 flex items-center justify-center">
            <span className="text-zinc-300 text-xs">{email?.slice(0, 2)}</span>
          </Link>
          <form action={logout}>
            <button
              // onClick={onLogout}
              className="btn-primary flex gap-1 items-center group"
            >
              <svg className="size-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              logout
            </button>
          </form>
        </div>

      </div>
    </header>
  );
}