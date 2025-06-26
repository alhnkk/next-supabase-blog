import { UsersManagement } from "@/components/admin/users-management";

export default async function AdminUsersPage() {
  // Middleware zaten admin kontrolünü yapıyor
  return <UsersManagement />;
}
