"use client";

import { useState, useEffect } from "react";
import { PostEditor } from "@/components/admin/post-editor";
import { notFound as nextNotFound, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  isPublished: boolean;
  categoryId?: string;
  tags?: Array<{ id: string; name: string }>;
}

export default function PostEditPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/posts/${id}`);

        if (!response.ok) {
          setIsNotFound(true);
          return;
        }

        const result = await response.json();
        if (result.success) {
          setPost(result.data);
        } else {
          setIsNotFound(true);
        }
      } catch (_error) {
        console.error("Error fetching post:", _error);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Post Bulunamadı
          </h1>
          <p className="text-gray-600">
            Aradığınız post mevcut değil veya erişim izniniz bulunmuyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Post Düzenle</h1>
        <p className="text-gray-600 mt-2">
          {post?.title
            ? `"${post.title}" başlıklı postu düzenleyin`
            : "Post düzenleniyor..."}
        </p>
      </div>

      <PostEditor post={post} mode="edit" />
    </div>
  );
}
