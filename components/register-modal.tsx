"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Globe,
  Apple,
  AlertCircle,
  Camera,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export function RegisterModal({
  open,
  onOpenChange,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Profil resmi 5MB'dan küçük olmalıdır");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Lütfen geçerli bir resim dosyası seçin");
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl = "";

      // Upload profile image if selected
      if (profileImage) {
        const formData = new FormData();
        formData.append("file", profileImage);
        formData.append("bucket", "images");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        }
      }

      const result = await authClient.signUp.email({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        image: imageUrl,
      });

      if (result.error) {
        setError(result.error.message || "Kayıt başarısız");
      } else {
        onOpenChange(false);
        window.location.reload();
      }
    } catch (err) {
      setError("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setError("");

    try {
      await authClient.signIn.social({ provider });
    } catch (err) {
      setError("Sosyal medya girişi başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md w-full p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
        overlayVariant="blur"
      >
        <div className="p-6">
          {/* Header */}
          <DialogHeader className="text-center space-y-4 mb-6">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-full aspect-square object-cover border p-1 mx-auto border-b-blue-200"
            />
            <DialogTitle className="text-2xl font-bold">Kayıt Ol</DialogTitle>
            <p className="text-gray-600 text-sm">
              Hesap oluşturun ve topluluğumuza katılın.
            </p>
          </DialogHeader>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-gray-300"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
            >
              <Globe className="w-5 h-5 mr-2" />
              Google ile Kayıt Ol
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-gray-300"
              disabled
            >
              <Apple className="w-5 h-5 mr-2" />
              Apple ile Kayıt Ol
              <span className="ml-2 text-xs text-gray-400">(Yakında)</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">veya</span>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Profil Resmi (İsteğe Bağlı)
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {profileImagePreview ? (
                      <Image
                        src={profileImagePreview}
                        alt="Profil resmi önizleme"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  {profileImagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileImage(null);
                        setProfileImagePreview(null);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-image-upload"
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="profile-image-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Resim Seç
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG veya GIF. Maksimum 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Ad Soyad
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Adınız ve soyadınız"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, name: e.target.value })
                  }
                  className="h-11 pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  className="h-11 pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="En az 6 karakter"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  className="h-11 pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Şifre Tekrar
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="h-11 pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kayıt Olunuyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-amber-700 hover:text-amber-800 font-semibold hover:underline transition-colors"
              >
                Giriş Yap
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
