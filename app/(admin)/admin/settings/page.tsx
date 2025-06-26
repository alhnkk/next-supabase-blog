"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Globe,
  Mail,
  Search,
  Database,
  Save,
  RefreshCw,
  Palette,
  Image,
  Users,
  MessageSquare,
  AlertTriangle,
  Upload,
  X,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useSiteSettingsStore } from "@/lib/stores/site-settings-store";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  siteLogo: string;
  adminEmail: string;
  defaultCategory: string;
  postsPerPage: number;
  enableComments: boolean;
  enableRegistration: boolean;
  maintenanceMode: boolean;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    github: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage: string;
  };
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  appearanceSettings?: {
    primaryColor: string;
    accentColor: string;
    enableDarkMode: boolean;
  };
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Site settings store
  const { updateSettings } = useSiteSettingsStore();

  // Logo upload
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading: isUploadingLogo, uploadImage } = useImageUpload();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/settings");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Ensure appearanceSettings exists
        const settingsWithDefaults = {
          ...result.data,
          appearanceSettings: result.data.appearanceSettings || {
            primaryColor: "#1e293b",
            accentColor: "#f59e0b",
            enableDarkMode: false,
          },
        };
        setSettings(settingsWithDefaults);
      } else {
        throw new Error(result.error || "Ayarlar alınamadı");
      }
    } catch (error) {
      console.error("Settings fetch error:", error);
      toast.error("Sistem ayarları yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?limit=100");
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error("Categories fetch error:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  const handleSettingChange = (section: string, field: string, value: any) => {
    if (!settings) return;

    setSettings((prev) => {
      if (!prev) return prev;

      if (section === "root") {
        return { ...prev, [field]: value };
      } else {
        const sectionData = prev[section as keyof SystemSettings];
        return {
          ...prev,
          [section]: {
            ...(typeof sectionData === "object" && sectionData !== null
              ? sectionData
              : {}),
            [field]: value,
          },
        };
      }
    });
    setHasChanges(true);
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImage(file, "logos");
      if (uploadedUrl) {
        handleSettingChange("root", "siteLogo", uploadedUrl);
        toast.success("Logo başarıyla yüklendi");
      }
    } catch (error) {
      console.error("Logo upload failed:", error);
      toast.error("Logo yüklenirken hata oluştu");
    } finally {
      // Reset file input
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };

  const handleSaveSettings = async () => {
    if (!settings || !hasChanges) return;

    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setSettings(result.data);
        setHasChanges(false);

        // Update site settings store
        updateSettings({
          siteName: result.data.siteName,
          siteDescription: result.data.siteDescription,
          siteUrl: result.data.siteUrl,
          siteLogo: result.data.siteLogo,
          adminEmail: result.data.adminEmail,
          primaryColor: result.data.appearanceSettings?.primaryColor,
          accentColor: result.data.appearanceSettings?.accentColor,
          enableDarkMode: result.data.appearanceSettings?.enableDarkMode,
        });
      } else {
        toast.error(result.error || "Ayarlar kaydedilemedi");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error("Ayarlar kaydedilirken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSpecialAction = async (action: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        if (action === "reset-to-defaults") {
          fetchSettings(); // Reload settings after reset
        }
      } else {
        toast.error(result.error || "İşlem başarısız");
      }
    } catch (error) {
      console.error("Special action error:", error);
      toast.error("İşlem gerçekleştirilirken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ayarlar yüklenemedi</h3>
          <p className="text-muted-foreground mb-4">
            Sistem ayarları yüklenirken bir hata oluştu.
          </p>
          <Button onClick={fetchSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Sistem Ayarları
          </h2>
          <p className="text-muted-foreground">
            Blog platformunuzun genel ayarlarını yönetin
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-600"
            >
              Kaydedilmemiş değişiklikler
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={fetchSettings}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Yenile
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isUpdating}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isUpdating ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            Genel
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Görünüm
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Users className="w-4 h-4" />
            Özellikler
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Sosyal
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            E-posta
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Database className="w-4 h-4" />
            Gelişmiş
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Bilgileri</CardTitle>
              <CardDescription>
                Sitenizin temel bilgilerini ayarlayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Adı</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) =>
                      handleSettingChange("root", "siteName", e.target.value)
                    }
                    placeholder="Site adınız"
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL'si</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) =>
                      handleSettingChange("root", "siteUrl", e.target.value)
                    }
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Açıklaması</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) =>
                    handleSettingChange(
                      "root",
                      "siteDescription",
                      e.target.value
                    )
                  }
                  placeholder="Sitenizin kısa açıklaması"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminEmail">Admin E-posta</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) =>
                      handleSettingChange("root", "adminEmail", e.target.value)
                    }
                    placeholder="admin@yoursite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="postsPerPage">Sayfa Başına Post Sayısı</Label>
                  <Input
                    id="postsPerPage"
                    type="number"
                    min="1"
                    max="50"
                    value={settings.postsPerPage}
                    onChange={(e) =>
                      handleSettingChange(
                        "root",
                        "postsPerPage",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="defaultCategory">Varsayılan Kategori</Label>
                <Select
                  value={settings.defaultCategory || "none"}
                  onValueChange={(value) =>
                    handleSettingChange(
                      "root",
                      "defaultCategory",
                      value === "none" ? "" : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seçim yok</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Site Logosu</CardTitle>
              <CardDescription>
                Sitenizin logosunu yükleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div className="flex items-center gap-4">
                {/* Logo Preview */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    {settings.siteLogo ? (
                      <img
                        src={settings.siteLogo}
                        alt="Site logosu"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <Image className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Upload Actions */}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoFileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploadingLogo ? "Yükleniyor..." : "Logo Yükle"}
                    </Button>
                    {settings.siteLogo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleSettingChange("root", "siteLogo", "")
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* URL Input */}
                  <div>
                    <Label htmlFor="siteLogo" className="text-sm">
                      Veya Logo URL Girin
                    </Label>
                    <Input
                      id="siteLogo"
                      value={settings.siteLogo}
                      onChange={(e) =>
                        handleSettingChange("root", "siteLogo", e.target.value)
                      }
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                PNG, JPG veya SVG formatında, maksimum 2MB. En iyi sonuç için
                200x200px boyutunda kare logo kullanın.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Renk Teması</CardTitle>
              <CardDescription>
                Sitenizin renk şemasını özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primaryColor">Ana Renk</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      id="primaryColor"
                      value={
                        settings.appearanceSettings?.primaryColor || "#1e293b"
                      }
                      onChange={(e) =>
                        handleSettingChange(
                          "appearanceSettings",
                          "primaryColor",
                          e.target.value
                        )
                      }
                      className="w-12 h-10 rounded border border-slate-300"
                    />
                    <Input
                      value={
                        settings.appearanceSettings?.primaryColor || "#1e293b"
                      }
                      onChange={(e) =>
                        handleSettingChange(
                          "appearanceSettings",
                          "primaryColor",
                          e.target.value
                        )
                      }
                      placeholder="#1e293b"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Vurgu Rengi</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      id="accentColor"
                      value={
                        settings.appearanceSettings?.accentColor || "#f59e0b"
                      }
                      onChange={(e) =>
                        handleSettingChange(
                          "appearanceSettings",
                          "accentColor",
                          e.target.value
                        )
                      }
                      className="w-12 h-10 rounded border border-slate-300"
                    />
                    <Input
                      value={
                        settings.appearanceSettings?.accentColor || "#f59e0b"
                      }
                      onChange={(e) =>
                        handleSettingChange(
                          "appearanceSettings",
                          "accentColor",
                          e.target.value
                        )
                      }
                      placeholder="#f59e0b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Karanlık Mod</h4>
                  <p className="text-sm text-muted-foreground">
                    Varsayılan olarak karanlık temayı etkinleştir
                  </p>
                </div>
                <Switch
                  checked={settings.appearanceSettings?.enableDarkMode || false}
                  onCheckedChange={(checked) =>
                    handleSettingChange(
                      "appearanceSettings",
                      "enableDarkMode",
                      checked
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tema Önizleme</CardTitle>
              <CardDescription>
                Renk değişikliklerinizi önizleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="p-6 rounded-lg border-2 border-dashed"
                style={{
                  backgroundColor: settings.appearanceSettings?.enableDarkMode
                    ? settings.appearanceSettings.primaryColor
                    : "#ffffff",
                  borderColor: settings.appearanceSettings?.accentColor,
                  color: settings.appearanceSettings?.enableDarkMode
                    ? "#ffffff"
                    : "#000000",
                }}
              >
                <h3 className="text-xl font-bold mb-2">
                  {settings.siteName} Önizleme
                </h3>
                <p className="mb-4">{settings.siteDescription}</p>
                <div className="flex gap-2">
                  <div
                    className="px-4 py-2 rounded text-white font-medium"
                    style={{
                      backgroundColor: settings.appearanceSettings?.accentColor,
                    }}
                  >
                    Ana Buton
                  </div>
                  <div
                    className="px-4 py-2 rounded border"
                    style={{
                      borderColor: settings.appearanceSettings?.accentColor,
                      color: settings.appearanceSettings?.accentColor,
                    }}
                  >
                    İkincil Buton
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Özellik Ayarları</CardTitle>
              <CardDescription>
                Platform özelliklerini açın veya kapatın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Yorumlar
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcıların post'lara yorum yapabilmesini sağlar
                  </p>
                </div>
                <Switch
                  checked={settings.enableComments}
                  onCheckedChange={(checked) =>
                    handleSettingChange("root", "enableComments", checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Kayıt Olma
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yeni kullanıcıların siteye kayıt olabilmesini sağlar
                  </p>
                </div>
                <Switch
                  checked={settings.enableRegistration}
                  onCheckedChange={(checked) =>
                    handleSettingChange("root", "enableRegistration", checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Bakım Modu
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Siteyi geçici olarak bakım moduna alır
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    handleSettingChange("root", "maintenanceMode", checked)
                  }
                />
              </div>
              {settings.maintenanceMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <p className="font-medium mb-1">Bakım Modu Aktif!</p>
                      <p>
                        Site ziyaretçilere bakım sayfası gösterilecek. Sadece
                        admin kullanıcılar siteye erişebilir.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Ayarları</CardTitle>
              <CardDescription>
                Arama motoru optimizasyonu ayarlarını yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  value={settings.seoSettings.metaTitle}
                  onChange={(e) =>
                    handleSettingChange(
                      "seoSettings",
                      "metaTitle",
                      e.target.value
                    )
                  }
                  placeholder="Site başlığı"
                  maxLength={60}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {settings.seoSettings.metaTitle.length}/60 karakter
                </p>
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seoSettings.metaDescription}
                  onChange={(e) =>
                    handleSettingChange(
                      "seoSettings",
                      "metaDescription",
                      e.target.value
                    )
                  }
                  placeholder="Site açıklaması"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {settings.seoSettings.metaDescription.length}/160 karakter
                </p>
              </div>
              <div>
                <Label htmlFor="metaKeywords">Anahtar Kelimeler</Label>
                <Input
                  id="metaKeywords"
                  value={settings.seoSettings.metaKeywords}
                  onChange={(e) =>
                    handleSettingChange(
                      "seoSettings",
                      "metaKeywords",
                      e.target.value
                    )
                  }
                  placeholder="anahtar, kelimeler, virgülle, ayrılmış"
                />
              </div>
              <div>
                <Label htmlFor="ogImage">Open Graph Resmi</Label>
                <Input
                  id="ogImage"
                  value={settings.seoSettings.ogImage}
                  onChange={(e) =>
                    handleSettingChange(
                      "seoSettings",
                      "ogImage",
                      e.target.value
                    )
                  }
                  placeholder="https://yoursite.com/og-image.jpg"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Sosyal medyada paylaşıldığında görünecek resim
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sosyal Medya Bağlantıları</CardTitle>
              <CardDescription>
                Sosyal medya hesaplarınızın bağlantılarını ekleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={settings.socialLinks.twitter}
                    onChange={(e) =>
                      handleSettingChange(
                        "socialLinks",
                        "twitter",
                        e.target.value
                      )
                    }
                    placeholder="https://twitter.com/yoursite"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.socialLinks.facebook}
                    onChange={(e) =>
                      handleSettingChange(
                        "socialLinks",
                        "facebook",
                        e.target.value
                      )
                    }
                    placeholder="https://facebook.com/yoursite"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.socialLinks.instagram}
                    onChange={(e) =>
                      handleSettingChange(
                        "socialLinks",
                        "instagram",
                        e.target.value
                      )
                    }
                    placeholder="https://instagram.com/yoursite"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={settings.socialLinks.linkedin}
                    onChange={(e) =>
                      handleSettingChange(
                        "socialLinks",
                        "linkedin",
                        e.target.value
                      )
                    }
                    placeholder="https://linkedin.com/company/yoursite"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={settings.socialLinks.github}
                    onChange={(e) =>
                      handleSettingChange(
                        "socialLinks",
                        "github",
                        e.target.value
                      )
                    }
                    placeholder="https://github.com/yoursite"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>E-posta Ayarları</CardTitle>
              <CardDescription>
                SMTP e-posta gönderimi ayarlarını yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Sunucu</Label>
                  <Input
                    id="smtpHost"
                    value={settings.emailSettings.smtpHost}
                    onChange={(e) =>
                      handleSettingChange(
                        "emailSettings",
                        "smtpHost",
                        e.target.value
                      )
                    }
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.emailSettings.smtpPort}
                    onChange={(e) =>
                      handleSettingChange(
                        "emailSettings",
                        "smtpPort",
                        parseInt(e.target.value)
                      )
                    }
                    placeholder="587"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpUser">SMTP Kullanıcı Adı</Label>
                  <Input
                    id="smtpUser"
                    value={settings.emailSettings.smtpUser}
                    onChange={(e) =>
                      handleSettingChange(
                        "emailSettings",
                        "smtpUser",
                        e.target.value
                      )
                    }
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Şifre</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.emailSettings.smtpPassword}
                    onChange={(e) =>
                      handleSettingChange(
                        "emailSettings",
                        "smtpPassword",
                        e.target.value
                      )
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">Gönderen E-posta</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.emailSettings.fromEmail}
                    onChange={(e) =>
                      handleSettingChange(
                        "emailSettings",
                        "fromEmail",
                        e.target.value
                      )
                    }
                    placeholder="noreply@yoursite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">Gönderen Adı</Label>
                  <Input
                    id="fromName"
                    value={settings.emailSettings.fromName}
                    onChange={(e) =>
                      handleSettingChange(
                        "emailSettings",
                        "fromName",
                        e.target.value
                      )
                    }
                    placeholder="Your Site Name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistem İşlemleri</CardTitle>
              <CardDescription>
                Gelişmiş sistem yönetimi işlemleri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleSpecialAction("clear-cache")}
                  disabled={isUpdating}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <RefreshCw className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">Cache Temizle</div>
                    <div className="text-xs text-muted-foreground">
                      Sistem cache'ini temizle
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSpecialAction("backup-database")}
                  disabled={isUpdating}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Database className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">Yedek Al</div>
                    <div className="text-xs text-muted-foreground">
                      Veritabanı yedeği oluştur
                    </div>
                  </div>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={isUpdating}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Trash2 className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Sıfırla</div>
                        <div className="text-xs text-muted-foreground">
                          Varsayılan ayarlara dön
                        </div>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ayarları Sıfırla</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tüm sistem ayarlarını varsayılan değerlere sıfırlamak
                        istediğinizden emin misiniz? Bu işlem geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleSpecialAction("reset-to-defaults")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Sıfırla
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistem Bilgileri</CardTitle>
              <CardDescription>
                Platform ve sistem durumu bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Son Güncelleme:</span>
                  <br />
                  <span className="text-muted-foreground">
                    {new Date(settings.updatedAt).toLocaleString("tr-TR")}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Platform:</span>
                  <br />
                  <span className="text-muted-foreground">
                    Next.js + Supabase
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Skeleton component for loading state
function SettingsPageSkeleton() {
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

      <Skeleton className="h-12 w-full" />

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
