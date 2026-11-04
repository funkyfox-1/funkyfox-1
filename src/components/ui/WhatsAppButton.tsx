import * as React from 'react';
import { useLocation } from 'react-router-dom';

export default function WhatsAppButton() {
  const location = useLocation();

  // Hide floating button on admin routes or checkout review
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  const phone = '919493551595';
  const defaultText = encodeURIComponent(
    'Hi Funky Fox team! I would like to inquire about your menswear collection and orders.'
  );
  const waUrl = `https://wa.me/${phone}?text=${defaultText}`;

  return (
    <aside
      aria-label="WhatsApp customer support"
      className="fixed bottom-5 right-5 z-40 print:hidden"
    >
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Funky Fox support on WhatsApp"
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-all duration-200 hover:scale-105 active:scale-95 border border-white/20 touch-manipulation"
      >
        {/* Official WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="currentColor"
          className="shrink-0 transition-transform duration-200 group-hover:rotate-6"
          aria-hidden="true"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.05 7.42C8.88 7.42 8.6 7.49 8.36 7.75C8.13 8.01 7.47 8.63 7.47 9.89C7.47 11.16 8.39 12.38 8.52 12.56C8.65 12.73 10.33 15.33 12.91 16.44C13.52 16.71 14 16.88 14.37 17C14.99 17.2 15.55 17.17 15.99 17.1C16.49 17.03 17.51 16.48 17.72 15.89C17.93 15.3 17.93 14.79 17.87 14.69C17.8 14.58 17.64 14.52 17.39 14.39C17.14 14.27 15.91 13.66 15.68 13.58C15.45 13.49 15.29 13.45 15.12 13.7C14.95 13.96 14.47 14.52 14.33 14.69C14.18 14.86 14.04 14.88 13.79 14.75C13.54 14.63 12.74 14.37 11.79 13.52C11.05 12.86 10.55 12.04 10.41 11.79C10.26 11.54 10.39 11.4 10.52 11.28C10.63 11.17 10.77 10.99 10.9 10.84C11.03 10.69 11.07 10.59 11.15 10.42C11.23 10.25 11.19 10.1 11.13 9.98C11.07 9.85 10.57 8.63 10.37 8.13C10.16 7.64 9.96 7.71 9.81 7.7C9.67 7.7 9.5 7.69 9.33 7.69C9.17 7.69 8.9 7.75 8.66 8.01" />
        </svg>
        <span className="hidden sm:inline font-sans text-xs font-bold tracking-wide uppercase">
          WhatsApp Us
        </span>
      </a>
    </aside>
  );
}

