import { SidebarCategories } from "@/components/sidebar/categories";
import { MostRead } from "@/components/sidebar/most-read";

async function getCategories() {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL ||
      "https://next-supabase-blog-xi.vercel.app/"
    }/api/categories`,
    { cache: "no-store" }
  );
  const json = await res.json();
  return json.data || [];
}

export default async function SidebarServer() {
  const categories = await getCategories();

  return (
    <aside className="flex flex-col gap-6">
      <SidebarCategories />
      <MostRead />
    </aside>
  );
}
