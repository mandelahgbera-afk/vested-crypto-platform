import Lottie from 'lottie-react';
import type { LottieRefCurrentProps } from 'lottie-react';
import { useRef, useEffect } from 'react';

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  onComplete?: () => void;
  speed?: number;
}

/**
 * Lottie Animation Wrapper
 * Handles animation playback with optional callbacks
 */
export default function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  width = '100%',
  height = '100%',
  className = '',
  onComplete,
  speed = 1,
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  return (
    <div className={className} style={{ width, height }}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
      />
    </div>
  );
}

/**
 * Loading Spinner Animation (SVG fallback)
 * Used when Lottie is not available or as a lightweight alternative
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizeMap[size]} relative`}>
      <svg
        className="animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

/**
 * Success Animation (SVG)
 */
export function SuccessAnimation() {
  return (
    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
      <svg
        className="w-8 h-8 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}

/**
 * Error Animation (SVG)
 */
export function ErrorAnimation() {
  return (
    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
      <svg
        className="w-8 h-8 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
}
