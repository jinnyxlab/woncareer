'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-0 z-20 shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">원</span>
        </div>
        <span className="text-green-700 font-bold text-lg tracking-tight">원커리어</span>
      </Link>

      <nav className="flex items-center gap-6 text-sm text-gray-600">
        <Link href="/institutions" className="hover:text-green-600 transition-colors">기관 찾기</Link>
        <Link href="/jobs" className="hover:text-green-600 transition-colors">채용공고</Link>
        <Link href="/reviews" className="hover:text-green-600 transition-colors">리뷰</Link>
      </nav>

      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              className="text-sm text-gray-600 hover:text-red-400 transition-colors"
            >
              로그아웃
            </button>
            <Link href="/mypage" className="text-sm bg-green-500 text-white px-4 py-1.5 rounded-full hover:bg-green-600 transition-colors">
              마이페이지
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-green-600 transition-colors">로그인</Link>
            <Link href="/auth/signup" className="text-sm bg-green-500 text-white px-4 py-1.5 rounded-full hover:bg-green-600 transition-colors">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
}