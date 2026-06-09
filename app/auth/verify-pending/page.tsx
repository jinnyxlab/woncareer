import Link from 'next/link';
import Header from '../../components/Header';

export default function VerifyPendingPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-lg mx-auto px-6 pt-20 pb-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="text-lg font-bold text-gray-800 mb-2">서류 검토 중이에요</h1>
          <p className="text-sm text-gray-500 mb-6">
            제출하신 서류를 확인하고 있어요.<br/>
            보통 1~2일 내에 승인 완료 이메일을 보내드려요.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-sm bg-green-500 text-white px-6 py-2.5 rounded-full hover:bg-green-600 transition-colors inline-block">
              홈으로 가기
            </Link>
            <Link href="/mypage" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              마이페이지
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}