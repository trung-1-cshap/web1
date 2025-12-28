export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans">
      <main className="w-full max-w-3xl p-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black">
            Quản lí thu chi công ty NDA HOME
          </h1>
          <p className="max-w-md text-lg leading-8 text-gray-600">
            Ứng dụng quản lí thu chi đơn giản, hiệu quả dành cho doanh nghiệp nhỏ và cá nhân.
          </p>
        </div>
      </main>
    </div>
  );
}
