import { useState } from "react";
import { uploadImageToSupabase } from "@/lib/services/api";
import { toast } from "sonner";

interface UseImageUploadReturn {
  isUploading: boolean;
  uploadImage: (file: File, folder?: string) => Promise<string | null>;
  uploadImages: (files: File[], folder?: string) => Promise<string[]>;
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (
    file: File,
    folder: string = "posts"
  ): Promise<string | null> => {
    // Dosya boyutu kontrolü (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Dosya boyutu 5MB'dan büyük olamaz");
      return null;
    }

    // Dosya tipi kontrolü
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Sadece JPG, PNG ve WebP formatları desteklenmektedir");
      return null;
    }

    setIsUploading(true);
    try {
      const url = await uploadImageToSupabase(file, folder);
      toast.success("Görsel başarıyla yüklendi");
      return url;
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Görsel yüklenirken bir hata oluştu");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImages = async (
    files: File[],
    folder: string = "posts"
  ): Promise<string[]> => {
    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (const file of files) {
        const url = await uploadImage(file, folder);
        if (url) {
          urls.push(url);
        }
      }
      return urls;
    } catch (error) {
      console.error("Multiple images upload error:", error);
      toast.error("Görseller yüklenirken bir hata oluştu");
      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadImage,
    uploadImages,
  };
}
