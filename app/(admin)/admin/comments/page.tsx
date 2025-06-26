import { CommentModeration } from "@/components/comments/comment-moderation";

export default async function AdminCommentsPage() {
  // Middleware zaten admin kontrolünü yapıyor
  return <CommentModeration />;
}
