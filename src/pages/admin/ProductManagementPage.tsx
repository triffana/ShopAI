import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, X } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Product } from '../../types';

export const ProductManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { products, loading, refetch } = useProducts({ search });
  const { categories } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discount_percent: '0',
    stock: '10',
    brand: '',
    category_id: '',
    image_url: '',
    is_featured: false,
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      discount_percent: '0',
      stock: '10',
      brand: '',
      category_id: categories[0]?.id || '',
      image_url: '',
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: String(product.price),
      discount_percent: String(product.discount_percent || 0),
      stock: String(product.stock),
      brand: product.brand || '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      is_featured: product.is_featured,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      alert('Please setup your Supabase project credentials in .env.local first!');
      return;
    }

    setSubmitting(true);
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const payload: Record<string, any> = {
      name: formData.name,
      slug,
      description: formData.description || null,
      price: parseFloat(formData.price) || 0,
      discount_percent: parseFloat(formData.discount_percent) || 0,
      stock: parseInt(formData.stock) || 0,
      brand: formData.brand || null,
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      is_featured: formData.is_featured,
    };

    try {
      if (editingProduct) {
        const { error } = await (supabase.from('products') as any).update(payload).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from('products') as any).insert(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    try {
      const { error } = await (supabase.from('products') as any).delete().eq('id', id);
      if (error) {
        if (error.code === '23503') {
          alert(`Cannot delete "${productName}" because it is referenced in active orders or user wishlists.`);
          return;
        }
        throw error;
      }
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#F7F4EA]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F6F50]/30">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product Management</h1>
          <p className="text-xs text-[#F7F4EA]/70 mt-1">Manage catalog items, inventory stock & pricing</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#B7F34A] text-[#12372A] font-extrabold text-xs flex items-center gap-2 shadow transition shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-[#F7F4EA]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product inventory..."
            className="w-full pl-10 pr-4 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-xs text-white placeholder-[#F7F4EA]/50 focus:outline-none focus:border-[#B7F34A]"
          />
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-[#1F6F50]/10 rounded-xl border border-[#1F6F50]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F7F4EA]">
            <thead className="bg-[#12372A] text-[#B7F34A] font-bold border-b border-[#1F6F50]/40 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F6F50]/20">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#F7F4EA]/60">
                    Loading inventory table...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#F7F4EA]/70 italic">
                    No products found. Click "Add New Product" to populate your inventory.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1F6F50]/20 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.image_url ||
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                          }
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-white shrink-0 border border-[#DDE4DC]"
                        />
                        <div>
                          <span className="font-bold text-white block">{p.name}</span>
                          <span className="text-[10px] text-[#F7F4EA]/60 font-mono">
                            ID: {String(p.id ?? '').slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[#F7F4EA]">{p.brand || 'ShopAI'}</td>
                    <td className="p-4 font-black text-[#B7F34A]">${Number(p.price).toFixed(2)}</td>
                    <td className="p-4">
                      {p.discount_percent > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-[#B7F34A] text-[#12372A] font-extrabold text-[10px]">
                          -{p.discount_percent}%
                        </span>
                      ) : (
                        <span className="text-[#F7F4EA]/50">0%</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          p.stock <= 5 ? 'text-rose-400' : 'text-[#B7F34A]'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      {p.is_featured ? (
                        <span className="px-2 py-0.5 rounded bg-[#B7F34A]/20 text-[#B7F34A] text-[10px] font-bold border border-[#B7F34A]/30">
                          Yes
                        </span>
                      ) : (
                        <span className="text-[#F7F4EA]/50 text-[10px]">No</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-[#1F6F50]/40 hover:bg-[#1F6F50] text-[#B7F34A] transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#12372A]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#12372A] border border-[#1F6F50] rounded-2xl p-6 shadow-2xl space-y-4 my-8 text-[#F7F4EA]">
            <div className="flex justify-between items-center pb-3 border-b border-[#1F6F50]/40">
              <h3 className="font-bold text-white text-base">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#F7F4EA]/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-white mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Smart AI Wireless Headphones"
                  className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99.99"
                    className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Sony, Apple, Nike"
                    className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#12372A] border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed description..."
                  className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-xl text-white focus:border-[#B7F34A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded border-[#1F6F50] text-[#B7F34A]"
                />
                <label htmlFor="is_featured" className="font-bold text-white">
                  Featured Product (Showcase on Landing Page)
                </label>
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#B7F34A] text-[#12372A] font-extrabold shadow"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
