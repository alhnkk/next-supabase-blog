"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

interface PostShareButtonProps {
  post: {
    title: string;
    slug: string;
    excerpt: string;
  };
  size?: "sm" | "default" | "lg";
  variant?: "outline" | "default" | "ghost";
  showText?: boolean;
}

export function PostShareButton({
  post,
  size = "sm",
  variant = "outline",
  showText = true,
}: PostShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<{ [key: string]: string }>({});
  const [postUrl, setPostUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/post/${post.slug}`;
      setPostUrl(url);

      const encodedUrl = encodeURIComponent(url);
      const encodedTitle = encodeURIComponent(post.title);

      setShareLinks({
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=blog,makale`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      });
    }
  }, [post.slug, post.title]);

  const handleShare = (platform: string) => {
    const link = shareLinks[platform];
    if (link && typeof window !== "undefined") {
      window.open(link, "_blank", "width=600,height=400");
      setIsOpen(false);
    }
  };

  const handleCopyLink = async () => {
    if (typeof window !== "undefined" && postUrl) {
      try {
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link kopyalandı!");
        setIsOpen(false);
      } catch (error) {
        toast.error("Link kopyalanamadı");
      }
    }
  };

  const handleNativeShare = async () => {
    if (
      typeof window !== "undefined" &&
      typeof navigator?.share === "function" &&
      postUrl
    ) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: postUrl,
        });
        setIsOpen(false);
      } catch (error) {
        console.log("Paylaşım iptal edildi");
      }
    } else {
      // Fallback: Copy to clipboard
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="w-4 h-4" />
          {showText && "Paylaş"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Native Share (Mobile) */}
        {typeof window !== "undefined" &&
          typeof navigator?.share === "function" &&
          postUrl && (
            <>
              <DropdownMenuItem onClick={handleNativeShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                Paylaş
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

        {/* Social Media */}
        <DropdownMenuItem
          onClick={() => handleShare("twitter")}
          className="gap-2"
        >
          <Twitter className="w-4 h-4 text-blue-400" />
          Twitter'da Paylaş
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleShare("facebook")}
          className="gap-2"
        >
          <Facebook className="w-4 h-4 text-blue-600" />
          Facebook'ta Paylaş
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleShare("linkedin")}
          className="gap-2"
        >
          <Linkedin className="w-4 h-4 text-blue-700" />
          LinkedIn'de Paylaş
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleShare("whatsapp")}
          className="gap-2"
        >
          <MessageCircle className="w-4 h-4 text-green-600" />
          WhatsApp'ta Paylaş
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
          <Link2 className="w-4 h-4" />
          Linki Kopyala
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
