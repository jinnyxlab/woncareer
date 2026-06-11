'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('이메일 인증이 필요해요. 가입 시 받은 이메일을 확인해주세요.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } else {
      router.push('/');
    }
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold">원</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">로그인</h1>
        </div>

        {/* 입력 */}
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>

        {/* 하단 링크 */}
        <div className="text-center mt-6 text-xs text-gray-400">
          아직 회원이 아니신가요?{' '}
          <Link href="/auth/signup" className="text-green-600 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}