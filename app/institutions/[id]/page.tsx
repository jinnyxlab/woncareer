import Link from 'next/link';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';

async function getInstitution(id: string) {
  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', id)
    .single();
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

        <Link href="/institutions" className="text-sm text-gray-400 hover:text-green-600 mb-6 inline-block">
          ← 기관 목록으로
        </Link>

        {!institution ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400">기관 정보를 찾을 수 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 기관 헤더 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{institution.name}</h1>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {institution.type && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                        {institution.type}
                      </span>
                    )}
                    {institution.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        institution.status === '정상'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-red-100 text-red-500'
                      }`}>
                        {institution.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm text-gray-600">
                <InfoRow label="주소" value={institution.address} />
                <InfoRow label="전화" value={institution.tel} />
                <InfoRow label="대표자" value={institution.representative} />
                <InfoRow label="인가일자" value={institution.approved_date ? formatDate(institution.approved_date) : null} />
                {institution.homepage && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-20 shrink-0">홈페이지</span>
                    <a href={institution.homepage} target="_blank" className="text-green-600 hover:underline truncate">
                      {institution.homepage}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 운영 현황 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 className="text-sm font-bold text-gray-700 mb-4">운영 현황</h2>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="정원" value={institution.capacity ? `${institution.capacity}명` : null} />
                <StatCard label="현원" value={institution.capacity_current ? `${institution.capacity_current}명` : null} />
                <StatCard label="보육교사 수" value={institution.teacher_count ? `${institution.teacher_count}명` : null} />
                <StatCard label="보육실 수" value={institution.room_count ? `${institution.room_count}개` : null} />
                <StatCard label="놀이터 수" value={institution.playground_count ? `${institution.playground_count}개` : null} />
                <StatCard label="CCTV" value={institution.cctv_count ? `${institution.cctv_count}대` : null} />
                <StatCard label="통학차량" value={institution.shuttle_bus || null} />
                <StatCard label="총 반수" value={institution.class_cnt_tot ? `${institution.class_cnt_tot}반` : null} />
                <StatCard label="총 아동수" value={institution.child_cnt_tot ? `${institution.child_cnt_tot}명` : null} />
              </div>
            </div>

            {/* 입소 대기 현황 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 className="text-sm font-bold text-gray-700 mb-4">입소 대기 현황</h2>
              <div className="grid grid-cols-4 gap-3">
                <StatCard label="0세" value={institution.ew_cnt_00 ? `${institution.ew_cnt_00}명` : '0명'} />
                <StatCard label="1세" value={institution.ew_cnt_01 ? `${institution.ew_cnt_01}명` : '0명'} />
                <StatCard label="2세" value={institution.ew_cnt_02 ? `${institution.ew_cnt_02}명` : '0명'} />
                <StatCard label="3세" value={institution.ew_cnt_03 ? `${institution.ew_cnt_03}명` : '0명'} />
                <StatCard label="4세" value={institution.ew_cnt_04 ? `${institution.ew_cnt_04}명` : '0명'} />
                <StatCard label="5세" value={institution.ew_cnt_05 ? `${institution.ew_cnt_05}명` : '0명'} />
                <StatCard label="6세 이상" value={institution.ew_cnt_m6 ? `${institution.ew_cnt_m6}명` : '0명'} />
                <StatCard label="총계" value={institution.ew_cnt_tot ? `${institution.ew_cnt_tot}명` : '0명'} />
              </div>
            </div>

            {/* 교직원 근속년수 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 className="text-sm font-bold text-gray-700 mb-4">교직원 근속년수</h2>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="1년 미만" value={institution.em_cnt_0y ? `${institution.em_cnt_0y}명` : '0명'} />
                <StatCard label="1~2년" value={institution.em_cnt_1y ? `${institution.em_cnt_1y}명` : '0명'} />
                <StatCard label="2~4년" value={institution.em_cnt_2y ? `${institution.em_cnt_2y}명` : '0명'} />
                <StatCard label="4~6년" value={institution.em_cnt_4y ? `${institution.em_cnt_4y}명` : '0명'} />
                <StatCard label="6년 이상" value={institution.em_cnt_6y ? `${institution.em_cnt_6y}명` : '0명'} />
              </div>
            </div>

            {/* 리뷰 섹션 */}
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

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 w-20 shrink-0">{label}</span>
      <span>{value || '정보 없음'}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-700">{value || '정보 없음'}</p>
    </div>
  );
}

function formatDate(date: string) {
  if (date.length !== 8) return date;
  return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
}