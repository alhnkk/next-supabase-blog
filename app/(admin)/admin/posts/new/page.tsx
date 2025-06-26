import { NewPostEditor } from "@/components/admin/new-post-editor";

export default async function AdminNewPostPage() {
  // Middleware zaten admin kontrolünü yapıyor
  return <NewPostEditor />;
}
