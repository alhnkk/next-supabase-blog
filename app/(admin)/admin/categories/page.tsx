"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Tag,
  Eye,
  EyeOff,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    posts: number;
  };
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

const initialFormData: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  color: "#3B82F6",
  icon: "📁",
  isActive: true,
};

const predefinedColors = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#84CC16", // Lime
];

const predefinedIcons = [
  "📁",
  "📝",
  "📚",
  "🎨",
  "💼",
  "🏠",
  "🌟",
  "🎯",
  "💡",
  "🔧",
  "📊",
  "🎭",
  "🎵",
  "🎬",
  "📷",
  "🍔",
  "✈️",
  "🏆",
  "❤️",
  "🌍",
  "🔥",
  "⚡",
  "🎪",
  "🎨",
  "📖",
  "💻",
  "🌸",
  "🎁",
  "🔔",
  "📢",
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<CategoryFormData>>({});

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/categories?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
        setTotalPages(result.meta.totalPages);
        setTotalCount(result.meta.totalCount);
        setStats(result.stats);
      } else {
        throw new Error(result.error || "Kategoriler alınamadı");
      }
    } catch (error) {
      console.error("Categories fetch error:", error);
      toast.error("Kategoriler yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, statusFilter]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Kategori adı gereklidir";
    } else if (formData.name.length < 2) {
      errors.name = "Kategori adı en az 2 karakter olmalıdır";
    } else if (formData.name.length > 100) {
      errors.name = "Kategori adı en fazla 100 karakter olabilir";
    }

    if (!formData.slug.trim()) {
      errors.slug = "Slug gereklidir";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = "Slug sadece küçük harf, rakam ve tire içerebilir";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Açıklama en fazla 500 karakter olabilir";
    }

    if (!formData.color || !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      errors.color = "Geçerli bir hex renk kodu giriniz";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCategory = async () => {
    if (!validateForm()) return;

    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsCreateOpen(false);
        setFormData(initialFormData);
        setFormErrors({});
        fetchCategories();
      } else {
        toast.error(result.error || "Kategori oluşturulamadı");
      }
    } catch (error) {
      console.error("Create category error:", error);
      toast.error("Kategori oluşturulurken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!validateForm() || !editingCategory) return;

    try {
      setIsUpdating(true);
      const response = await fetch(
        `/api/admin/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsEditOpen(false);
        setEditingCategory(null);
        setFormData(initialFormData);
        setFormErrors({});
        fetchCategories();
      } else {
        toast.error(result.error || "Kategori güncellenemedi");
      }
    } catch (error) {
      console.error("Update category error:", error);
      toast.error("Kategori güncellenirken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchCategories();
      } else {
        toast.error(result.error || "Kategori silinemedi");
      }
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error("Kategori silinirken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCategories.length === 0) {
      toast.error("Lütfen işlem yapmak için kategori seçin");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          categoryIds: selectedCategories,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setSelectedCategories([]);
        fetchCategories();
      } else {
        toast.error(result.error || "İşlem başarısız");
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Toplu işlem sırasında hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      color: category.color,
      icon: category.icon || "📁",
      isActive: category.isActive,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleAllCategories = () => {
    setSelectedCategories((prev) =>
      prev.length === categories.length ? [] : categories.map((c) => c.id)
    );
  };

  if (isLoading && categories.length === 0) {
    return <CategoriesPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Kategori Yönetimi</h2>
          <p className="text-muted-foreground">
            Blog kategorilerini oluşturun, düzenleyin ve yönetin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={fetchCategories}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Yenile
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni Kategori
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-sm text-slate-600">Toplam Kategori</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-800">
            {stats.active}
          </div>
          <div className="text-sm text-slate-600">Aktif</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">
            {stats.inactive}
          </div>
          <div className="text-sm text-slate-600">Pasif</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Kategori adı veya açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedCategories.length} kategori seçildi
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategories([])}
              >
                Seçimi Temizle
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("activate")}
                disabled={isUpdating}
              >
                <Eye className="w-4 h-4 mr-1" />
                Aktif Et
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("deactivate")}
                disabled={isUpdating}
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Pasif Et
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isUpdating}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Kategorileri Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                      {selectedCategories.length} kategoriyi silmek
                      istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleBulkAction("delete")}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      )}

      {/* Categories List */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex items-center gap-3 pb-3 border-b">
            <Checkbox
              checked={
                selectedCategories.length === categories.length &&
                categories.length > 0
              }
              onCheckedChange={toggleAllCategories}
            />
            <span className="text-sm font-medium text-muted-foreground">
              Tümünü Seç
            </span>
          </div>

          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="border border-slate-200/60 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-3" />
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto text-muted-foreground mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold">#</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Kategori bulunamadı
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Filtrelerinizi ayarlayarak daha fazla sonuç görebilirsiniz."
                  : "İlk kategorinizi oluşturmaya başlayın."}
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kategori
              </Button>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="border border-slate-200/60 rounded-lg p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() =>
                          toggleCategorySelection(category.id)
                        }
                      />
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">
                            {category.icon || "📁"}
                          </span>
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <h3 className="font-semibold text-slate-800 truncate">
                          {category.name}
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: `${category.color}20`,
                          borderColor: category.color,
                          color: category.color,
                        }}
                      >
                        {category.slug}
                      </Badge>
                      <Badge
                        className={
                          category.isActive
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-800 border-slate-200"
                        }
                      >
                        {category.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>

                    {category.description && (
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">#</span>
                        <span>{category._count.posts} post</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>
                          {new Date(category.createdAt).toLocaleDateString(
                            "tr-TR"
                          )}
                        </span>
                      </div>
                      {category.updatedAt !== category.createdAt && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">
                            Güncellendi:{" "}
                            {new Date(category.updatedAt).toLocaleDateString(
                              "tr-TR"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openEditModal(category)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleBulkAction(
                            category.isActive ? "deactivate" : "activate"
                          )
                        }
                        disabled={isUpdating}
                      >
                        {category.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Pasif Et
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Aktif Et
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{category.name}" kategorisini silmek
                              istediğinizden emin misiniz?
                              {category._count.posts > 0 && (
                                <span className="block mt-2 text-amber-600">
                                  Bu kategori {category._count.posts} post'ta
                                  kullanılıyor.
                                </span>
                              )}
                              Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Önceki
          </Button>
          <span className="text-sm text-muted-foreground">
            Sayfa {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || isLoading}
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Kategori Oluştur</DialogTitle>
            <DialogDescription>
              Blog için yeni bir kategori oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Kategori Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name,
                    slug: generateSlug(name),
                  }));
                }}
                placeholder="Kategori adı"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="kategori-slug"
                className={formErrors.slug ? "border-red-500" : ""}
              />
              {formErrors.slug && (
                <p className="text-sm text-red-500 mt-1">{formErrors.slug}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Kategori açıklaması (opsiyonel)"
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="icon">İkon</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-12 h-10 border border-slate-300 rounded bg-slate-50">
                  <span className="text-lg">{formData.icon}</span>
                </div>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="📁"
                  className="flex-1"
                />
              </div>
              <div className="grid grid-cols-10 gap-1 mt-2">
                {predefinedIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded border transition-colors"
                    onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="color">Renk</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-10 rounded border border-slate-300"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  placeholder="#3B82F6"
                  className={cn(
                    "flex-1",
                    formErrors.color ? "border-red-500" : ""
                  )}
                />
              </div>
              <div className="flex gap-2 mt-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
              {formErrors.color && (
                <p className="text-sm text-red-500 mt-1">{formErrors.color}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateCategory} disabled={isUpdating}>
              {isUpdating ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kategoriyi Düzenle</DialogTitle>
            <DialogDescription>
              Kategori bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Kategori Adı</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name,
                    slug: generateSlug(name),
                  }));
                }}
                placeholder="Kategori adı"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="kategori-slug"
                className={formErrors.slug ? "border-red-500" : ""}
              />
              {formErrors.slug && (
                <p className="text-sm text-red-500 mt-1">{formErrors.slug}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Kategori açıklaması (opsiyonel)"
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-icon">İkon</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-12 h-10 border border-slate-300 rounded bg-slate-50">
                  <span className="text-lg">{formData.icon}</span>
                </div>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="📁"
                  className="flex-1"
                />
              </div>
              <div className="grid grid-cols-10 gap-1 mt-2">
                {predefinedIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded border transition-colors"
                    onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-color">Renk</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-10 rounded border border-slate-300"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  placeholder="#3B82F6"
                  className={cn(
                    "flex-1",
                    formErrors.color ? "border-red-500" : ""
                  )}
                />
              </div>
              <div className="flex gap-2 mt-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
              {formErrors.color && (
                <p className="text-sm text-red-500 mt-1">{formErrors.color}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="edit-isActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdateCategory} disabled={isUpdating}>
              {isUpdating ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Skeleton component for loading state
function CategoriesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4 text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
      </Card>
    </div>
  );
}
