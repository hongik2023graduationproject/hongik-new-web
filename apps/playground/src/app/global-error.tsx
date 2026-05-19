"use client";

// Root layout 자체에서 에러가 났을 때 발동.
// 일반 error.tsx와 달리 <html>/<body>를 직접 렌더링해야 한다.
// Tailwind/Provider 모두 사용할 수 없는 상황을 가정하므로 인라인 스타일만.

import { useEffect } from "react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.error("Global error:", error);
    }, [error]);

    return (
        <html lang="ko">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif',
                    padding: "2rem",
                    textAlign: "center",
                    color: "#1a1a1a",
                    background: "#fafafa",
                }}
            >
                <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: 0 }}>
                    심각한 오류가 발생했습니다
                </h1>
                <p style={{ maxWidth: 480, color: "#555", margin: "1rem 0 1.5rem" }}>
                    페이지를 불러올 수 없습니다. 잠시 후 새로고침 해주세요.
                </p>
                {error.digest ? (
                    <p style={{ fontSize: "0.75rem", color: "#888", margin: "0 0 1.5rem" }}>
                        에러 ID: {error.digest}
                    </p>
                ) : null}
                <button
                    type="button"
                    onClick={reset}
                    style={{
                        background: "#1a1a1a",
                        color: "white",
                        padding: "0.625rem 1.5rem",
                        border: "none",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                    }}
                >
                    다시 시도
                </button>
            </body>
        </html>
    );
}
