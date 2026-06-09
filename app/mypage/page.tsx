'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  birth_date: string;
  gender: string;
  address: string;
  bio: string;
  license_number: string;
  license_grade: string;
  education: string;
  experience_years: number;
  preferred_region: string;
  preferred_salary: number;
  preferred_employment: string;
  institution_name: string;
  business_number: string;
  institution_address: string;
  institution_tel: string;
  verified: boolean;
  verify_status: string;
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setUser(data);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const inputs = document.querySelectorAll('input[name], select[name]');
    const updated: Record<string, string | null> = {};
    inputs.forEach((el) => {
      const input = el as HTMLInputElement;
      updated[input.name] = input.value === '' ? null : input.value;
    });

    const { error } = await supabase
      .from('users')
      .update(updated)
      .eq('id', user.id);

    if (error) {
      console.log('저장 에러:', JSON.stringify(error));
      setMessage('저장에 실패했습니다.');
    } else {
      setUser({ ...user, ...updated } as User);
      setEditing(false);
      setMessage('저장됐습니다!');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const Field = ({ label, field, type = 'text', options, required }: {
    label: string;
    field: keyof User;
    type?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
  }) => (
    <div className="flex gap-2 items-start">
      <span className="text-gray-400 text-sm w-24 shrink-0 pt-2">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {editing ? (
        options ? (
          <select
            name={field}
            defaultValue={user?.[field] as string || ''}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
          >
            <option value="">선택</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input
            type={type}
            name={field}
            defaultValue={user?.[field] as string || ''}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
          />
        )
      ) : (
        <span className="text-sm text-gray-700 pt-2">{user?.[field] as string || '미입력'}</span>
      )}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-400">로딩 중...</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-6 pt-20 pb-10">

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {/* 프로필 헤더 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-xl font-bold">{user?.name?.[0] || '?'}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">{user?.name || '이름 없음'}</h1>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  {user?.role === 'teacher' ? '보육교사' : user?.role === 'director' ? '원장' : '일반'}
                </span>
              </div>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                수정
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Field label="이름" field="name" required />
            <Field label="전화번호" field="phone" type="tel" required />
            <Field label="생년월일" field="birth_date" type="date" />
            <Field label="성별" field="gender" options={[
              { value: 'male', label: '남성' },
              { value: 'female', label: '여성' },
            ]} />
            <Field label="주소" field="address" />
            <Field label="자기소개" field="bio" />
          </div>
        </div>

        {/* 보육교사 인증 */}
        {user?.role === 'teacher' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h2 className="text-sm font-bold text-gray-700 mb-3">보육교사 인증</h2>
            {user.verify_status === 'none' || !user.verify_status ? (
              <>
                <p className="text-xs text-gray-400 mb-4">자격증과 경력증명서를 제출하면 리뷰 작성이 가능해요.</p>
                <Link href="/auth/verify-docs" className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors inline-block">
                  인증 서류 제출
                </Link>
              </>
            ) : user.verify_status === 'pending' ? (
              <p className="text-xs text-yellow-500">⏳ 서류 검토 중이에요. 1~2일 내에 처리됩니다.</p>
            ) : user.verify_status === 'approved' ? (
              <p className="text-xs text-green-600">✅ 인증 완료! 리뷰 작성이 가능해요.</p>
            ) : user.verify_status === 'rejected' ? (
              <>
                <p className="text-xs text-red-400 mb-4">❌ 서류가 반려됐어요. 다시 제출해주세요.</p>
                <Link href="/auth/verify-docs" className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors inline-block">
                  서류 다시 제출
                </Link>
              </>
            ) : null}
          </div>
        )}

        {/* 보육교사 정보 */}
        {user?.role === 'teacher' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h2 className="text-sm font-bold text-gray-700 mb-4">보육교사 정보</h2>
            <div className="flex flex-col gap-4">
              <Field label="자격증 번호" field="license_number" required />
              <Field label="자격증 등급" field="license_grade" options={[
                { value: '1', label: '1급' },
                { value: '2', label: '2급' },
              ]} />
              <Field label="최종학력" field="education" options={[
                { value: 'high', label: '고등학교 졸업' },
                { value: 'college', label: '전문대 졸업' },
                { value: 'university', label: '대학교 졸업' },
                { value: 'graduate', label: '대학원 졸업' },
              ]} />
              <Field label="경력 연수" field="experience_years" type="number" />
              <Field label="희망 근무지역" field="preferred_region" />
              <Field label="희망 급여" field="preferred_salary" type="number" />
              <Field label="희망 고용형태" field="preferred_employment" options={[
                { value: 'full', label: '정규직' },
                { value: 'contract', label: '계약직' },
                { value: 'part', label: '파트타임' },
              ]} />
            </div>
          </div>
        )}

        {/* 원장 정보 */}
        {user?.role === 'director' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h2 className="text-sm font-bold text-gray-700 mb-4">기관 정보</h2>
            <div className="flex flex-col gap-4">
              <Field label="기관명" field="institution_name" required />
              <Field label="사업자번호" field="business_number" required />
              <Field label="기관 주소" field="institution_address" />
              <Field label="기관 전화" field="institution_tel" />
            </div>
          </div>
        )}

        {/* 회원 탈퇴 */}
        {!editing && (
          <button
            type="button"
            onClick={async () => {
              if (!confirm('정말 탈퇴하시겠어요? 모든 데이터가 삭제됩니다.')) return;
              await supabase.from('users').delete().eq('id', user!.id);
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="w-full text-sm text-red-400 hover:text-red-500 py-3 transition-colors"
          >
            회원 탈퇴
          </button>
        )}
      </main>
    </div>
  );
}