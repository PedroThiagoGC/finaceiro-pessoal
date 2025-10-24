"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
        active ? "text-blue-700 bg-blue-50" : "text-gray-700"
      }`}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const showModuleNav = !pathname?.startsWith("/login") && !pathname?.startsWith("/register");

  const onLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-bold text-lg">PWR Finanças</Link>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/transactions" label="Transações" />
            <NavLink href="/accounts" label="Contas" />
            <NavLink href="/cards" label="Cartões" />
            <NavLink href="/categories" label="Categorias" />
            <NavLink href="/budgets" label="Orçamentos" />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user && <span className="hidden md:inline text-sm text-gray-600">Olá, {user.name}</span>}
          <button onClick={onLogout} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">Sair</button>
        </div>
      </div>
      {showModuleNav && <ModuleSubNav />}
    </header>
  );
}

function SubLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded text-sm hover:bg-gray-100 ${active ? "text-blue-700 bg-blue-50" : "text-gray-600"}`}
    >
      {label}
    </Link>
  );
}

function ModuleSubNav() {
  const pathname = usePathname() || "";

  let subnav: React.ReactNode = null;

  if (pathname.startsWith("/transactions")) {
    subnav = (
      <div className="flex items-center gap-2">
        <SubLink href="/transactions" label="Listar" />
        <SubLink href="/transactions/new" label="Nova" />
        <SubLink href="/transactions/upload" label="Upload OCR" />
      </div>
    );
  } else if (pathname.startsWith("/accounts") || pathname.startsWith("/cards") || pathname.startsWith("/categories")) {
    subnav = (
      <div className="flex items-center gap-2">
        <SubLink href="/accounts" label="Contas" />
        <SubLink href="/cards" label="Cartões" />
        <SubLink href="/categories" label="Categorias" />
      </div>
    );
  } else if (pathname.startsWith("/budgets")) {
    subnav = (
      <div className="flex items-center gap-2">
        <SubLink href="/budgets" label="Orçamentos" />
        <SubLink href="/budgets/new" label="Novo" />
      </div>
    );
  }

  if (!subnav) return null;

  return (
    <div className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
        {subnav}
        <div className="text-xs text-gray-400 hidden md:block">PWA pronto para instalar no seu dispositivo</div>
      </div>
    </div>
  );
}
