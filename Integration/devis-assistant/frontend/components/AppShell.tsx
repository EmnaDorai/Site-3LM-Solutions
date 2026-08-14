'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import ChatWidget from './ChatWidget';
import GlobalSearch from './GlobalSearch';
import PageTransition from './PageTransition';
import { getToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/', '/rendez-vous', '/reservation', '/login'];

function isPublicPath(pathname: string) {
  if (pathname === '/') return true;
  return PUBLIC_PATHS.some((p) => p !== '/' && (pathname === p || pathname.startsWith(`${p}/`)));
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const publicPath = isPublicPath(pathname);
  const [checked, setChecked] = useState(publicPath);

  useEffect(() => {
    if (publicPath) {
      setChecked(true);
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setChecked(true);
  }, [pathname, publicPath, router]);

  if (publicPath) {
    return (
      <div className="min-h-screen">
        {children}
        <ChatWidget />
      </div>
    );
  }

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--ink-soft)]">
        Vérification de la session...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[var(--paper)] min-h-screen flex flex-col min-w-0">
        <PageTransition>{children}</PageTransition>
      </main>
      <GlobalSearch />
    </div>
  );
}
