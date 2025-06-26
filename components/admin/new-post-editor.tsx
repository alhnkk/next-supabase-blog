"use client";

import { useState, useEffect, useRef } from "react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { TiptapEditor } from "@/components/tiptap-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Save,
  ArrowLeft,
  Eye,
  Calendar,
  Upload,
  Settings,
  Clock,
  Globe,
  Lock,
  Users,
  BookOpen,
  FileText,
  Heart,
  MessageCircle,
  TrendingUp,
  Newspaper,
  X,
  Plus,
  Info,
  Search,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface PostType {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const POST_TYPES: PostType[] = [
  {
    value: "article",
    label: "Makale",
    icon: <FileText className="w-4 h-4" />,
    description: "Detaylı analiz ve bilgi içeren uzun format yazılar",
  },
  {
    value: "essay",
    label: "Deneme",
    icon: <BookOpen className="w-4 h-4" />,
    description: "Kişisel görüşler ve düşünceler içeren yazılar",
  },
  {
    value: "poetry",
    label: "Şiir",
    icon: <Heart className="w-4 h-4" />,
    description: "Sanatsal ve estetik ifadeler",
  },
  {
    value: "review",
    label: "İnceleme",
    icon: <TrendingUp className="w-4 h-4" />,
    description: "Ürün, hizmet veya içerik değerlendirmeleri",
  },
  {
    value: "interview",
    label: "Röportaj",
    icon: <MessageCircle className="w-4 h-4" />,
    description: "Kişilerle yapılan sohbet ve görüşmeler",
  },
  {
    value: "news",
    label: "Haber",
    icon: <Newspaper className="w-4 h-4" />,
    description: "Güncel gelişmeler ve haberler",
  },
];

export function NewPostEditor() {
  const router = useRouter();
  const coverImageFileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading: isUploadingCover, uploadImage } = useImageUpload();

  const [post, setPost] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    categoryId: "",
    tags: [] as string[],
    postType: "article" as string,
    status: "draft" as "draft" | "published" | "review" | "scheduled",
    isFeatured: false,
    allowComments: true,
    allowLikes: true,
    visibility: "public" as "public" | "private" | "password",
    password: "",
    publishedAt: "",
    metaTitle: "",
    metaDescription: "",
    coverImage: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [currentTag, setCurrentTag] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Yeni state'ler
  const [showPreview, setShowPreview] = useState(false);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [showNewTypeDialog, setShowNewTypeDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#3b82f6",
  });
  const [newType, setNewType] = useState({
    value: "",
    label: "",
    description: "",
  });

  // Kategorileri ve etiketleri fetch et
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch("/api/categories?page=1&limit=100&sortBy=name&sortOrder=asc"),
          fetch("/api/tags?page=1&limit=100"),
        ]);

        const categoriesData = await categoriesRes.json();
        const tagsData = await tagsRes.json();

        // API response format'ına göre düzenle
        if (categoriesData.success) {
          setCategories(categoriesData.data || []);
        } else {
          console.error("Categories API error:", categoriesData.message);
          setCategories([]);
        }

        if (tagsData.success !== false) {
          setTags(tagsData.data || []);
        } else {
          console.error("Tags API error:", tagsData.message);
          setTags([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Veriler yüklenirken bir hata oluştu");
      }
    };

    fetchData();
  }, []);

  // Başlıktan slug oluştur
  useEffect(() => {
    if (post.title && !post.slug) {
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setPost((prev) => ({ ...prev, slug }));
    }
  }, [post.title, post.slug]);

  // Auto save
  useEffect(() => {
    if (!autoSaveEnabled || !post.title) return;

    const timer = setTimeout(() => {
      handleSave("draft", true);
    }, 30000); // 30 saniye

    return () => clearTimeout(timer);
  }, [post, autoSaveEnabled]);

  const handleSave = async (status: string = post.status, autoSave = false) => {
    if (!post.title || !post.content || !post.categoryId) {
      if (!autoSave) {
        toast.error("Başlık, içerik ve kategori zorunludur");
      }
      return;
    }

    setIsLoading(true);

    try {
      const postData = {
        ...post,
        status,
        publishedAt:
          status === "published" && !post.publishedAt
            ? new Date().toISOString()
            : post.publishedAt,
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const savedPost = await response.json();
        setLastSaved(new Date());

        if (!autoSave) {
          toast.success(
            status === "published"
              ? "Gönderi başarıyla yayınlandı!"
              : "Gönderi başarıyla kaydedildi!"
          );

          if (status === "published") {
            router.push("/admin/posts");
          }
        }
      } else {
        throw new Error("Kayıt işlemi başarısız");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      if (!autoSave) {
        toast.error("Gönderi kaydedilirken bir hata oluştu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !post.tags.includes(currentTag.trim())) {
      setPost((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const getTypeIcon = (type: string) => {
    const typeData = POST_TYPES.find((t) => t.value === type);
    return typeData?.icon || <FileText className="w-4 h-4" />;
  };

  const handleCoverImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImage(file, "covers");
      if (uploadedUrl) {
        setPost((prev) => ({ ...prev, coverImage: uploadedUrl }));
      }
    } catch (error) {
      console.error("Cover image upload failed:", error);
    } finally {
      // Reset file input
      if (coverImageFileInputRef.current) {
        coverImageFileInputRef.current.value = "";
      }
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Kategori adı gereklidir");
      return;
    }

    try {
      // Türkçe karakterleri değiştir ve slug oluştur
      const generateSlug = (text: string) => {
        return text
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
          .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
          .replace(/-+/g, '-') // Çoklu tireleri tek tire yap
          .trim();
      };

      const slug = generateSlug(newCategory.name);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          slug: slug,
          color: newCategory.color,
        }),
      });

      if (response.ok) {
        const createdCategory = await response.json();
        setCategories((prev) => [...prev, createdCategory.data]);
        setPost((prev) => ({ ...prev, categoryId: createdCategory.data.id }));
        setNewCategory({ name: "", color: "#3b82f6" });
        setShowNewCategoryDialog(false);
        toast.success("Kategori başarıyla oluşturuldu");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kategori oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error instanceof Error ? error.message : "Kategori oluşturulurken bir hata oluştu");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Önizleme komponenti
  const PreviewModal = () => (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gönderi Önizlemesi</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getStatusBadgeColor(post.status)}>
                {post.status.toUpperCase()}
              </Badge>
              {categories.find((c) => c.id === post.categoryId) && (
                <Badge variant="outline">
                  {categories.find((c) => c.id === post.categoryId)?.name}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold">
              {post.title || "Başlık girilmedi"}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-muted-foreground">{post.excerpt}</p>
            )}

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: post.content || "<p>İçerik henüz girilmedi</p>",
              }}
            />

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Yeni Gönderi</h2>
            <p className="text-slate-600">Yeni bir gönderi oluşturun</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>
              {lastSaved
                ? `Son kayıt: ${lastSaved.toLocaleTimeString()}`
                : "Henüz kaydedilmedi"}
            </span>
            <Switch
              checked={autoSaveEnabled}
              onCheckedChange={setAutoSaveEnabled}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="w-4 h-4" />
            Önizle
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave("published")}
            disabled={
              isLoading || !post.title || !post.content || !post.categoryId
            }
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Yayınlanıyor..." : "Yayınla"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title & Excerpt */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-base font-medium">
                  Başlık
                </Label>
                <Input
                  id="title"
                  placeholder="Gönderi başlığını girin..."
                  value={post.title}
                  onChange={(e) =>
                    setPost((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="text-lg font-medium"
                />
              </div>
              <div>
                <Label htmlFor="slug" className="text-base font-medium">
                  URL Slug
                </Label>
                <Input
                  id="slug"
                  placeholder="url-slug"
                  value={post.slug}
                  onChange={(e) =>
                    setPost((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="excerpt" className="text-base font-medium">
                  Özet
                </Label>
                <Textarea
                  id="excerpt"
                  placeholder="Kısa bir özet yazın..."
                  value={post.excerpt}
                  onChange={(e) =>
                    setPost((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Content Editor */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">İçerik</Label>
              <TiptapEditor
                content={post.content}
                onChange={(content) =>
                  setPost((prev) => ({ ...prev, content }))
                }
                placeholder="Gönderinizin içeriğini buraya yazın..."
              />
            </div>
          </Card>

          {/* SEO Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-slate-800">
                SEO Ayarları
              </h3>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">SEO İpuçları:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Meta başlık 50-60 karakter arası olmalı</li>
                    <li>• Meta açıklama 150-160 karakter arası olmalı</li>
                    <li>
                      • Ana anahtar kelimeyi başlığa ve açıklamaya dahil edin
                    </li>
                    <li>• Benzersiz ve çekici başlıklar kullanın</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="metaTitle">Meta Başlık</Label>
                  <span className="text-xs text-muted-foreground">
                    {post.metaTitle.length}/60
                  </span>
                </div>
                <Input
                  id="metaTitle"
                  placeholder="SEO için özel başlık (boş bırakılırsa ana başlık kullanılır)"
                  value={post.metaTitle}
                  onChange={(e) =>
                    setPost((prev) => ({ ...prev, metaTitle: e.target.value }))
                  }
                  className={post.metaTitle.length > 60 ? "border-red-300" : ""}
                />
                {post.metaTitle.length > 60 && (
                  <p className="text-xs text-red-600 mt-1">
                    Meta başlık çok uzun (60 karakteri aşıyor)
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="metaDescription">Meta Açıklama</Label>
                  <span className="text-xs text-muted-foreground">
                    {post.metaDescription.length}/160
                  </span>
                </div>
                <Textarea
                  id="metaDescription"
                  placeholder="Arama motorları için açıklama (önemli: bu açıklama Google'da görünür)"
                  value={post.metaDescription}
                  onChange={(e) =>
                    setPost((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  rows={3}
                  className={
                    post.metaDescription.length > 160 ? "border-red-300" : ""
                  }
                />
                {post.metaDescription.length > 160 && (
                  <p className="text-xs text-red-600 mt-1">
                    Meta açıklama çok uzun (160 karakteri aşıyor)
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Publish Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              Yayın Ayarları
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Durum</Label>
                <Select
                  value={post.status}
                  onValueChange={(value) =>
                    setPost((prev) => ({ ...prev, status: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Taslak
                      </div>
                    </SelectItem>
                    <SelectItem value="review">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        İnceleme Bekliyor
                      </div>
                    </SelectItem>
                    <SelectItem value="scheduled">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        Programlı
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Yayında
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Görünürlük</Label>
                <Select
                  value={post.visibility}
                  onValueChange={(value) =>
                    setPost((prev) => ({ ...prev, visibility: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Herkese Açık
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Özel
                      </div>
                    </SelectItem>
                    <SelectItem value="password">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Şifre Korumalı
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {post.visibility === "password" && (
                <div>
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Erişim şifresi"
                    value={post.password}
                    onChange={(e) =>
                      setPost((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                </div>
              )}

              <div>
                <Label htmlFor="publishDate">Yayın Tarihi</Label>
                <Input
                  id="publishDate"
                  type="datetime-local"
                  value={post.publishedAt}
                  onChange={(e) =>
                    setPost((prev) => ({
                      ...prev,
                      publishedAt: e.target.value,
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Öne Çıkan Gönderi</Label>
                  <Switch
                    id="featured"
                    checked={post.isFeatured}
                    onCheckedChange={(checked) =>
                      setPost((prev) => ({ ...prev, isFeatured: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="allowComments">Yorumlara İzin Ver</Label>
                    <p className="text-xs text-muted-foreground">
                      Kullanıcılar yorum yapabilir
                    </p>
                  </div>
                  <Switch
                    id="allowComments"
                    checked={post.allowComments}
                    onCheckedChange={(checked) =>
                      setPost((prev) => ({ ...prev, allowComments: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="allowLikes">Beğenilere İzin Ver</Label>
                    <p className="text-xs text-muted-foreground">
                      Kullanıcılar beğenebilir
                    </p>
                  </div>
                  <Switch
                    id="allowLikes"
                    checked={post.allowLikes}
                    onCheckedChange={(checked) =>
                      setPost((prev) => ({ ...prev, allowLikes: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Type & Category */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              Kategori ve Tür
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Gönderi Türü</Label>
                <Select
                  value={post.postType}
                  onValueChange={(value) =>
                    setPost((prev) => ({ ...prev, postType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowNewTypeDialog(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Yeni Tür Ekle
                </Button>
              </div>

              <div>
                <Label>Kategori</Label>
                <Select
                  value={post.categoryId}
                  onValueChange={(value) =>
                    setPost((prev) => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: category.color || "#3b82f6",
                            }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowNewCategoryDialog(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Yeni Kategori Ekle
                </Button>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Etiketler
              </h3>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-xs text-green-800">
                  <p className="font-medium">SEO İpucu:</p>
                  <p>
                    Etiketler içerik keşfedilebilirliğini artırır ve Google'da
                    daha iyi sıralama sağlar. 3-5 relevant etiket kullanın.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Etiket ekle..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button onClick={handleAddTag} size="sm">
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-1"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    #{tag}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Media */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              Öne Çıkan Görsel
            </h3>

            {/* Allowed domains warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">
                    Desteklenen Görsel Kaynakları:
                  </p>
                  <ul className="space-y-0.5">
                    <li>• lh3.googleusercontent.com (Google)</li>
                    <li>• yhjavwtzhquzsylbunxf.supabase.co (Supabase)</li>
                    <li>• images.unsplash.com (Unsplash)</li>
                  </ul>
                  <p className="mt-1">
                    Diğer kaynaklardan görseller görüntülenmeyebilir.
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <input
              ref={coverImageFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverImageFileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploadingCover ? "Yükleniyor..." : "Dosya Seç"}
                </Button>
              </div>

              {/* URL Input */}
              <div>
                <Label htmlFor="coverImage">Veya Görsel URL Girin</Label>
                <Input
                  id="coverImage"
                  placeholder="https://example.com/image.jpg"
                  value={post.coverImage}
                  onChange={(e) =>
                    setPost((prev) => ({ ...prev, coverImage: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Preview */}
            {post.coverImage && (
              <div className="mt-4">
                <img
                  src={post.coverImage}
                  alt="Öne çıkan görsel"
                  className="w-full h-40 object-cover rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setPost((prev) => ({ ...prev, coverImage: "" }))
                  }
                  className="mt-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Görseli Kaldır
                </Button>
              </div>
            )}
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <div className="space-y-3">
              <Button
                onClick={() => handleSave("draft")}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Taslak Olarak Kaydet
              </Button>
              <Button
                onClick={() => handleSave("review")}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                İnceleme İçin Gönder
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    İptal Et
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Değişiklikleri kaydetmeden çıkmak istediğinizden emin
                      misiniz?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Kaydedilmemiş değişiklikler kaybolacaktır.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Kalmaya Devam Et</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => router.push("/admin/posts")}
                    >
                      Çık
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal />

      {/* New Category Dialog */}
      <Dialog
        open={showNewCategoryDialog}
        onOpenChange={setShowNewCategoryDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kategori Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir kategori oluşturun ve hemen kullanmaya başlayın.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Kategori Adı</Label>
              <Input
                id="categoryName"
                placeholder="Kategori adı girin..."
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="categoryColor">Renk</Label>
              <div className="flex gap-2">
                <Input
                  id="categoryColor"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  className="w-20"
                />
                <Input
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewCategoryDialog(false)}
            >
              İptal
            </Button>
            <Button onClick={handleCreateCategory}>Kategori Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
