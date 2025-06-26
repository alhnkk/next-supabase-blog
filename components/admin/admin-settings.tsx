"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  Settings,
  Globe,
  Shield,
  Bell,
  Mail,
  Database,
  Palette,
  Save,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  Server,
  HardDrive,
  Wifi,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSettingsProps {
  className?: string;
}

export function AdminSettings({ className }: AdminSettingsProps) {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Journalize",
    siteDescription:
      "Türk Edebiyatı ve Kültür Platformu - Yazarlar, okuyucular ve araştırmacılar için kapsamlı bir dijital platform",
    siteUrl: "https://journalize.com.tr",
    adminEmail: "admin@journalize.com.tr",
    language: "tr",
    timezone: "Europe/Istanbul",

    // Features
    allowComments: true,
    allowRegistration: false, // Sadece davetiye ile kayıt
    moderateComments: true,
    enableNewsletter: true,
    enableAnalytics: true,
    enableSEO: true,
    enableSitemap: true,
    enableRSS: true,

    // Security
    enableTwoFactor: true,
    forceHttps: true,
    enableCaptcha: true,
    maxLoginAttempts: 3, // Daha güvenli
    passwordMinLength: 12, // Güçlü şifre
    sessionTimeout: 120, // 2 saat (daha güvenli)

    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "noreply@journalize.com.tr",
    smtpPassword: "••••••••••••••••",
    enableEmailNotifications: true,

    // Theme Settings
    primaryColor: "#1e293b", // Slate-800 (daha profesyonel)
    accentColor: "#f59e0b", // Amber-500
    darkMode: false, // Varsayılan olarak açık tema
    customCSS:
      "/* Özel stil tanımlamaları için kullanılır */\n.journalize-brand {\n  font-family: 'Playfair Display', serif;\n}",

    // Content Settings
    postsPerPage: 12,
    excerptLength: 160, // SEO dostu uzunluk
    enableTagging: true,
    enableCategories: true,
    autoSaveInterval: 60, // 1 dakika
    maxUploadSize: 5, // 5 MB (güvenlik)

    // Cache Settings
    enableCaching: true,
    cacheExpiration: 7200, // 2 saat
    enableCompression: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    // Show success toast
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      ...settings,
      // Reset logic here
    });
  };

  const systemStats = {
    diskUsage: 42,
    memoryUsage: 28,
    cpuUsage: 15,
    activeUsers: 234,
    totalPosts: 1247,
    totalComments: 3892,
    uptime: "127 gün, 14 saat",
    version: "2.1.3",
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-800">
            Sistem Ayarları
          </h2>
          <p className="text-slate-600">
            Platform yapılandırması ve yönetim ayarları
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sıfırla
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-heading text-slate-800">
            Sistem Durumu
          </h3>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            Tüm Sistemler Çalışıyor
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {systemStats.diskUsage}%
            </div>
            <div className="text-xs text-slate-600">Disk Kullanımı</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mx-auto mb-2">
              <Server className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-800">
              {systemStats.memoryUsage}%
            </div>
            <div className="text-xs text-slate-600">Bellek Kullanımı</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
              <Wifi className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-800">
              {systemStats.cpuUsage}%
            </div>
            <div className="text-xs text-slate-600">İşlemci Kullanımı</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-2">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-800">
              {systemStats.uptime}
            </div>
            <div className="text-xs text-slate-600">Çalışma Süresi</div>
          </div>
        </div>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-slate-100/60 border border-slate-200">
          <TabsTrigger
            value="general"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Globe className="w-4 h-4" />
            Genel
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Shield className="w-4 h-4" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Mail className="w-4 h-4" />
            E-posta
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="w-4 h-4" />
            İçerik
          </TabsTrigger>
          <TabsTrigger
            value="theme"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Palette className="w-4 h-4" />
            Tema
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Database className="w-4 h-4" />
            Sistem
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              Site Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Adı</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="siteUrl">Site URL'si</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, siteUrl: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="siteDescription">Site Açıklaması</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteDescription: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="language">Dil</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    setSettings({ ...settings, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Zaman Dilimi</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Istanbul">
                      Istanbul (UTC+3)
                    </SelectItem>
                    <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                    <SelectItem value="America/New_York">
                      New York (UTC-5)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              Özellikler
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowComments">Yorum İzni</Label>
                  <p className="text-sm text-slate-600">
                    Gönderilerde yorum yapılmasına izin ver
                  </p>
                </div>
                <Switch
                  id="allowComments"
                  checked={settings.allowComments}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, allowComments: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowRegistration">Kayıt İzni</Label>
                  <p className="text-sm text-slate-600">
                    Yeni kullanıcı kayıtlarına izin ver
                  </p>
                </div>
                <Switch
                  id="allowRegistration"
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, allowRegistration: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="moderateComments">Yorum Moderasyonu</Label>
                  <p className="text-sm text-slate-600">
                    Yeni yorumlar için onay gerektirir
                  </p>
                </div>
                <Switch
                  id="moderateComments"
                  checked={settings.moderateComments}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, moderateComments: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableNewsletter">Bülten</Label>
                  <p className="text-sm text-slate-600">
                    Bülten aboneliklerini aktifleştir
                  </p>
                </div>
                <Switch
                  id="enableNewsletter"
                  checked={settings.enableNewsletter}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, enableNewsletter: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableAnalytics">Analitik</Label>
                  <p className="text-sm text-slate-600">
                    Analitik takibini aktifleştir
                  </p>
                </div>
                <Switch
                  id="enableAnalytics"
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, enableAnalytics: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              Kimlik Doğrulama ve Güvenlik
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableTwoFactor">
                    İki Faktörlü Kimlik Doğrulama
                  </Label>
                  <p className="text-sm text-slate-600">
                    Yönetici hesapları için 2FA zorunlu kıl
                  </p>
                </div>
                <Switch
                  id="enableTwoFactor"
                  checked={settings.enableTwoFactor}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, enableTwoFactor: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="forceHttps">HTTPS Zorunluluğu</Label>
                  <p className="text-sm text-slate-600">
                    Tüm trafiği HTTPS'e yönlendir
                  </p>
                </div>
                <Switch
                  id="forceHttps"
                  checked={settings.forceHttps}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, forceHttps: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCaptcha">CAPTCHA Koruması</Label>
                  <p className="text-sm text-slate-600">
                    Formlar için CAPTCHA'yı aktifleştir
                  </p>
                </div>
                <Switch
                  id="enableCaptcha"
                  checked={settings.enableCaptcha}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, enableCaptcha: checked })
                  }
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxLoginAttempts">
                  Maksimum Giriş Denemesi
                </Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxLoginAttempts: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="passwordMinLength">Min Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      passwordMinLength: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sessionTimeout: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold mb-4 text-red-800">
              Tehlike Bölgesi
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-800">Reset All Settings</Label>
                  <p className="text-sm text-red-600">
                    Reset all settings to factory defaults
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Reset Settings
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        reset all settings to their default values.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReset}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Reset All Settings
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">SMTP Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpHost: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      smtpPort: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpUsername: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <div className="relative">
                  <Input
                    id="smtpPassword"
                    type={showPassword ? "text" : "password"}
                    value={settings.smtpPassword}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpPassword: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableEmailNotifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for events
                  </p>
                </div>
                <Switch
                  id="enableEmailNotifications"
                  checked={settings.enableEmailNotifications}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({
                      ...settings,
                      enableEmailNotifications: checked,
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Send Test Email
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Content Settings */}
        <TabsContent value="content" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="postsPerPage">Posts Per Page</Label>
                <Input
                  id="postsPerPage"
                  type="number"
                  value={settings.postsPerPage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      postsPerPage: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="excerptLength">Excerpt Length</Label>
                <Input
                  id="excerptLength"
                  type="number"
                  value={settings.excerptLength}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      excerptLength: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="autoSaveInterval">
                  Auto-save Interval (seconds)
                </Label>
                <Input
                  id="autoSaveInterval"
                  type="number"
                  value={settings.autoSaveInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoSaveInterval: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                <Input
                  id="maxUploadSize"
                  type="number"
                  value={settings.maxUploadSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxUploadSize: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableTagging">Enable Tagging</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow posts to have tags
                  </p>
                </div>
                <Switch
                  id="enableTagging"
                  checked={settings.enableTagging}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, enableTagging: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCategories">Enable Categories</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow posts to be categorized
                  </p>
                </div>
                <Switch
                  id="enableCategories"
                  checked={settings.enableCategories}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, enableCategories: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    value={settings.accentColor}
                    onChange={(e) =>
                      setSettings({ ...settings, accentColor: e.target.value })
                    }
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: settings.accentColor }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark theme by default
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, darkMode: checked })
                  }
                />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="customCSS">Custom CSS</Label>
              <Textarea
                id="customCSS"
                value={settings.customCSS}
                onChange={(e) =>
                  setSettings({ ...settings, customCSS: e.target.value })
                }
                placeholder="/* Add your custom CSS here */"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Performance & Caching
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCaching">Enable Caching</Label>
                  <p className="text-sm text-muted-foreground">
                    Cache content for better performance
                  </p>
                </div>
                <Switch
                  id="enableCaching"
                  checked={settings.enableCaching}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, enableCaching: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCompression">Enable Compression</Label>
                  <p className="text-sm text-muted-foreground">
                    Compress responses for faster loading
                  </p>
                </div>
                <Switch
                  id="enableCompression"
                  checked={settings.enableCompression}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, enableCompression: checked })
                  }
                />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="cacheExpiration">
                Cache Expiration (seconds)
              </Label>
              <Input
                id="cacheExpiration"
                type="number"
                value={settings.cacheExpiration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cacheExpiration: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download all site data as backup
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Import Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Import data from backup file
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
