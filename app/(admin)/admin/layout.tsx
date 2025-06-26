import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware zaten admin kontrolünü yapıyor, burada sadece user bilgisini alıyoruz
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user as {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role?: string;
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
