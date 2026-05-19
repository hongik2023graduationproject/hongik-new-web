// 404 핸들러. App Router에서 `notFound()` 호출 또는 알 수 없는 경로 진입 시 자동 렌더.
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
            <h1 className="text-6xl font-bold tracking-tight">404</h1>
            <p className="text-lg text-muted-foreground">요청하신 페이지를 찾을 수 없습니다.</p>
            <Link
                href="/"
                className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
                플레이그라운드로 돌아가기
            </Link>
        </main>
    );
}
