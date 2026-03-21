"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const ONBOARDING_KEY = "onboarding-completed";

interface TutorialStep {
  target: string; // data-onboarding attribute value
  title: string;
  description: string;
  position: "bottom" | "top" | "left" | "right";
}

const steps: TutorialStep[] = [
  {
    target: "editor",
    title: "코드 에디터",
    description: "여기에 한글 코드를 작성하세요",
    position: "right",
  },
  {
    target: "run-button",
    title: "실행 버튼",
    description: "▶ 실행 버튼을 눌러 코드를 실행하세요",
    position: "bottom",
  },
  {
    target: "example-selector",
    title: "예제 선택",
    description: "예제를 선택해 다양한 코드를 체험하세요",
    position: "bottom",
  },
  {
    target: "share-button",
    title: "공유",
    description: "공유 버튼으로 코드를 공유할 수 있어요",
    position: "bottom",
  },
  {
    target: "help-button",
    title: "단축키",
    description: "단축키: Ctrl+Enter(실행), Ctrl+S(저장)",
    position: "bottom",
  },
];

interface OnboardingTutorialProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function OnboardingTutorial({
  forceShow = false,
  onClose,
}: OnboardingTutorialProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if onboarding should show
  useEffect(() => {
    if (forceShow) {
      setCurrentStep(0);
      setVisible(true);
      return;
    }
    if (typeof window === "undefined") return;
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Delay slightly so layout is ready
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // Find and measure the target element
  const measureTarget = useCallback(() => {
    if (!visible) return;
    const step = steps[currentStep];
    const el = document.querySelector(`[data-onboarding="${step.target}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentStep, visible]);

  useEffect(() => {
    measureTarget();
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [measureTarget]);

  // Compute tooltip position after targetRect updates and tooltip renders
  useEffect(() => {
    if (!targetRect) {
      setTooltipPos(null);
      return;
    }
    // Wait for tooltip to render so we can measure it
    requestAnimationFrame(() => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      const tRect = tooltip.getBoundingClientRect();
      const step = steps[currentStep];
      const gap = 12;
      let top = 0;
      let left = 0;

      switch (step.position) {
        case "bottom":
          top = targetRect.bottom + gap;
          left = targetRect.left + targetRect.width / 2 - tRect.width / 2;
          break;
        case "top":
          top = targetRect.top - tRect.height - gap;
          left = targetRect.left + targetRect.width / 2 - tRect.width / 2;
          break;
        case "right":
          top = targetRect.top + targetRect.height / 2 - tRect.height / 2;
          left = targetRect.right + gap;
          break;
        case "left":
          top = targetRect.top + targetRect.height / 2 - tRect.height / 2;
          left = targetRect.left - tRect.width - gap;
          break;
      }

      // Clamp to viewport
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      left = Math.max(8, Math.min(left, vw - tRect.width - 8));
      top = Math.max(8, Math.min(top, vh - tRect.height - 8));

      setTooltipPos({ top, left });
    });
  }, [targetRect, currentStep]);

  const handleClose = useCallback(() => {
    setVisible(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
    onClose?.();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, handleClose, handleNext, handlePrev]);

  if (!visible) return null;

  const padding = 6;

  return (
    <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      {/* SVG overlay with cutout for highlighted element */}
      <svg
        className="absolute inset-0 h-full w-full"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <mask id="onboarding-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#onboarding-mask)"
        />
      </svg>

      {/* Clickable overlay to skip */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        style={{ pointerEvents: "auto" }}
      />

      {/* Highlight border ring */}
      {targetRect && (
        <div
          className="absolute rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent transition-all duration-300 ease-in-out"
          style={{
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-[10000] w-72 sm:w-80 rounded-xl border bg-card p-4 shadow-xl transition-all duration-300 ease-in-out"
        style={{
          top: tooltipPos?.top ?? -9999,
          left: tooltipPos?.left ?? -9999,
          opacity: tooltipPos ? 1 : 0,
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <p className="text-xs font-medium text-primary mb-1">
            {currentStep + 1} / {steps.length}
          </p>
          <h3 className="text-sm font-semibold text-foreground">
            {steps[currentStep].title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`inline-block h-2 w-2 rounded-full transition-colors duration-200 ${
                i === currentStep
                  ? "bg-primary"
                  : i < currentStep
                    ? "bg-primary/40"
                    : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            건너뛰기
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="rounded-md border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                이전
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {currentStep === steps.length - 1 ? "완료" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hook for triggering tutorial restart from outside */
export function useOnboardingTrigger() {
  const [showTutorial, setShowTutorial] = useState(false);

  const startTutorial = useCallback(() => {
    setShowTutorial(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
  }, []);

  return { showTutorial, startTutorial, closeTutorial };
}
