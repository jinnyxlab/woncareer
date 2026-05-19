import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-0 z-20 shadow-sm">
      {/* 로고 */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">원</span>
        </div>
        <span className="text-green-700 font-bold text-lg tracking-tight">원커리어</span>
      </Link>

      {/* 메뉴 */}
      <nav className="flex items-center gap-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-green-600 transition-colors">기관 찾기</Link>
        <Link href="/jobs" className="hover:text-green-600 transition-colors">채용공고</Link>
        <Link href="/reviews" className="hover:text-green-600 transition-colors">리뷰</Link>
      </nav>

      {/* 로그인 */}
      <div className="flex items-center gap-2">
        <button className="text-sm text-gray-600 hover:text-green-600 transition-colors">로그인</button>
        <button className="text-sm bg-green-500 text-white px-4 py-1.5 rounded-full hover:bg-green-600 transition-colors">회원가입</button>
      </div>
    </header>
  );
}