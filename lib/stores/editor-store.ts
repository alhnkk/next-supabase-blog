import { create, StoreApi } from "zustand";
import { devtools } from "zustand/middleware";
import { Post, PostType } from "../store-utils";
import { useAuthStore } from "./auth-store";
import { useUIStore } from "./ui-store";
import {
  calculateWordCount,
  calculateTotalReadingTime,
} from "@/lib/utils/reading-time";
// import { useBlogStore } from './blog-store' // Post kaydetme/güncelleme için

// Loading state interface
interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Create loading slice
const createLoadingSlice =
  <T extends LoadingState>() =>
  (set: any, get: any, api: any) => ({
    isLoading: false,
    error: null,
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
  });

// TipTap Editor'ün JSON formatını temsil eder (veya HTML string)
export type EditorContent = Record<string, any> | string;

export interface ContentStructure {
  introduction: EditorContent | null;
  main: EditorContent | null;
  conclusion: EditorContent | null;
}

interface EditorState extends LoadingState {
  // State
  currentPostId: string | null; // Düzenlenen postun ID'si
  title: string;
  excerpt: string;
  postType: PostType | null;
  categoryId: string | null;
  tags: string[]; // Tag ID'leri
  coverImageFile: File | null;
  coverImageUrl: string | null;
  galleryFiles: File[];
  galleryImageUrls: string[];

  contentStructure: ContentStructure; // Giriş, ana, sonuç için ayrı editör içerikleri

  isPublished: boolean;
  scheduledAt: Date | null;
  allowComments: boolean;
  allowLikes: boolean;

  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;
  autoSaveInterval: number; // saniye
  isAutoSaving: boolean;

  // Actions
  loadPostForEditing: (post: Post) => void;
  createNewPostDraft: (type?: PostType) => void;

  setTitle: (title: string) => void;
  setExcerpt: (excerpt: string) => void;
  setPostType: (type: PostType | null) => void;
  setCategoryId: (id: string | null) => void;
  addTag: (tagId: string) => void;
  removeTag: (tagId: string) => void;
  setCoverImageFile: (file: File | null) => void;
  addGalleryFile: (file: File) => void;
  removeGalleryFile: (index: number) => void;

  // TipTap içerik güncellemeleri için
  updateIntroductionContent: (content: EditorContent) => void;
  updateMainContent: (content: EditorContent) => void;
  updateConclusionContent: (content: EditorContent) => void;

  setPublishStatus: (published: boolean) => void;
  setScheduledAt: (date: Date | null) => void;
  setAllowComments: (allow: boolean) => void;
  setAllowLikes: (allow: boolean) => void;

  savePost: () => Promise<Post | null>;
  triggerAutoSave: () => void;
  resetEditor: () => void;

  // Media upload
  uploadCoverImage: () => Promise<string | null>; // URL döner
  uploadGalleryImage: (file: File) => Promise<string | null>; // URL döner

  // Computed
  getWordCount: () => number; // Tüm içerik alanlarından
  getReadingTime: () => number; // Tüm içerik alanlarından
}

const initialEditorState = {
  currentPostId: null,
  title: "",
  excerpt: "",
  postType: null,
  categoryId: null,
  tags: [],
  coverImageFile: null,
  coverImageUrl: null,
  galleryFiles: [],
  galleryImageUrls: [],
  contentStructure: { introduction: null, main: null, conclusion: null },
  isPublished: false,
  scheduledAt: null,
  allowComments: true,
  allowLikes: true,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  autoSaveInterval: 30, // 30 saniye
  isAutoSaving: false,
};

// Debug logger - sadece development'ta çalışır
const debugLog = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message, ...args);
  }
};

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get, api) => ({
      ...createLoadingSlice<EditorState>()(set, get, api),
      ...initialEditorState,

      // Actions
      loadPostForEditing: (post) => {
        set({
          currentPostId: post.id,
          title: post.title,
          excerpt: post.excerpt,
          postType: post.type,
          categoryId: post.categoryId,
          tags: post.tags?.map((t) => t.id) || [],
          coverImageUrl: post.coverImage,
          galleryImageUrls: post.gallery || [],
          contentStructure: {
            // Gerçekte bu alanlar Post modelinde HTML veya JSON olarak tutulmalı
            introduction: post.introduction
              ? JSON.parse(post.introduction)
              : null, // Örnek: JSON string ise
            main: post.content ? JSON.parse(post.content) : null,
            conclusion: post.conclusion ? JSON.parse(post.conclusion) : null,
          },
          isPublished: post.isPublished,
          scheduledAt: post.scheduledAt || null,
          allowComments: post.allowComments,
          allowLikes: post.allowLikes,
          hasUnsavedChanges: false,
          lastSavedAt: new Date(), // Yüklendiği anı kaydet
        } as Partial<EditorState>);
      },

      createNewPostDraft: (type = PostType.ARTICLE) => {
        get().resetEditor();
        set({
          postType: type,
          hasUnsavedChanges: true, // Yeni draft hemen değişmiş sayılır
        } as Partial<EditorState>);
      },

      setTitle: (title) => set({ title, hasUnsavedChanges: true }),
      setExcerpt: (excerpt) => set({ excerpt, hasUnsavedChanges: true }),
      setPostType: (type) => set({ postType: type, hasUnsavedChanges: true }),
      setCategoryId: (id) => set({ categoryId: id, hasUnsavedChanges: true }),
      addTag: (tagId) =>
        set((state) => ({
          tags: [...new Set([...state.tags, tagId])],
          hasUnsavedChanges: true,
        })),
      removeTag: (tagId) =>
        set((state) => ({
          tags: state.tags.filter((t) => t !== tagId),
          hasUnsavedChanges: true,
        })),

      setCoverImageFile: (file) => {
        set({
          coverImageFile: file,
          coverImageUrl: file ? URL.createObjectURL(file) : null,
          hasUnsavedChanges: true,
        });
      },
      addGalleryFile: (file) => {
        set((state) => ({
          galleryFiles: [...state.galleryFiles, file],
          galleryImageUrls: [
            ...state.galleryImageUrls,
            URL.createObjectURL(file),
          ],
          hasUnsavedChanges: true,
        }));
      },
      removeGalleryFile: (index) => {
        set((state) => {
          const newFiles = [...state.galleryFiles];
          const newUrls = [...state.galleryImageUrls];
          if (state.galleryImageUrls[index].startsWith("blob:")) {
            URL.revokeObjectURL(state.galleryImageUrls[index]); // Blob URL ise memory'den temizle
          }
          newFiles.splice(index, 1);
          newUrls.splice(index, 1);
          return {
            galleryFiles: newFiles,
            galleryImageUrls: newUrls,
            hasUnsavedChanges: true,
          };
        });
      },

      updateIntroductionContent: (content) =>
        set((state) => ({
          contentStructure: {
            ...state.contentStructure,
            introduction: content,
          },
          hasUnsavedChanges: true,
        })),
      updateMainContent: (content) =>
        set((state) => ({
          contentStructure: {
            ...state.contentStructure,
            main: content,
          },
          hasUnsavedChanges: true,
        })),
      updateConclusionContent: (content) =>
        set((state) => ({
          contentStructure: {
            ...state.contentStructure,
            conclusion: content,
          },
          hasUnsavedChanges: true,
        })),

      setPublishStatus: (published) =>
        set({ isPublished: published, hasUnsavedChanges: true }),
      setScheduledAt: (date) =>
        set({ scheduledAt: date, hasUnsavedChanges: true }),
      setAllowComments: (allow) =>
        set({ allowComments: allow, hasUnsavedChanges: true }),
      setAllowLikes: (allow) =>
        set({ allowLikes: allow, hasUnsavedChanges: true }),

      savePost: async () => {
        const state = get();

        // Eğer hiç unsaved changes yoksa, mevcut post'u döndür
        if (!state.hasUnsavedChanges && state.currentPostId) {
          debugLog("📄 Hiç değişiklik yok, kaydetme işlemi atlanıyor");
          return null; // Veya mevcut post'u fetch edip döndür
        }

        try {
          set({ isLoading: true });
          debugLog("💾 Post kaydediliyor...");

          // Cover image upload
          let finalCoverImageUrl = state.coverImageUrl;
          if (state.coverImageFile) {
            const uploadResult = await state.uploadCoverImage();
            if (uploadResult) {
              finalCoverImageUrl = uploadResult;
            }
          }

          // Gallery images upload
          let finalGalleryUrls = [...state.galleryImageUrls];
          for (let i = 0; i < state.galleryFiles.length; i++) {
            const file = state.galleryFiles[i];
            const uploadResult = await state.uploadGalleryImage(file);
            if (uploadResult) {
              finalGalleryUrls[i] = uploadResult;
            }
          }

          // Content serialization
          const serializedContent = {
            introduction: state.contentStructure.introduction
              ? JSON.stringify(state.contentStructure.introduction)
              : null,
            main: state.contentStructure.main
              ? JSON.stringify(state.contentStructure.main)
              : null,
            conclusion: state.contentStructure.conclusion
              ? JSON.stringify(state.contentStructure.conclusion)
              : null,
          };

          // Prepare post data
          const postData = {
            title: state.title,
            excerpt: state.excerpt,
            content: serializedContent.main,
            introduction: serializedContent.introduction,
            conclusion: serializedContent.conclusion,
            type: state.postType,
            categoryId: state.categoryId,
            tagIds: state.tags,
            coverImage: finalCoverImageUrl,
            gallery: finalGalleryUrls,
            isPublished: state.isPublished,
            scheduledAt: state.scheduledAt,
            allowComments: state.allowComments,
            allowLikes: state.allowLikes,
          };

          // API call
          let result: Post;
          if (state.currentPostId) {
            // Update existing post
            const response = await fetch(
              `/api/admin/posts/${state.currentPostId}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData),
              }
            );

            if (!response.ok) {
              throw new Error("Post güncellenemedi");
            }

            result = await response.json();
            debugLog("✅ Post güncellendi:", result);
          } else {
            // Create new post
            const response = await fetch("/api/admin/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(postData),
            });

            if (!response.ok) {
              throw new Error("Post oluşturulamadı");
            }

            result = await response.json();
            debugLog("✅ Yeni post oluşturuldu:", result);

            // Yeni post oluşturulduğunda ID'sini kaydet
            set({ currentPostId: result.id });
          }

          // Update state
            set({
              hasUnsavedChanges: false,
              lastSavedAt: new Date(),
            coverImageFile: null, // File objelerini temizle, URL'ler kalır
            galleryFiles: [],
            coverImageUrl: finalCoverImageUrl,
            galleryImageUrls: finalGalleryUrls,
          });

          // Toast notification göster
            useUIStore.getState().addNotification({
              type: "success",
            title: "Başarılı!",
            message: "Post başarıyla kaydedildi!",
            duration: 3000,
          });

          return result;
        } catch (error) {
          console.error("Post kaydetme hatası:", error);
          useUIStore.getState().addNotification({
            type: "error",
            title: "Hata!",
            message: "Post kaydedilemedi!",
            duration: 3000,
          });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      triggerAutoSave: () => {
        const state = get();
        if (state.isAutoSaving || !state.hasUnsavedChanges) return;

        set({ isAutoSaving: true });
        debugLog("🤖 Otomatik kaydetme başlatılıyor...");

        // Debounce logic: Son değişiklikten 30 saniye sonra kaydet
        setTimeout(() => {
          const currentState = get();
          if (currentState.hasUnsavedChanges) {
            currentState.savePost().finally(() => {
              set({ isAutoSaving: false });
            });
          } else {
            set({ isAutoSaving: false });
          }
        }, state.autoSaveInterval * 1000);
      },

      resetEditor: () => {
        const state = get();

        // Blob URL'leri temizle
        state.galleryImageUrls.forEach((url) => {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
        if (state.coverImageUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(state.coverImageUrl);
        }

        set({
          ...initialEditorState,
          isLoading: false,
          error: null,
        });
        debugLog("🔄 Editör sıfırlandı");
      },

      uploadCoverImage: async () => {
        const state = get();
        if (!state.coverImageFile) return null;

        try {
          const formData = new FormData();
          formData.append("file", state.coverImageFile);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Resim yüklenemedi");
          }

          const { url } = await response.json();
          debugLog("🖼️ Cover image yüklendi:", url);
          return url;
        } catch (error) {
          console.error("Cover image upload hatası:", error);
          useUIStore.getState().addNotification({
            type: "error",
            title: "Hata!",
            message: "Resim yüklenemedi!",
            duration: 3000,
          });
          return null;
        }
      },

      uploadGalleryImage: async (file: File) => {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Galeri resmi yüklenemedi");
          }

          const { url } = await response.json();
          debugLog("🖼️ Galeri resmi yüklendi:", url);
          return url;
        } catch (error) {
          console.error("Gallery image upload hatası:", error);
          useUIStore.getState().addNotification({
            type: "error",
            title: "Hata!",
            message: "Galeri resmi yüklenemedi!",
            duration: 3000,
          });
          return null;
        }
      },

      getWordCount: () => {
        const state = get();
        const getTextLength = (content: EditorContent | null): number => {
          if (!content) return 0;
          if (typeof content === "string") {
            return calculateWordCount(content);
          }
          // TipTap JSON formatından text çıkar
          return calculateWordCount(JSON.stringify(content));
        };

        return (
          getTextLength(state.contentStructure.introduction) +
          getTextLength(state.contentStructure.main) +
          getTextLength(state.contentStructure.conclusion)
        );
      },

      getReadingTime: () => {
        const state = get();
        const contents = {
          introduction: state.contentStructure.introduction
            ? typeof state.contentStructure.introduction === "string"
              ? state.contentStructure.introduction
              : JSON.stringify(state.contentStructure.introduction)
            : "",
          content: state.contentStructure.main
            ? typeof state.contentStructure.main === "string"
              ? state.contentStructure.main
              : JSON.stringify(state.contentStructure.main)
            : "",
          conclusion: state.contentStructure.conclusion
            ? typeof state.contentStructure.conclusion === "string"
              ? state.contentStructure.conclusion
              : JSON.stringify(state.contentStructure.conclusion)
            : "",
        };
        return calculateTotalReadingTime(contents);
      },
    }),
    {
      name: "editor-store",
    }
  )
);
