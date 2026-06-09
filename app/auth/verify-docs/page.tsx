'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';

export default function VerifyDocsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<{
    license: File | null;
    career: File | null;
    employment: File | null;
    training: File | null;
  }>({
    license: null,
    career: null,
    employment: null,
    training: null,
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data?.verify_status === 'approved') {
        router.push('/mypage');
        return;
      }

      setUser(data);
      setLoading(false);
    };
    getUser();
  }, []);

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage
      .from('verification-docs')
      .upload(path, file, { upsert: true });
    return !error;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!files.license) {
      setMessage('자격증 사진은 필수예요.');
      return;
    }
    if (!files.career && !files.employment) {
      setMessage('경력증명서 또는 재직증명서 중 하나는 필수예요.');
      return;
    }

    setUploading(true);
    setMessage('');

    const uid = user.id;
    const uploads = [];

    if (files.license) uploads.push(uploadFile(files.license, `${uid}/license`));
    if (files.career) uploads.push(uploadFile(files.career, `${uid}/career`));
    if (files.employment) uploads.push(uploadFile(files.employment, `${uid}/employment`));
    if (files.training) uploads.push(uploadFile(files.training, `${uid}/training`));

    const results = await Promise.all(uploads);

    if (results.some(r => !r)) {
      setMessage('파일 업로드에 실패했습니다. 다시 시도해주세요.');
      setUploading(false);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ verify_status: 'pending' })
      .eq('id', uid);

    if (error) {
      setMessage('신청에 실패했습니다.');
    } else {
      setMessage('');
      router.push('/auth/verify-pending');
    }

    setUploading(false);
  };

  const FileInput = ({ label, field, required }: {
    label: string;
    field: keyof typeof files;
    required?: boolean;
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFiles({ ...files, [field]: e.target.files?.[0] || null })}
        className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-600 hover:file:bg-green-100"
      />
      {files[field] && (
        <p className="text-xs text-green-600">✓ {files[field]!.name}</p>
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
      <main className="max-w-lg mx-auto px-6 pt-20 pb-10">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-lg font-bold text-gray-800 mb-2">보육교사 인증 서류 제출</h1>
          <p className="text-sm text-gray-400 mb-6">
            서류 확인 후 1~2일 내에 승인됩니다.<br/>
            승인 완료 후 리뷰 작성이 가능해요.
          </p>

          {user?.verify_status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 text-sm px-4 py-3 rounded-lg mb-6">
              현재 승인 대기 중이에요. 1~2일 내에 처리됩니다.
            </div>
          )}

          {user?.verify_status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-lg mb-6">
              서류가 반려됐어요. 다시 제출해주세요.
            </div>
          )}

          <div className="flex flex-col gap-5">
            <FileInput
              label="보육교사 자격증 또는 유아정교사 자격증 (2급 이상)"
              field="license"
              required
            />
            <FileInput
              label="경력증명서 (전부 표기로 제출)"
              field="career"
            />
            <FileInput
              label="재직증명서 (현직자)"
              field="employment"
            />
            <FileInput
              label="보수교육 증명서 (2년마다 갱신)"
              field="training"
            />
          </div>

          {message && (
            <p className="text-sm text-red-500 mt-4">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={uploading || user?.verify_status === 'pending'}
            className="w-full mt-6 bg-green-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {uploading ? '제출 중...' : '서류 제출하기'}
          </button>
        </div>
      </main>
    </div>
  );
}