"use client";
import { SidebarCategories } from "@/components/sidebar/categories";
import { MostRead } from "@/components/sidebar/most-read";

export default function SidebarClient() {
  return (
    <aside className="flex flex-col gap-6">
      <SidebarCategories />
      <MostRead />
    </aside>
  );
}
