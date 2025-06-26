"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Menu,
  ChevronDown,
  Tag,
  ChevronRight,
  Search,
  X,
  Folder,
  FileText,
  User,
  Heart,
  Code,
  Camera,
  Music,
  Globe,
  BookOpen,
  Zap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCategory } from "@/hooks/useCategory";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";
import { UserDropdown } from "@/components/user-dropdown";
import { LoginModal } from "@/components/login-modal";
import { RegisterModal } from "@/components/register-modal";
import { useSiteSettingsStore } from "@/lib/stores/site-settings-store";
import { useHydration } from "@/hooks/use-hydration";

// Sık kullanılan icon'lar için map
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Folder,
  FileText,
  User,
  Heart,
  Code,
  Camera,
  Music,
  Globe,
  BookOpen,
  Zap,
  Tag,
  ChevronRight,
};

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: {
    name: string;
  } | null;
  category: {
    name: string;
  } | null;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // ALL HOOKS MUST BE CALLED IN THE SAME ORDER EVERY TIME
  const [open, setOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  // Hydration kontrolü - ALWAYS call this hook
  const isHydrated = useHydration();

  // Site ayarları için store - ALWAYS call this hook
  const { settings, fetchSettings } = useSiteSettingsStore();

  // Kategorileri hook ile çekiyoruz - ALWAYS call this hook
  const { categories, isLoading, error, getCategories } = useCategory();

  // AuthClient hook - ALWAYS call this hook (React rules of hooks)
  const sessionQuery = authClient.useSession();
  const { data: session, isPending: sessionLoading } = sessionQuery;
  
  // Hydration kontrolü ile güvenli kullanım
  const safeSession = isHydrated ? session : null;

  // ALWAYS call useEffect hooks in the same order
  useEffect(() => {
    // Sadece ilk renderda çağır
    getCategories();
    if (isHydrated) {
      fetchSettings();
    }
  }, [isHydrated]); // Remove function dependencies to stabilize

  // Search functionality - ALWAYS call this useEffect
  useEffect(() => {
    const searchPosts = async () => {
      if (
        !debouncedSearchQuery.trim() ||
        debouncedSearchQuery.trim().length < 3
      ) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/posts?search=${encodeURIComponent(
            debouncedSearchQuery
          )}&limit=5&isPublished=true`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data || []);
          setShowSearchDropdown(true);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchPosts();
  }, [debouncedSearchQuery]);

  // Click outside handler - ALWAYS call this useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ALL FUNCTION DECLARATIONS AFTER HOOKS
  const isActive = (path: string) => pathname === path;

  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const handlePostClick = (slug: string) => {
    router.push(`/post/${slug}`);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  const handleDetailedSearch = () => {
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 my-1">
        {/* Logo - Sol taraf */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={
              isHydrated && settings?.siteLogo ? settings.siteLogo : "/logo.svg"
            }
            alt={
              isHydrated && settings?.siteName
                ? `${settings.siteName} Logo`
                : "Blog Logo"
            }
            width={50}
            height={50}
            className="w-8 h-8"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/logo.svg";
            }}
          />
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 hover:opacity-80 transition-opacity">
            {isHydrated && settings?.siteName
              ? settings.siteName.toUpperCase()
              : "BLOG"}
          </h2>
        </Link>

        {/* Search Bar - Sol taraf */}
        <div className="px-8 flex-1 hidden md:block" ref={searchRef}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
                <Input
                  variant="search"
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchResults &&
                    searchResults.length > 0 &&
                    setShowSearchDropdown(true)
                  }
                  className="pl-10 pr-4 h-9 text-sm flex-1 text-black"
                />
              </div>
            </form>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
                {isSearching && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Aranıyor...
                  </div>
                )}

                {!isSearching &&
                  searchResults &&
                  searchResults.length === 0 &&
                  searchQuery.trim() && (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Sonuç bulunamadı
                    </div>
                  )}

                {!isSearching && searchResults && searchResults.length > 0 && (
                  <>
                    {searchResults.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post.slug)}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                      >
                        {/* Post Image */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {post.coverImage ? (
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                              <Search className="w-4 h-4 text-black" />
                            </div>
                          )}
                        </div>

                        {/* Post Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1 text-foreground">
                            {post.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {post.excerpt || "Özet bulunamadı"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {post.author?.name}
                            </span>
                            {post.category && (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {post.category.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Detailed Search Button */}
                    <div className="p-3 border-t bg-muted/30">
                      <Button
                        onClick={handleDetailedSearch}
                        variant="outline"
                        size="sm"
                        className="w-full text-sm"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Detaylı Arama
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Masaüstü Menü */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={` hover:text-primary transition-colors font-medium ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              ANA SAYFA
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="font-medium h-auto p-2 text-muted-foreground hover:text-primary"
                >
                  <Link href="/categories" className="flex items-center">
                    KATEGORİLER
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 shadow-lg">
                <DropdownMenuItem asChild>
                  <Link
                    href="/categories"
                    className="flex items-center gap-3 py-2 font-medium text-primary"
                  >
                    <span className="font-semibold text-sm">#</span>
                    <span>Tüm Kategoriler</span>
                  </Link>
                </DropdownMenuItem>
                {!isLoading &&
                  !error &&
                  Array.isArray(categories) &&
                  categories.length > 0 && (
                    <div className="border-t border-gray-200 my-1" />
                  )}
                {isLoading && (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    Kategoriler yükleniyor...
                  </DropdownMenuItem>
                )}
                {error && (
                  <DropdownMenuItem disabled className="text-destructive">
                    Hata: {error.message}
                  </DropdownMenuItem>
                )}
                {!isLoading &&
                  !error &&
                  Array.isArray(categories) &&
                  categories.length === 0 && (
                    <DropdownMenuItem
                      disabled
                      className="text-muted-foreground"
                    >
                      Kategori bulunamadı
                    </DropdownMenuItem>
                  )}
                {!isLoading &&
                  !error &&
                  Array.isArray(categories) &&
                  categories.length > 0 &&
                  categories.map((cat) => {
                    let Icon: React.ComponentType<{ className?: string }> =
                      ChevronRight;
                    if (cat.icon && iconMap[cat.icon]) {
                      Icon = iconMap[cat.icon];
                    }
                    return (
                      <DropdownMenuItem asChild key={cat.id}>
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="flex items-center gap-3 py-2"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{cat.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/iletisim"
              className={`font-medium  hover:text-primary transition-colors ${
                isActive("/iletisim") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              İLETİŞİM
            </Link>
          </div>
          {/* Auth Butonları */}
          <div className="flex items-center gap-3">
            {safeSession?.user ? (
              <UserDropdown />
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  className="font-medium"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Giriş Yap
                </Button>
                <Button
                  size="md"
                  variant="default"
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  Kayıt Ol
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobil Menü */}
        <div className="md:hidden flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menüyü Aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-72">
              <SheetTitle className="sr-only">Navigasyon Menüsü</SheetTitle>
              <div className="flex flex-col gap-1 p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold gradient-text">
                    🍂 JURNALİZE
                  </h2>
                </div>

                <Link
                  href="/"
                  className={`font-medium text-base py-3 px-3 rounded-md transition-colors ${
                    isActive("/")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-accent"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  ANA SAYFA
                </Link>

                <div className="py-2">
                  <div className="font-medium text-base py-3 px-3 text-foreground">
                    KATEGORİLER
                  </div>
                  <div className="flex flex-col pl-4 space-y-1">
                    {isLoading && (
                      <span className=" text-muted-foreground py-2">
                        Yükleniyor...
                      </span>
                    )}
                    {error && (
                      <span className=" text-destructive py-2">
                        Hata: {error.message}
                      </span>
                    )}
                    {!isLoading &&
                      !error &&
                      Array.isArray(categories) &&
                      categories.length === 0 && (
                        <span className=" text-muted-foreground py-2">
                          Kategori bulunamadı
                        </span>
                      )}
                    {!isLoading &&
                      !error &&
                      Array.isArray(categories) &&
                      categories.length > 0 &&
                      categories.map((cat) => {
                        let Icon: React.ComponentType<{ className?: string }> =
                          ChevronRight;
                        if (cat.icon && iconMap[cat.icon]) {
                          Icon = iconMap[cat.icon];
                        }
                        return (
                          <Link
                            key={cat.id}
                            href={`/kategori/${cat.slug}`}
                            className="py-2  font-medium flex items-center gap-3 px-3 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <Icon className="w-4 h-4" />
                            {cat.name}
                          </Link>
                        );
                      })}
                  </div>
                </div>

                <div className="border-t my-4" />

                {/* Mobile Search */}
                <div className="px-3 py-2">
                  <form
                    onSubmit={(e) => {
                      handleSearch(e);
                      setOpen(false);
                    }}
                    className="relative"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 w-full h-10 text-black"
                      />
                    </div>
                  </form>
                </div>

                <Link
                  href="/iletisim"
                  className={`font-medium text-base py-3 px-3 rounded-md transition-colors ${
                    isActive("/iletisim")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-accent"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  İLETİŞİM
                </Link>

                <div className="border-t my-4" />

                {safeSession?.user ? (
                  <div className="space-y-1">
                    <Link
                      href="/profil"
                      className="py-3 px-3 font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors block"
                      onClick={() => setOpen(false)}
                    >
                      Profil
                    </Link>
                    {(safeSession.user as { role?: string }).role ===
                      "admin" && (
                      <Link
                        href="/admin"
                        className="py-3 px-3 font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors block"
                        onClick={() => setOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-medium text-muted-foreground hover:text-primary"
                      onClick={async () => {
                        await authClient.signOut();
                        setOpen(false);
                        // Session otomatik olarak hook tarafından güncellenecek
                      }}
                    >
                      Çıkış Yap
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-medium"
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setOpen(false);
                      }}
                    >
                      Giriş Yap
                    </Button>
                    <Button
                      className="w-full font-medium"
                      onClick={() => {
                        setIsRegisterModalOpen(true);
                        setOpen(false);
                      }}
                    >
                      Kayıt Ol
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* Register Modal */}
      <RegisterModal
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </nav>
  );
}
