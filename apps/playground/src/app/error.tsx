"use client";

// 라우트 단위 에러 바운더리.
// Next.js가 동일 segment의 컴포넌트에서 throw를 잡아 이 페이지로 렌더링한다.
// global-error.tsx는 layout 자체가 깨졌을 때만 발동하므로 별도.

import { useEffect } from "react";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Sentry 통합 시 여기서 captureException 호출.
        // 현재는 콘솔로만 노출 — 운영 환경에서는 stdout JSON 로그로 흘러간다.
        // eslint-disable-next-line no-console
        console.error("Page error:", error);
    }, [error]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">문제가 발생했습니다</h1>
            <p className="max-w-md text-muted-foreground">
                예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
            </p>
            {error.digest ? (
                <p className="text-xs text-muted-foreground">에러 ID: {error.digest}</p>
            ) : null}
            <button
                type="button"
                onClick={reset}
                className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
                다시 시도
            </button>
        </main>
    );
}
