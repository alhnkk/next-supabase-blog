import { notFound } from "next/navigation";
import { Suspense, lazy } from "react";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { Metadata } from "next";

const PostDetailClient = lazy(() =>
  import("@/components/post-detail-client").then((module) => ({
    default: module.PostDetailClient,
  }))
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(
      `https://next-supabase-blog-xi.vercel.app/api/posts/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return {
        title: "Post Bulunamadı | Blog",
      };
    }

    const post = await res.json();

    if (!post) {
      return {
        title: "Post Bulunamadı | Blog",
      };
    }

    // Get site settings for dynamic site name
    let siteName = "Blog";
    try {
      const settingsResponse = await fetch(
        `https://next-supabase-blog-xi.vercel.app/api/admin/settings`,
        {
          cache: "no-store",
        }
      );
      if (settingsResponse.ok) {
        const settingsResult = await settingsResponse.json();
        if (settingsResult.success && settingsResult.data?.siteName) {
          siteName = settingsResult.data.siteName;
        }
      }
    } catch (error) {
      // Use default if settings fetch fails
      console.log("Settings fetch failed, using default site name");
    }

    return {
      title: `${post.title} | ${siteName}`,
      description:
        post.excerpt || post.content?.substring(0, 160) || "Blog yazısı",
      openGraph: {
        title: `${post.title} | ${siteName}`,
        description:
          post.excerpt || post.content?.substring(0, 160) || "Blog yazısı",
        images: post.coverImage ? [post.coverImage] : [],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${post.title} | ${siteName}`,
        description:
          post.excerpt || post.content?.substring(0, 160) || "Blog yazısı",
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch (error) {
    return {
      title: "Post Bulunamadı | Blog",
    };
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const res = await fetch(
    `https://next-supabase-blog-xi.vercel.app/api/posts/${slug}`,
    {
      cache: "no-store",
    }
  );

  const post = await res.json();

  if (!post) {
    return notFound();
  }

  const readingTime = calculateReadingTime(post.content);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8" />
          <div className="max-w-4xl mx-auto p-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          </div>
        </div>
      }
    >
      <PostDetailClient post={post} slug={slug} readingTime={readingTime} />
    </Suspense>
  );
}
