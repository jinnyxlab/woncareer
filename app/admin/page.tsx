'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  verify_status: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userData?.role !== 'admin') {
        router.push('/');
        return;
      }

      loadPendingUsers();
    };
    checkAdmin();
  }, []);

  const loadPendingUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, role, verify_status, created_at')
      .eq('verify_status', 'pending')
      .order('created_at', { ascending: true });

    setUsers(data || []);
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ verify_status: 'approved', verified: true })
      .eq('id', userId);

    if (error) {
      setMessage('승인에 실패했습니다.');
    } else {
      setMessage('승인 완료!');
      setUsers(users.filter(u => u.id !== userId));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleReject = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ verify_status: 'rejected', verified: false })
      .eq('id', userId);

    if (error) {
      setMessage('반려에 실패했습니다.');
    } else {
      setMessage('반려 완료!');
      setUsers(users.filter(u => u.id !== userId));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const viewDocs = async (userId: string) => {
    const docTypes = ['license', 'career', 'employment', 'training'];
    for (const doc of docTypes) {
      const { data } = await supabase.storage
        .from('verification-docs')
        .createSignedUrl(`${userId}/${doc}`, 60);
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-400">로딩 중...</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-10">
        <h1 className="text-lg font-bold text-gray-800 mb-6">관리자 — 인증 승인</h1>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {users.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">대기 중인 인증 신청이 없어요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map(user => (
              <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name || '이름 없음'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {user.role === 'teacher' ? '보육교사' : '원장'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewDocs(user.id)}
                      className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      서류 보기
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="text-xs text-red-400 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      반려
                    </button>
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="text-xs text-white bg-green-500 px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      승인
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}