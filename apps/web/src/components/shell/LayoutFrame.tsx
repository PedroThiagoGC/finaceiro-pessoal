"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";

export default function LayoutFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname?.startsWith("/login") || pathname?.startsWith("/register");

  if (hideHeader) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <MobileTabBar />
    </div>
  );
}

function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm z-40">
      <ul className="grid grid-cols-4 text-sm">
        <li>
          <a href="/dashboard" className="flex flex-col items-center py-2 hover:bg-gray-50">
            <span className="text-xl">🏠</span>
            <span>Início</span>
          </a>
        </li>
        <li>
          <a href="/transactions" className="flex flex-col items-center py-2 hover:bg-gray-50">
            <span className="text-xl">💸</span>
            <span>Transações</span>
          </a>
        </li>
        <li>
          <a href="/transactions/upload" className="flex flex-col items-center py-2 hover:bg-gray-50">
            <span className="text-xl">📷</span>
            <span>OCR</span>
          </a>
        </li>
        <li>
          <a href="/budgets" className="flex flex-col items-center py-2 hover:bg-gray-50">
            <span className="text-xl">📊</span>
            <span>Orçamentos</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
