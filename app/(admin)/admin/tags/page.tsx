"use client";
import { useEffect, useState } from "react";
import { useTagStore } from "@/lib/stores/tag-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminTagsPage() {
  const { tags, fetchTags, createTag, updateTag, deleteTag } = useTagStore();
  const [openModal, setOpenModal] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: "", color: "#6b7280" });

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    if (editTag) setForm({ name: editTag.name, color: editTag.color });
    else setForm({ name: "", color: "#6b7280" });
  }, [editTag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTag) await updateTag(editTag.id, form);
    else await createTag(form);
    setOpenModal(false);
    setEditTag(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Etiketler</h2>
        <Button
          onClick={() => {
            setEditTag(null);
            setOpenModal(true);
          }}
        >
          Yeni Etiket
        </Button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İsim
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Renk
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tags.map((tag) => (
            <tr key={tag.id}>
              <td className="px-6 py-4 whitespace-nowrap">{tag.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{tag.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  style={{
                    background: tag.color,
                    padding: "2px 8px",
                    borderRadius: 4,
                    color: "#fff",
                  }}
                >
                  {tag.color}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditTag(tag);
                    setOpenModal(true);
                  }}
                >
                  Düzenle
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteTag(tag.id)}
                >
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTag ? "Etiketi Düzenle" : "Yeni Etiket"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Etiket adı"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              type="color"
              value={form.color}
              onChange={(e) =>
                setForm((f) => ({ ...f, color: e.target.value }))
              }
              required
            />
            <DialogFooter>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
