'use client';

import { memo } from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink = memo(function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:px-4 focus:py-2 focus:bg-[#2F54EB] focus:text-white
        focus:rounded-lg focus:shadow-lg focus:font-medium focus:text-sm
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2F54EB]
      "
    >
      {children}
    </a>
  );
});

export const SkipLinks = memo(function SkipLinks() {
  return (
    <nav aria-label="スキップリンク">
      <SkipLink href="#search-panel">検索パネルへスキップ</SkipLink>
      <SkipLink href="#building-list">建物リストへスキップ</SkipLink>
      <SkipLink href="#main-content">メインコンテンツへスキップ</SkipLink>
    </nav>
  );
});
