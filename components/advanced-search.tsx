"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "@/components/post-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Filter,
  X,
  Calendar,
  Clock,
  Tag,
  User,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface SearchFilters {
  query: string;
  categoryId: string;
  authorId: string;
  tags: string[];
  postType: string;
  sortBy: "relevance" | "date" | "views" | "likes" | "comments";
  sortOrder: "desc" | "asc";
  dateRange: {
    from: string;
    to: string;
  };
  readingTime: {
    min: number;
    max: number;
  };
  wordCount: {
    min: number;
    max: number;
  };
}

interface SearchResults {
  posts: any[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

interface SearchMetadata {
  categories: any[];
  authors: any[];
  tags: any[];
  postTypes: { value: string; label: string }[];
}

const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  categoryId: "all-categories",
  authorId: "all-authors",
  tags: [],
  postType: "all-types",
  sortBy: "relevance",
  sortOrder: "desc",
  dateRange: { from: "", to: "" },
  readingTime: { min: 0, max: 0 },
  wordCount: { min: 0, max: 0 },
};

const POST_TYPES = [
  { value: "ARTICLE", label: "Makale" },
  { value: "REVIEW", label: "İnceleme" },
  { value: "INTERVIEW", label: "Röportaj" },
  { value: "POETRY", label: "Şiir" },
  { value: "SHORT_STORY", label: "Kısa Hikaye" },
  { value: "ESSAY", label: "Deneme" },
  { value: "OPINION", label: "Görüş" },
  { value: "NEWS", label: "Haber" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Alakalılık", icon: Sparkles },
  { value: "date", label: "Tarih", icon: Calendar },
  { value: "views", label: "Görüntülenme", icon: Eye },
  { value: "likes", label: "Beğeni", icon: Heart },
  { value: "comments", label: "Yorum", icon: MessageSquare },
];

export function AdvancedSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // States
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [results, setResults] = useState<SearchResults>({
    posts: [],
    total: 0,
    page: 1,
    totalPages: 0,
    hasMore: false,
  });
  const [metadata, setMetadata] = useState<SearchMetadata>({
    categories: [],
    authors: [],
    tags: [],
    postTypes: POST_TYPES,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Debounced search query
  const debouncedQuery = useDebounce(filters.query, 500);

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = {
      query: searchParams.get("q") || "",
      categoryId: searchParams.get("category") || "",
      authorId: searchParams.get("author") || "",
      tags: searchParams.getAll("tags") || [],
      postType: searchParams.get("type") || "",
      sortBy: (searchParams.get("sort") as any) || "relevance",
      sortOrder: (searchParams.get("order") as any) || "desc",
      dateRange: {
        from: searchParams.get("from") || "",
        to: searchParams.get("to") || "",
      },
      readingTime: {
        min: Number(searchParams.get("readingMin")) || 0,
        max: Number(searchParams.get("readingMax")) || 0,
      },
      wordCount: {
        min: Number(searchParams.get("wordsMin")) || 0,
        max: Number(searchParams.get("wordsMax")) || 0,
      },
    };
    setFilters(urlFilters);
  }, [searchParams]);

  // Fetch metadata (categories, authors, tags)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, authorsRes, tagsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/authors"),
          fetch("/api/tags"),
        ]);

        const [categories, authors, tags] = await Promise.all([
          categoriesRes.json(),
          authorsRes.json(),
          tagsRes.json(),
        ]);

        setMetadata({
          categories: categories.data || [],
          authors: authors.data || [],
          tags: tags.data || [],
          postTypes: POST_TYPES,
        });
      } catch (error) {
        console.error("Metadata fetch error:", error);
        toast.error("Filtre seçenekleri yüklenirken hata oluştu");
      }
    };

    fetchMetadata();
  }, []);

  // Search function
  const performSearch = useCallback(async () => {
    if (!debouncedQuery && !hasActiveFilters()) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (debouncedQuery) params.set("search", debouncedQuery);
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.authorId) params.set("authorId", filters.authorId);
      if (filters.postType) params.set("type", filters.postType);
      if (filters.sortBy !== "relevance") params.set("sortBy", filters.sortBy);
      if (filters.sortOrder !== "desc")
        params.set("sortOrder", filters.sortOrder);
      if (filters.dateRange.from)
        params.set("dateFrom", filters.dateRange.from);
      if (filters.dateRange.to) params.set("dateTo", filters.dateRange.to);
      filters.tags.forEach((tag) => params.append("tagIds", tag));

      // Add pagination
      params.set("page", "1");
      params.set("limit", "12");
      params.set("isPublished", "true");

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) throw new Error("Arama başarısız");

      const data = await response.json();
      setResults({
        posts: data.data || [],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: Math.ceil((data.total || 0) / 12),
        hasMore: data.page < Math.ceil((data.total || 0) / 12),
      });

      // Update URL
      updateURL();
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Arama sırasında hata oluştu");
      setResults({
        posts: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters]);

  // Check if there are active filters
  const hasActiveFilters = useCallback(() => {
    return (
      filters.categoryId ||
      filters.authorId ||
      filters.tags.length > 0 ||
      filters.postType ||
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.readingTime.min > 0 ||
      filters.readingTime.max > 0 ||
      filters.wordCount.min > 0 ||
      filters.wordCount.max > 0
    );
  }, [filters]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.authorId) count++;
    if (filters.tags.length > 0) count += filters.tags.length;
    if (filters.postType) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.readingTime.min > 0 || filters.readingTime.max > 0) count++;
    if (filters.wordCount.min > 0 || filters.wordCount.max > 0) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Update URL with current filters
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (filters.query) params.set("q", filters.query);
    if (filters.categoryId) params.set("category", filters.categoryId);
    if (filters.authorId) params.set("author", filters.authorId);
    if (filters.postType) params.set("type", filters.postType);
    if (filters.sortBy !== "relevance") params.set("sort", filters.sortBy);
    if (filters.sortOrder !== "desc") params.set("order", filters.sortOrder);
    if (filters.dateRange.from) params.set("from", filters.dateRange.from);
    if (filters.dateRange.to) params.set("to", filters.dateRange.to);
    filters.tags.forEach((tag) => params.append("tags", tag));

    const url = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(url, { scroll: false });
  }, [filters, pathname, router]);

  // Perform search when filters change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Filter update helpers
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    // Handle "all-" prefix values as empty strings for API calls
    if (typeof value === "string" && value.startsWith("all-")) {
      value = "";
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = (tagId: string) => {
    if (!filters.tags.includes(tagId)) {
      setFilters((prev) => ({ ...prev, tags: [...prev.tags, tagId] }));
    }
  };

  const removeTag = (tagId: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagId),
    }));
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const clearFilter = (key: keyof SearchFilters) => {
    if (key === "tags") {
      setFilters((prev) => ({ ...prev, tags: [] }));
    } else if (key === "dateRange") {
      setFilters((prev) => ({ ...prev, dateRange: { from: "", to: "" } }));
    } else if (key === "readingTime") {
      setFilters((prev) => ({ ...prev, readingTime: { min: 0, max: 0 } }));
    } else if (key === "wordCount") {
      setFilters((prev) => ({ ...prev, wordCount: { min: 0, max: 0 } }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: "" }));
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 pb-8">
        <h1 className="text-4xl font-bold text-foreground">Gelişmiş Arama</h1>
        <p className="text-lg text-muted-foreground mx-auto">
          İstediğiniz içeriği bulmak için güçlü filtreleme ve arama
          özelliklerini kullanın
        </p>
      </div>

      {/* Search Bar */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Makale, yazar, içerik, hashtag ara..."
              value={filters.query}
              onChange={(e) => updateFilter("query", e.target.value)}
              className="pl-12 pr-20 py-4 text-lg border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtreler
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
                {isFiltersOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Gelişmiş Filtreler
                </CardTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Tümünü Temizle
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={filters.categoryId}
                    onValueChange={(value) => updateFilter("categoryId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">
                        Tüm Kategoriler
                      </SelectItem>
                      {metadata.categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Author Filter */}
                <div className="space-y-2">
                  <Label>Yazar</Label>
                  <Select
                    value={filters.authorId}
                    onValueChange={(value) => updateFilter("authorId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Yazar seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-authors">Tüm Yazarlar</SelectItem>
                      {metadata.authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Post Type Filter */}
                <div className="space-y-2">
                  <Label>İçerik Türü</Label>
                  <Select
                    value={filters.postType}
                    onValueChange={(value) => updateFilter("postType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tür seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">Tüm Türler</SelectItem>
                      {POST_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label>Sıralama</Label>
                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split("-");
                      updateFilter("sortBy", sortBy);
                      updateFilter("sortOrder", sortOrder);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <div key={option.value}>
                          <SelectItem value={`${option.value}-desc`}>
                            {option.label} (Yüksekten Düşüğe)
                          </SelectItem>
                          <SelectItem value={`${option.value}-asc`}>
                            {option.label} (Düşükten Yükseğe)
                          </SelectItem>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Tarih Aralığı</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={(e) =>
                      updateFilter("dateRange", {
                        ...filters.dateRange,
                        from: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={(e) =>
                      updateFilter("dateRange", {
                        ...filters.dateRange,
                        to: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  {(filters.dateRange.from || filters.dateRange.to) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter("dateRange")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <Label>Etiketler</Label>
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => {
                    const isSelected = filters.tags.includes(tag.id);
                    return (
                      <Badge
                        key={tag.id}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          isSelected ? removeTag(tag.id) : addTag(tag.id)
                        }
                      >
                        <span className="mr-1 font-semibold text-xs">#</span>
                        {tag.name}
                        {isSelected && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">
                Aktif Filtreler:
              </span>

              {filters.categoryId && (
                <Badge variant="secondary" className="gap-1">
                  {
                    metadata.categories.find((c) => c.id === filters.categoryId)
                      ?.name
                  }
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => clearFilter("categoryId")}
                  />
                </Badge>
              )}

              {filters.authorId && (
                <Badge variant="secondary" className="gap-1">
                  {
                    metadata.authors.find((a) => a.id === filters.authorId)
                      ?.name
                  }
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => clearFilter("authorId")}
                  />
                </Badge>
              )}

              {filters.postType && (
                <Badge variant="secondary" className="gap-1">
                  {POST_TYPES.find((t) => t.value === filters.postType)?.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => clearFilter("postType")}
                  />
                </Badge>
              )}

              {filters.tags.map((tagId) => {
                const tag = metadata.tags.find((t) => t.id === tagId);
                return tag ? (
                  <Badge key={tagId} variant="secondary" className="gap-1">
                    <span className="font-semibold text-xs">#</span>
                    {tag.name}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tagId)}
                    />
                  </Badge>
                ) : null;
              })}

              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  {filters.dateRange.from} - {filters.dateRange.to}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => clearFilter("dateRange")}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <div className="space-y-6">
        {/* Results Header */}
        {(results.total > 0 || isLoading) && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Arama Sonuçları</h2>
              {!isLoading && (
                <p className="text-muted-foreground">
                  {results.total} sonuçtan {Math.min(12, results.total)} tanesi
                  gösteriliyor
                  {filters.query && ` - "${filters.query}" için`}
                </p>
              )}
            </div>

            {results.total > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sıralama:</span>
                <Badge variant="outline">
                  {SORT_OPTIONS.find((o) => o.value === filters.sortBy)
                    ?.label || "Alakalılık"}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-muted-foreground">Aranıyor...</span>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && results.posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading &&
          results.total === 0 &&
          (filters.query || hasActiveFilters()) && (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <Search className="w-16 h-16 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Sonuç bulunamadı</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Arama kriterlerinize uygun içerik bulunamadı. Farklı anahtar
                    kelimeler deneyin veya filtrelerinizi değiştirin.
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={clearAllFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Filtreleri Temizle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateFilter("query", "")}
                  >
                    Aramayı Temizle
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Load More */}
        {!isLoading && results.hasMore && (
          <div className="text-center">
            <Button size="lg" variant="outline">
              Daha Fazla Yükle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
