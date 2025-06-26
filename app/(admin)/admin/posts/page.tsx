import { PostsManagement } from "@/components/admin/posts-management";

export default async function AdminPostsPage() {
  // Middleware zaten admin kontrolünü yapıyor
  return <PostsManagement />;
}
