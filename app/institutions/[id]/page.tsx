import Link from 'next/link';
import Header from '../../components/Header';

import { supabase } from '../../lib/supabase';

async function getInstitution(id: string) {
  console.log('조회할 id:', id);
  
  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', id)
    .single();

  console.log('data:', data);
  console.log('error:', error);

  if (error) return null;
  return data;
}

export default async function InstitutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const institution = await getInstitution(id);
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-6 pt-20 pb-10">

        {/* 뒤로가기 */}
        <Link href="/institutions" className="text-sm text-gray-400 hover:text-green-600 mb-6 inline-block">
          ← 기관 목록으로
        </Link>

        {!institution ? (
          // Fallback
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400">기관 정보를 찾을 수 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 기관 기본정보 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{institution.name}</h1>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {institution.type || '유형 정보 없음'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm text-gray-600">
                <div className="flex gap-2">
                  <span className="text-gray-400 w-16 shrink-0">주소</span>
                  <span>{institution.address || '정보 없음'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-16 shrink-0">전화</span>
                  <span>{institution.tel || '정보 없음'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-16 shrink-0">정원</span>
                  <span>{institution.capacity ? `${institution.capacity}명` : '정보 없음'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-16 shrink-0">홈페이지</span>
                  {institution.homepage ? (
                    <a href={institution.homepage} target="_blank" className="text-green-600 hover:underline">
                      {institution.homepage}
                    </a>
                  ) : (
                    <span>정보 없음</span>
                  )}
                </div>
              </div>
            </div>

            {/* 리뷰 섹션 (추후 구현) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-700 mb-4">보육교사 리뷰</h2>
              <div className="text-center py-8 text-gray-400 text-sm">
                아직 작성된 리뷰가 없습니다.<br/>
                보육교사 회원으로 로그인하면 리뷰를 작성할 수 있어요.
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}