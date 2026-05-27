'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError('');

    const { data, error: signupError } = await supabase.auth.signUp({ email, password });

    if (signupError) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({ id: data.user.id, email, name, role });

      if (insertError) {
        setError('사용자 정보 저장에 실패했습니다.');
        setLoading(false);
        return;
      }
    }

    router.push('/auth/verify');
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
          <h1 className="text-xl font-bold text-gray-800">회원가입</h1>
        </div>

        {/* Step 1 - 역할 선택 */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600 text-center mb-2">어떤 역할로 가입하시나요?</p>
            {[
              { value: 'teacher', label: '보육교사', desc: '리뷰 작성 및 채용 지원' },
              { value: 'director', label: '원장', desc: '채용공고 등록' },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => { setRole(item.value); setStep(2); }}
                className="w-full border border-gray-200 rounded-lg p-4 text-left hover:border-green-400 transition-colors"
              >
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 - 정보 입력 */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
            />
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
            />
            <input
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
            />

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? '가입 중...' : '가입하기'}
            </button>

            <button
              onClick={() => setStep(1)}
              className="text-xs text-gray-400 hover:text-gray-600 text-center"
            >
              ← 이전으로
            </button>
          </div>
        )}

        {/* 하단 링크 */}
        <div className="text-center mt-6 text-xs text-gray-400">
          이미 회원이신가요?{' '}
          <Link href="/auth/login" className="text-green-600 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}