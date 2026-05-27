import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-xl">✉️</span>
        </div>
        <h1 className="text-lg font-bold text-gray-800 mb-2">이메일을 확인해주세요</h1>
        <p className="text-sm text-gray-500 mb-6">
          입력하신 이메일로 인증 링크를 보내드렸어요.<br />
          링크를 클릭하면 가입이 완료됩니다.
        </p>
        <Link href="/auth/login" className="text-sm text-green-600 hover:underline">
          로그인 페이지로 →
        </Link>
      </div>
    </div>
  );
}