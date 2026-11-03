import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function AdminBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'admin');

  if (pathnames.length === 0 || pathnames[0] === 'dashboard') {
    return null;
  }

  const formatSegment = (str: string) => {
    return str
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6" aria-label="Breadcrumb">
      <Link
        to="/admin/dashboard"
        className="flex items-center gap-1 hover:text-zinc-700 transition-colors"
      >
        <Home size={13} />
        <span>Dashboard</span>
      </Link>
      {pathnames.map((value, index) => {
        const to = `/admin/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} className="text-zinc-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-zinc-900 truncate max-w-[200px]">
                {formatSegment(value)}
              </span>
            ) : (
              <Link to={to} className="hover:text-zinc-700 transition-colors capitalize">
                {formatSegment(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
