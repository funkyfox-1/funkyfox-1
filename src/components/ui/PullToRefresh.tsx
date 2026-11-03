import * as React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { showToast } from '../../utils/toast';

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullY, setPullY] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [canPull, setCanPull] = React.useState(false);
  const startY = React.useRef(0);
  const isDragging = React.useRef(false);

  const THRESHOLD = 72;
  const MAX_PULL = 110;

  React.useEffect(() => {
    const handleScroll = () => {
      setCanPull(window.scrollY <= 2);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (window.scrollY > 2 || isRefreshing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current || isRefreshing || window.scrollY > 5) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = clientY - startY.current;

    if (diff > 0) {
      // Damped rubber-band formula
      const damped = Math.min(MAX_PULL, Math.pow(diff, 0.85) * 1.8);
      setPullY(damped);
      if ('touches' in e && e.cancelable && damped > 10) {
        // Prevent default browser scroll while pulling
        e.preventDefault();
      }
    } else {
      setPullY(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging.current || isRefreshing) return;
    isDragging.current = false;

    if (pullY >= THRESHOLD) {
      setIsRefreshing(true);
      setPullY(56); // Hold at indicator height

      // Dispatch inventory refresh event across the app
      window.dispatchEvent(new Event('funky-fox-inventory-refresh'));
      window.dispatchEvent(new Event('storage'));

      if (onRefresh) {
        try {
          await onRefresh();
        } catch (err) {
          console.error(err);
        }
      } else {
        // Simulated network catalog refresh delay
        await new Promise((r) => setTimeout(r, 900));
      }

      showToast('Store catalog updated · Live inventory synchronized', { type: 'success' });

      setTimeout(() => {
        setIsRefreshing(false);
        setPullY(0);
      }, 300);
    } else {
      setPullY(0);
    }
  };

  const progress = Math.min(1, pullY / THRESHOLD);
  const rotation = isRefreshing ? 'animate-spin' : '';

  return (
    <div
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative select-none"
    >
      {/* Pull Indicator Banner that stretches down from top */}
      <div
        className="w-full flex items-center justify-center overflow-hidden transition-all duration-200 pointer-events-none z-30"
        style={{
          height: `${pullY}px`,
          opacity: pullY > 8 ? 1 : 0,
        }}
        aria-hidden={pullY === 0}
      >
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-[#E8E4D8] shadow-sm text-xs font-semibold text-[#1c1d1a] backdrop-blur-xs">
          <span
            className={`text-[#E87535] inline-flex items-center justify-center transition-transform duration-150 ${rotation}`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
            }}
          >
            {isRefreshing ? (
              <RefreshCw size={14} className="animate-spin text-[#E87535]" />
            ) : (
              <span className="text-base leading-none">🦊</span>
            )}
          </span>

          <span className="tracking-wide">
            {isRefreshing
              ? 'Refreshing store catalog...'
              : pullY >= THRESHOLD
              ? 'Release to sync catalog'
              : 'Pull down to refresh inventory'}
          </span>

          {pullY >= THRESHOLD && !isRefreshing && (
            <Sparkles size={13} className="text-[#E87535] animate-pulse" />
          )}
        </div>
      </div>

      {/* Main Content with soft spring transition */}
      <div
        style={{
          transform: pullY > 0 ? `translate3d(0, ${pullY * 0.4}px, 0)` : undefined,
          transition: isDragging.current ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

