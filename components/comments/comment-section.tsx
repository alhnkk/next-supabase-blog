"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  MessageCircle,
  Heart,
  Reply,
  MoreHorizontal,
  Flag,
  Edit,
  Trash2,
  Send,
  User,
  LogIn,
  Lock,
  Smile,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCommentStore } from "@/lib/stores/comment-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { authClient } from "@/lib/auth-client";
import { LoginModal } from "@/components/login-modal";
import { RegisterModal } from "@/components/register-modal";
import { EmojiPicker } from "@/components/emoji-picker";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Yorum boş olamaz")
    .max(500, "Yorum 500 karakterden uzun olamaz"),
});

interface CommentSectionProps {
  postId: string;
  allowComments?: boolean;
}

interface CommentItemProps {
  comment: any;
  level?: number;
  onReply: (commentId: string) => void;
}

function CommentItem({ comment, level = 0, onReply }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount || 0);
  const [session, setSession] = useState<any>(null);
  const { deleteComment, toggleCommentLike } = useCommentStore();

  // Manual session fetch
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData?.data || null);
      } catch (error) {
        console.error("Session fetch error:", error);
        setSession(null);
      }
    };
    fetchSession();
  }, []);

  // Kullanıcının bu yoruma beğeni durumunu kontrol et
  useEffect(() => {
    const checkUserLikeStatus = async () => {
      if (!session?.user || !comment.id) return;

      try {
        const response = await fetch(`/api/comments/${comment.id}/like`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.userReaction === "LIKE");
          setLocalLikeCount(data.likeCount || 0);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkUserLikeStatus();
  }, [session, comment.id]);

  const handleLike = async () => {
    if (!session) {
      // Kullanıcı giriş yapmamışsa login modalını açmaya yönlendir
      return;
    }

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLocalLikeCount((prev: number) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      await toggleCommentLike(comment.id);
    } catch (error) {
      // Hata olursa geri al
      setIsLiked(!newIsLiked);
      setLocalLikeCount((prev: number) => (newIsLiked ? prev - 1 : prev + 1));
    }
  };

  const handleDelete = async () => {
    if (confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
      await deleteComment(comment.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt));

  return (
    <div
      className={cn(
        "space-y-4",
        level > 0 && "ml-8 pl-4 border-l-2 border-muted"
      )}
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-muted">
              <AvatarImage src={comment.author?.image} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {comment.author?.name?.charAt(0)?.toUpperCase() || (
                  <User className="w-4 h-4" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">
                  {comment.author?.name || "Anonim Kullanıcı"}
                </h4>
                {comment.author?.isAdmin && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
                {comment.isEdited && (
                  <Badge variant="outline" className="text-xs">
                    Düzenlenmiş
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{timeAgo} önce</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onReply(comment.id)}>
                <Reply className="w-4 h-4 mr-2" />
                Yanıtla
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="w-4 h-4 mr-2" />
                Şikayet Et
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Comment Content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>

        {/* Comment Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-8 gap-2 text-muted-foreground hover:text-foreground",
                isLiked && "text-red-500 hover:text-red-600"
              )}
              disabled={!session}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              <span className="text-xs">{localLikeCount}</span>
              {!session && <span className="text-xs ml-1">(Giriş yapın)</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="h-8 gap-2 text-muted-foreground hover:text-foreground"
            >
              <Reply className="w-4 h-4" />
              <span className="text-xs">Yanıtla</span>
            </Button>

            {/* Quick Emoji Reactions */}
            <div className="flex items-center gap-1 ml-2 border-l border-muted pl-2">
              {["👍", "❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-sm hover:bg-muted hover:scale-110 transition-transform"
                  onClick={() => {
                    // TODO: Add emoji reaction to comment
                  }}
                  title={`${emoji} ile tepki ver`}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Show existing reactions if any */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {comment.reactions.map((reaction: any, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1"
                >
                  {reaction.emoji}
                  <span>{reaction.count}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
}: {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { addComment, isLoading } = useCommentStore();
  const [session, setSession] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Manual session fetch
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData?.data || null);
      } catch (error) {
        console.error("Session fetch error:", error);
        setSession(null);
      }
    };
    fetchSession();
  }, []);

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: any) => {
    try {
      await addComment(postId, values.content, parentId);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Yorum eklenirken hata:", error);
    }
  };

  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Giriş yapmamış kullanıcı için login prompt
  if (!session) {
    return (
      <>
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Yorum yapmak için giriş yapın
              </h3>
              <p className="text-gray-600">
                Düşüncelerinizi paylaşmak için hesabınıza giriş yapmanız
                gerekiyor.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setIsLoginModalOpen(true)}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRegisterModalOpen(true)}
              >
                Hesap Oluştur
              </Button>
            </div>
          </div>
        </Card>

        <LoginModal
          open={isLoginModalOpen}
          onOpenChange={setIsLoginModalOpen}
          onSwitchToRegister={handleSwitchToRegister}
        />

        <RegisterModal
          open={isRegisterModalOpen}
          onOpenChange={setIsRegisterModalOpen}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </>
    );
  }

  return (
    <Card className="p-4 bg-muted/30">
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="w-10 h-10 ring-2 ring-muted">
          <AvatarImage src={session.user?.image || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {session.user?.name?.charAt(0)?.toUpperCase() || (
              <User className="w-4 h-4" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-1">
            {session.user?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {parentId ? "Yanıt yazıyorsunuz" : "Yorum yazıyorsunuz"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder={
                        parentId ? "Yanıtınızı yazın..." : "Yorumunuzu yazın..."
                      }
                      className="min-h-[100px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
                      {...field}
                    />
                    <div className="absolute bottom-2 right-2">
                      <EmojiPicker
                        onEmojiSelect={(emoji) => {
                          const currentValue = field.value || "";
                          const newValue = currentValue + emoji;
                          field.onChange(newValue);
                        }}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Smile className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Maksimum 500 karakter ({form.watch("content")?.length || 0}/500)
            </p>

            <div className="flex gap-2">
              {parentId && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                >
                  İptal
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !form.watch("content")?.trim()}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isLoading ? "Gönderiliyor..." : "Gönder"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
}

export function CommentSection({
  postId,
  allowComments = true,
}: CommentSectionProps) {
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const {
    comments,
    isLoading,
    setActivePostId,
    getNestedComments,
    fetchCommentsByPost,
  } = useCommentStore();

  // Manual session fetch
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData?.data || null);
      } catch (error) {
        console.error("Session fetch error:", error);
        setSession(null);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (postId) {
      setActivePostId(postId);
    }
  }, [postId, setActivePostId]);

  const postComments = getNestedComments(null);
  const commentCount = postComments.length;

  const handleReply = (commentId: string) => {
    // Giriş yapmamış kullanıcı için modal aç
    if (!session) {
      setIsLoginModalOpen(true);
      return;
    }
    setReplyToId(replyToId === commentId ? null : commentId);
  };

  const handleReplySuccess = () => {
    setReplyToId(null);
  };

  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  if (!allowComments) {
    return (
      <Card className="p-6 text-center bg-muted/30">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          Bu yazıda yorumlar kapatılmıştır.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold font-heading text-foreground">
            Yorumlar
          </h2>
          <Badge variant="secondary" className="text-sm">
            {commentCount}
          </Badge>
        </div>

        <p className="text-muted-foreground">
          Düşüncelerinizi bizimle paylaşın! Saygılı ve yapıcı yorumlarınızı
          bekliyoruz.
        </p>
      </Card>

      {/* Comment Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-heading text-foreground">
          Yorum Yap
        </h3>
        <CommentForm postId={postId} />
      </div>

      <Separator />

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : postComments.length === 0 ? (
          <Card className="p-8 text-center bg-muted/30">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold font-heading mb-2">
              Henüz yorum yok
            </h3>
            <p className="text-muted-foreground">
              İlk yorumu yapan kişi siz olun!
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {postComments.map((comment: any) => (
              <div key={comment.id}>
                <CommentItem comment={comment} onReply={handleReply} />

                {/* Reply Form */}
                {replyToId === comment.id && session && (
                  <div className="mt-4 ml-8">
                    <CommentForm
                      postId={postId}
                      parentId={comment.id}
                      onSuccess={handleReplySuccess}
                      onCancel={() => setReplyToId(null)}
                    />
                  </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-8 space-y-4">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id}>
                        <CommentItem
                          comment={reply}
                          level={1}
                          onReply={handleReply}
                        />

                        {/* Reply Form for nested comment */}
                        {replyToId === reply.id && session && (
                          <div className="mt-4 ml-8">
                            <CommentForm
                              postId={postId}
                              parentId={reply.id}
                              onSuccess={handleReplySuccess}
                              onCancel={() => setReplyToId(null)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Load More */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => fetchCommentsByPost(postId)}
                disabled={isLoading}
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Daha Fazla Yorum Yükle
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modals */}
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <RegisterModal
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}
