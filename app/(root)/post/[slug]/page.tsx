import { notFound } from "next/navigation";
import { PostDetailClient } from "@/components/post-detail-client";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`http://localhost:3000/api/posts/${slug}`, {
      next: { revalidate: 300 },
    });

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
        `http://localhost:3000/api/admin/settings`,
        {
          next: { revalidate: 3600 }, // 1 saat cache
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

  const res = await fetch(`http://localhost:3000/api/posts/${slug}`, {
    next: { revalidate: 300 }, // 5 dakika cache
  });

  const post = await res.json();

  if (!post) {
    return notFound();
  }

  const readingTime = calculateReadingTime(post.content);

  return <PostDetailClient post={post} slug={slug} readingTime={readingTime} />;
}
