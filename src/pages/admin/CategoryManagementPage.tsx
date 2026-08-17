import React, { useState } from 'react';
import { Plus, FolderTree, Edit3, Trash2, X } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Category } from '../../types';

export const CategoryManagementPage: React.FC = () => {
  const { categories, refetch } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image_url: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image_url: cat.image_url || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      alert('Please setup your Supabase credentials in .env.local first!');
      return;
    }

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      name: formData.name,
      slug,
      description: formData.description || null,
      image_url: formData.image_url || null,
    };

    try {
      if (editingCategory) {
        const { error } = await (supabase.from('categories') as any).update(payload).eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from('categories') as any).insert(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      // Check for active product dependencies to preserve foreign key integrity
      const { count, error: checkErr } = await (supabase.from('products') as any)
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);

      if (checkErr) throw checkErr;

      if (count && count > 0) {
        alert(
          `Cannot delete category "${catName}": ${count} product(s) are currently assigned to this category. Please reassign or delete those products first.`
        );
        return;
      }

      if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

      const { error } = await (supabase.from('categories') as any).delete().eq('id', id);
      if (error) throw error;
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#F7F4EA]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F6F50]/30">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Category Management</h1>
          <p className="text-xs text-[#F7F4EA]/70 mt-1">Organize product catalog categories</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#B7F34A] text-[#12372A] font-extrabold text-xs flex items-center gap-2 shadow transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#1F6F50]/20 rounded-xl p-5 border border-[#1F6F50]/40 flex justify-between items-start"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F6F50] text-[#B7F34A] flex items-center justify-center font-bold">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{cat.name}</h3>
                <p className="text-[11px] text-[#F7F4EA]/60 font-mono">slug: {cat.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleOpenEditModal(cat)}
                className="p-1.5 rounded-lg text-[#B7F34A] hover:bg-[#1F6F50]/40 transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#12372A]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12372A] border border-[#1F6F50] rounded-2xl p-6 shadow-2xl space-y-4 text-[#F7F4EA]">
            <div className="flex justify-between items-center pb-3 border-b border-[#1F6F50]/40">
              <h3 className="font-bold text-white text-base">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#F7F4EA]/70">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-white mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Consumer Electronics"
                  className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short department summary..."
                  className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                />
              </div>

              <div className="pt-4 border-t border-[#1F6F50]/40 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1F6F50]/40 text-[#F7F4EA] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B7F34A] text-[#12372A] font-extrabold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
