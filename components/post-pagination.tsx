"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PostPaginationProps {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
}

export function PostPagination({
  currentPage,
  totalPages,
  totalPosts,
  postsPerPage,
}: PostPaginationProps) {
  const searchParams = useSearchParams();

  // URL oluşturma fonksiyonu
  const createPageURL = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `?${params.toString()}`;
  };

  // Gösterilecek sayfa numaralarını hesapla
  const getVisiblePages = () => {
    const delta = 2; // Mevcut sayfanın etrafında gösterilecek sayfa sayısı
    const range = [];
    const rangeWithDots = [];

    // Başlangıç ve bitiş sayfalarını hesapla
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    // Sayfa numaralarını oluştur
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // İlk sayfa ve noktalar
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push("...");
      }
    }

    // Orta kısım
    rangeWithDots.push(...range);

    // Son sayfa ve noktalar
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();
  const startPost = (currentPage - 1) * postsPerPage + 1;
  const endPost = Math.min(currentPage * postsPerPage, totalPosts);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="flex flex-col items-center gap-6">
        {/* Post sayısı bilgisi */}
        <div className="text-sm text-slate-600 text-center">
          <span className="font-medium">
            {startPost}-{endPost}
          </span>{" "}
          arası, toplam <span className="font-medium">{totalPosts}</span> yazı
          gösteriliyor
        </div>

        {/* Pagination */}
        <nav className="flex justify-center" aria-label="Sayfa navigasyonu">
          <div className="flex items-center gap-1">
            {/* Önceki sayfa */}
            {currentPage > 1 ? (
              <Link
                href={createPageURL(currentPage - 1)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
                aria-label="Önceki sayfa"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Önceki
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-md cursor-not-allowed">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Önceki
              </span>
            )}

            {/* Sayfa numaraları */}
            {visiblePages.map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="flex items-center justify-center w-10 h-10 text-sm text-slate-500">
                    ...
                  </span>
                ) : (
                  <Link
                    href={createPageURL(page as number)}
                    className={`flex items-center justify-center w-10 h-10 text-sm font-medium border rounded-md transition-colors ${
                      currentPage === page
                        ? "text-white bg-slate-900 border-slate-900"
                        : "text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    aria-label={`Sayfa ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </Link>
                )}
              </div>
            ))}

            {/* Sonraki sayfa */}
            {currentPage < totalPages ? (
              <Link
                href={createPageURL(currentPage + 1)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
                aria-label="Sonraki sayfa"
              >
                Sonraki
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-md cursor-not-allowed">
                Sonraki
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
