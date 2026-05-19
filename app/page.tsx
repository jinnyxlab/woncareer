import Link from 'next/link';
import Header from './components/Header';

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-14">

        {/* 히어로 섹션 */}
        <section className="bg-green-600 text-white py-16 px-6 text-center">
          <h1 className="text-3xl font-bold mb-3">보육교사를 위한 커리어 플랫폼</h1>
          <p className="text-green-100 text-sm mb-8">전국 어린이집 · 유치원 정보와 채용공고를 한곳에서</p>
          <div className="flex justify-center gap-3">
            <Link href="/institutions" className="bg-white text-green-600 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-green-50 transition-colors">
              기관 찾기
            </Link>
            <Link href="/jobs" className="border border-white text-white px-6 py-2.5 rounded-full text-sm hover:bg-green-700 transition-colors">
              채용공고 보기
            </Link>
          </div>
        </section>

        {/* 통계 */}
        <section className="bg-white border-b border-gray-100 py-6 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            {[
              { label: '등록 기관', value: '4만+' },
              { label: '채용공고', value: '1천+' },
              { label: '보육교사 리뷰', value: '준비중' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-green-600">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 메인 콘텐츠 */}
        <section className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-3 gap-6">

          {/* 지도 미리보기 */}
          <div className="col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-700">기관 찾기</h2>
              <Link href="/institutions" className="text-xs text-green-600 hover:underline">전체보기</Link>
            </div>
            <div className="bg-green-50 h-40 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg">📍</span>
              </div>
              <p className="text-xs text-gray-500">지도에서 어린이집을 찾아보세요</p>
              <Link href="/institutions" className="text-xs bg-green-500 text-white px-4 py-1.5 rounded-full hover:bg-green-600 transition-colors">
                지도 열기
              </Link>
            </div>
          </div>

          {/* 채용공고 미리보기 */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-700">최신 채용공고</h2>
              <Link href="/jobs" className="text-xs text-green-600 hover:underline">전체보기</Link>
            </div>
            <div className="flex flex-col divide-y divide-gray-50">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-700">채용공고 준비중</p>
                    <p className="text-xs text-gray-400 mt-0.5">워크넷 연동 예정</p>
                  </div>
                  <span className="text-xs text-gray-300">—</span>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}