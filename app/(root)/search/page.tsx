import { AdvancedSearch } from "@/components/advanced-search";
import { Metadata } from "next";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const metadata: Metadata = {
  title: "Gelişmiş Arama | JURNALİZE",
  description:
    "İstediğiniz içeriği bulmak için güçlü filtreleme ve arama özelliklerini kullanın",
  keywords: ["arama", "içerik", "makale", "blog", "filtre"],
};

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdvancedSearch />
    </Suspense>
  );
}
