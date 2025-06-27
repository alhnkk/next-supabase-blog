"use client";

import { useState, useEffect } from "react";
import { FolderOpen, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CategoriesProps {
  customItemClass?: string;
  customIconClass?: string;
  customNameClass?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count: {
    posts: number;
  };
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (res.ok) {
          const response = await res.json();
          // API {success: true, data: categories} formatında dönüyor
          if (response.success && Array.isArray(response.data)) {
            setCategories(response.data);
          } else {
            console.error("API response format hatası:", response);
            setCategories([]);
          }
        } else {
          console.error("Categories API yanıtı başarısız");
          setCategories([]);
        }
      } catch (error) {
        console.error("Categories yüklenirken hata:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-white  border border-gray-200  rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Kategoriler</h3>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-md"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-4 w-6 bg-gray-200  rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Kategoriler</h3>
        </div>
        <div className="text-center text-gray-50 py-4">
          <p className="text-sm">Henüz kategori bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Kategoriler</h3>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50  transition-colors"
          >
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" style={{ color: category.color }} />
              <span className="text-sm text-gray-700">{category.name}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {category._count?.posts || 0}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const SidebarCategories = Categories;
