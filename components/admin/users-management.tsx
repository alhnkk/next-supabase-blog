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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  UserCheck,
  UserX,
  Ban,
  Crown,
  Edit,
  FileText,
  Search,
  RefreshCw,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  Calendar,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "admin" | "user";
  banned: boolean;
  banReason?: string;
  banExpires?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  _count: {
    posts: number;
    comments: number;
    likes: number;
    savedPosts: number;
  };
}

interface UsersManagementProps {
  className?: string;
}

const roleConfig = {
  admin: {
    label: "Admin",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Crown,
    description: "Full system access",
  },
  user: {
    label: "User",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Users,
    description: "Standard user",
  },
};

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: UserCheck,
  },
  banned: {
    label: "Banned",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Ban,
  },
};

export function UsersManagement({ className }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Ban modal state
  const [showBanModal, setShowBanModal] = useState(false);
  const [banningUser, setBanningUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("7");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole !== "all" && { role: selectedRole }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
      });

      const response = await fetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
        setTotalPages(result.meta.totalPages);
        setTotalCount(result.meta.totalCount);
      } else {
        throw new Error(result.error || "Kullanıcılar alınamadı");
      }
    } catch (error) {
      console.error("Users fetch error:", error);
      toast.error("Kullanıcılar yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, selectedRole, selectedStatus]);

  const handleUpdateUser = async (
    userId: string,
    updateData: Partial<User>
  ) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Kullanıcı başarıyla güncellendi");
        fetchUsers(); // Refresh list
        setEditingUser(null);
      } else {
        throw new Error(result.error || "Güncelleme başarısız");
      }
    } catch (error) {
      console.error("User update error:", error);
      toast.error("Kullanıcı güncellenirken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Kullanıcı başarıyla silindi");
        fetchUsers(); // Refresh list
      } else {
        throw new Error(result.error || "Silme başarısız");
      }
    } catch (error) {
      console.error("User delete error:", error);
      toast.error("Kullanıcı silinirken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  // Ban modal component
  const BanUserModal = () => (
    <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kullanıcıyı Yasakla</DialogTitle>
          <DialogDescription>
            {banningUser?.name} kullanıcısını yasaklamak istediğinizden emin
            misiniz?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="banReason">Ban Nedeni</Label>
            <Select value={banReason} onValueChange={setBanReason}>
              <SelectTrigger>
                <SelectValue placeholder="Ban nedeni seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam/İstenmeyen İçerik</SelectItem>
                <SelectItem value="harassment">Taciz/Hakaret</SelectItem>
                <SelectItem value="inappropriate">Uygunsuz İçerik</SelectItem>
                <SelectItem value="copyright">Telif Hakkı İhlali</SelectItem>
                <SelectItem value="multiple_violations">
                  Çoklu Kural İhlali
                </SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="banDuration">Ban Süresi</Label>
            <Select value={banDuration} onValueChange={setBanDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Ban süresi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Gün</SelectItem>
                <SelectItem value="7">7 Gün</SelectItem>
                <SelectItem value="30">30 Gün</SelectItem>
                <SelectItem value="365">1 Yıl</SelectItem>
                <SelectItem value="permanent">Kalıcı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowBanModal(false)}>
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmBan}
            disabled={!banReason || isUpdating}
          >
            {isUpdating ? "Yasaklanıyor..." : "Yasakla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const handleConfirmBan = async () => {
    if (!banningUser || !banReason) return;

    try {
      setIsUpdating(true);

      const banReasonText =
        {
          spam: "Spam/İstenmeyen İçerik",
          harassment: "Taciz/Hakaret",
          inappropriate: "Uygunsuz İçerik",
          copyright: "Telif Hakkı İhlali",
          multiple_violations: "Çoklu Kural İhlali",
          other: "Diğer",
        }[banReason] || banReason;

      const banExpiresIn =
        banDuration === "permanent"
          ? undefined
          : parseInt(banDuration) * 24 * 60 * 60; // gün -> saniye

      const result = await authClient.admin.banUser({
        userId: banningUser.id,
        banReason: banReasonText,
        banExpiresIn,
      });

      if (result.data) {
        toast.success(`${banningUser.name} başarıyla yasaklandı`);
        setShowBanModal(false);
        setBanningUser(null);
        setBanReason("");
        setBanDuration("7");
        fetchUsers();
      }
    } catch (error) {
      console.error("Ban error:", error);
      toast.error("Kullanıcı yasaklanırken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInitiateBan = (user: User) => {
    setBanningUser(user);
    setShowBanModal(true);
  };

  const handleStatusChange = async (userId: string, banned: boolean) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (banned) {
      try {
        setIsUpdating(true);

        // Ban kullanıcı - Better Auth admin client kullan
        const result = await authClient.admin.banUser({
          userId,
          banReason: "Admin tarafından yasaklandı",
          banExpiresIn: 60 * 60 * 24 * 7, // 7 gün
        });

        if (result.data) {
          toast.success("Kullanıcı başarıyla yasaklandı");
          fetchUsers();
        }
      } catch (error) {
        console.error("Ban error:", error);
        toast.error("Kullanıcı yasaklanırken hata oluştu");
      } finally {
        setIsUpdating(false);
      }
    } else {
      try {
        setIsUpdating(true);

        const result = await authClient.admin.unbanUser({
          userId,
        });

        if (result.data) {
          toast.success("Kullanıcının yasağı kaldırıldı");
          fetchUsers();
        }
      } catch (error) {
        console.error("Unban error:", error);
        toast.error("Yasak kaldırılırken hata oluştu");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleRoleChange = async (userId: string, role: "admin" | "user") => {
    await handleUpdateUser(userId, { role });
  };

  const getRoleBadge = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (user: User) => {
    const status = user.banned ? "banned" : "active";
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading && users.length === 0) {
    return <UsersManagementSkeleton className={className} />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">
            Kullanıcı Yönetimi
          </h2>
          <p className="text-muted-foreground">
            Kullanıcı hesaplarını, rollerini ve yetkilerini yönetin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Toplam Kullanıcı
              </p>
              <p className="text-2xl font-bold text-blue-800">{totalCount}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                Aktif Kullanıcı
              </p>
              <p className="text-2xl font-bold text-green-800">
                {users.filter((u) => !u.banned).length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Admin</p>
              <p className="text-2xl font-bold text-purple-800">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <Crown className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Yasaklı</p>
              <p className="text-2xl font-bold text-red-800">
                {users.filter((u) => u.banned).length}
              </p>
            </div>
            <Ban className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="İsim veya email ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Roller</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Kullanıcı</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="banned">Yasaklı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead>İstatistikler</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">Kullanıcı bulunamadı</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {user.name}
                          {user.emailVerified && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div>{user._count.posts} post</div>
                      <div>{user._count.comments} yorum</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menüyü aç</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        {/* Role Changes */}
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() =>
                            handleRoleChange(
                              user.id,
                              user.role === "admin" ? "user" : "admin"
                            )
                          }
                          disabled={isUpdating}
                        >
                          <Crown className="w-4 h-4" />
                          {user.role === "admin"
                            ? "Admin Rolünü Kaldır"
                            : "Admin Yap"}
                        </DropdownMenuItem>

                        {/* Status Changes */}
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() =>
                            handleStatusChange(user.id, !user.banned)
                          }
                          disabled={isUpdating}
                        >
                          {user.banned ? (
                            <>
                              <UserCheck className="w-4 h-4" />
                              Yasağı Kaldır
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4" />
                              Yasakla
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="gap-2 text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Kullanıcıyı Sil
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.name} kullanıcısını silmek istediğinizden
                                emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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

      {/* Ban Modal */}
      <BanUserModal />

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
              <DialogDescription>
                {editingUser.name} kullanıcısının bilgilerini düzenleyin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  İsim
                </Label>
                <Input
                  id="name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Rol
                </Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: "admin" | "user") =>
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Kullanıcı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="banned" className="text-right">
                  Yasaklı
                </Label>
                <Switch
                  id="banned"
                  checked={editingUser.banned}
                  onCheckedChange={(checked) =>
                    setEditingUser({ ...editingUser, banned: checked })
                  }
                />
              </div>
              {editingUser.banned && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="banReason" className="text-right">
                    Yasak Nedeni
                  </Label>
                  <Textarea
                    id="banReason"
                    value={editingUser.banReason || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        banReason: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Yasak nedeni..."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                İptal
              </Button>
              <Button
                type="button"
                onClick={() => handleUpdateUser(editingUser.id, editingUser)}
                disabled={isUpdating}
              >
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Skeleton component for loading state
function UsersManagementSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </Card>
    </div>
  );
}
