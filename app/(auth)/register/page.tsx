"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth-card";
import { Loader2, User, Mail, Lock, Camera, Upload } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Profil resmi 5MB'dan küçük olmalıdır");
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith("image/")) {
        setError("Lütfen geçerli bir resim dosyası seçin");
        return;
      }

      setProfileImage(file);

      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(""); // Hata varsa temizle
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setIsLoading(false);
      return;
    }

    try {
      let profileImageUrl = null;

      // Profil resmi varsa önce upload et
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
          profileImageUrl = uploadResult.url;
        } else {
          setError("Profil resmi yüklenirken hata oluştu");
          setIsLoading(false);
          return;
        }
      }

      const result = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        image: profileImageUrl, // Profil resmini ekle
      });

      if (result.error) {
        setError(result.error.message || "Kayıt başarısız");
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      setError("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Kayıt Ol"
      description="Kayıt olmak için lütfen bilgilerinizi girin."
      error={error}
      isLoading={isLoading}
      footerText="Zaten hesabın var mı?"
      footerLinkText="Giriş Yap"
      footerLinkHref="/login"
    >
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Profil Resmi Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Profil Resmi (İsteğe Bağlı)
          </Label>
        </div>

        <div className="flex items-center gap-4">
          {/* Profil Resmi Preview */}
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
          </div>

          {/* Upload Button ve Açıklama */}
          <div className="flex-1 space-y-2">
            <div className="relative">
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 text-sm h-10"
                disabled={isLoading}
              >
                <Upload className="w-4 h-4" />
                {profileImagePreview ? "Resmi Değiştir" : "Resim Seç"}
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              JPG, PNG veya GIF formatında, maksimum 5MB
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Ad Soyad
          </Label>
          <div className="relative">
            <User className="input-icon" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Adınız ve soyadınız"
              value={formData.name}
              onChange={handleChange}
              className="h-11 input-with-icon"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            E-posta
          </Label>
          <div className="relative">
            <Mail className="input-icon" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ornek@email.com"
              value={formData.email}
              onChange={handleChange}
              className="h-11 input-with-icon"
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
            <Lock className="input-icon" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="En az 6 karakter"
              value={formData.password}
              onChange={handleChange}
              className="h-11 input-with-icon"
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
            <Lock className="input-icon" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Şifrenizi tekrar girin"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-11 input-with-icon"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11"
          variant={isLoading ? "outline" : "default"}
          disabled={isLoading}
        >
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
    </AuthCard>
  );
}
