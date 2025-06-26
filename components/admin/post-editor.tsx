"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Save,
  Eye,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  FileText,
  Calendar,
  Tag,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface PostEditorProps {
  post?: any;
  mode?: "create" | "edit";
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export function PostEditor({ post, mode = "create" }: PostEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    introduction: "",
    content: "",
    conclusion: "",
    coverImage: "",
    status: "DRAFT",
    categoryId: "",
    isFeatured: false,
    allowComments: true,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
    tags: [] as string[],
  });

  // Filter options
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");

  // Initialize form data
  useEffect(() => {
    if (post && mode === "edit") {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        introduction: post.introduction || "",
        content: post.content || "",
        conclusion: post.conclusion || "",
        coverImage: post.coverImage || "",
        status: post.status || "DRAFT",
        categoryId: post.categoryId || "",
        isFeatured: post.isFeatured || false,
        allowComments: post.allowComments !== false,
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        ogImage: post.ogImage || "",
        tags: post.tags?.map((t: any) => t.tag.name) || [],
      });
    }
  }, [post, mode]);

  // Fetch categories and tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/tags"),
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        }

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setAvailableTags(tagsData.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && mode === "create") {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tagName: string) => {
    if (tagName && !formData.tags.includes(tagName)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagName],
      }));
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagName: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagName),
    }));
  };

  const handleSave = async (publishStatus?: string) => {
    if (!formData.title.trim()) {
      toast.error("Başlık gereklidir");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("İçerik gereklidir");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Kategori seçimi gereklidir");
      return;
    }

    try {
      setIsSaving(true);

      const dataToSave = {
        ...formData,
        status: publishStatus || formData.status,
      };

      const url =
        mode === "edit" ? `/api/admin/posts/${post.id}` : "/api/admin/posts";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(
          mode === "edit"
            ? "Post başarıyla güncellendi"
            : "Post başarıyla oluşturuldu"
        );

        // Redirect to posts page
        router.push("/admin/posts");
      } else {
        throw new Error(result.error || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Kaydetme sırasında hata oluştu"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: "Taslak", variant: "secondary" as const },
      PUBLISHED: { label: "Yayında", variant: "default" as const },
      REVIEW: { label: "İncelemede", variant: "outline" as const },
      SCHEDULED: { label: "Planlanmış", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/posts">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {mode === "edit" ? "Post Düzenle" : "Yeni Post"}
                </h1>
                <p className="text-gray-600">
                  {mode === "edit"
                    ? `"${post?.title}" düzenleniyor`
                    : "Yeni bir blog yazısı oluşturun"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {formData.status && getStatusBadge(formData.status)}

              <Button
                variant="outline"
                onClick={() => handleSave("DRAFT")}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                Taslak Kaydet
              </Button>

              <Button
                onClick={() => handleSave("PUBLISHED")}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Yayınla
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Temel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Çekici bir başlık yazın..."
                    className="mt-2"
                  />
                </div>

                {/* Slug */}
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="url-friendly-slug"
                    className="mt-2"
                  />
                  {formData.slug && (
                    <p className="text-sm text-gray-500 mt-1">
                      URL: /post/{formData.slug}
                    </p>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <Label htmlFor="excerpt">Özet</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      handleInputChange("excerpt", e.target.value)
                    }
                    placeholder="Yazının kısa bir özetini yazın..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>İçerik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Introduction */}
                <div>
                  <Label htmlFor="introduction">Giriş (Opsiyonel)</Label>
                  <Textarea
                    id="introduction"
                    value={formData.introduction}
                    onChange={(e) =>
                      handleInputChange("introduction", e.target.value)
                    }
                    placeholder="Yazının giriş paragrafı..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                {/* Main Content */}
                <div>
                  <Label htmlFor="content">Ana İçerik *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    placeholder="Yazının ana içeriğini buraya yazın..."
                    className="mt-2"
                    rows={20}
                  />
                </div>

                {/* Conclusion */}
                <div>
                  <Label htmlFor="conclusion">Sonuç (Opsiyonel)</Label>
                  <Textarea
                    id="conclusion"
                    value={formData.conclusion}
                    onChange={(e) =>
                      handleInputChange("conclusion", e.target.value)
                    }
                    placeholder="Yazının sonuç paragrafı..."
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  SEO Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="metaTitle">Meta Başlık</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      handleInputChange("metaTitle", e.target.value)
                    }
                    placeholder="SEO için meta başlık..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Açıklama</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleInputChange("metaDescription", e.target.value)
                    }
                    placeholder="SEO için meta açıklama..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input
                    id="ogImage"
                    value={formData.ogImage}
                    onChange={(e) =>
                      handleInputChange("ogImage", e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Yayın Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Taslak</SelectItem>
                      <SelectItem value="PUBLISHED">Yayında</SelectItem>
                      <SelectItem value="REVIEW">İncelemede</SelectItem>
                      <SelectItem value="SCHEDULED">Planlanmış</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      handleInputChange("categoryId", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Öne Çıkar</Label>
                  <Switch
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      handleInputChange("isFeatured", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="comments">Yorumlara İzin Ver</Label>
                  <Switch
                    id="comments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) =>
                      handleInputChange("allowComments", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Kapak Resmi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="coverImage">Resim URL</Label>
                  <Input
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) =>
                      handleInputChange("coverImage", e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
                </div>
                {formData.coverImage && (
                  <div className="mt-4">
                    <img
                      src={formData.coverImage}
                      alt="Kapak resmi önizleme"
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="font-semibold text-sm">#</span>
                  Etiketler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Yeni etiket..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(newTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => handleAddTag(newTag)}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-3 h-3 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {availableTags.length > 0 && (
                  <div>
                    <Label className="text-sm text-gray-600">
                      Mevcut Etiketler:
                    </Label>
                    <ScrollArea className="h-32 mt-2">
                      <div className="flex flex-wrap gap-1">
                        {availableTags
                          .filter((tag) => !formData.tags.includes(tag.name))
                          .map((tag) => (
                            <Button
                              key={tag.id}
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                              onClick={() => handleAddTag(tag.name)}
                            >
                              {tag.name}
                            </Button>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
