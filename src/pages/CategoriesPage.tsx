
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Plus, Search, Edit2, Trash2, Loader2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface Category {
  _id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory?.name) return;

    setIsSubmitting(true);
    try {
      if (currentCategory._id) {
        const updated = await categoryService.updateCategory(currentCategory._id, {
          name: currentCategory.name,
        });
        setCategories(prev => prev.map(c => c._id === updated._id ? updated : c));
        toast.success('Category updated successfully');
      } else {
        const created = await categoryService.createCategory({
          name: currentCategory.name,
        });
        setCategories(prev => [created, ...prev]);
        toast.success('Category created successfully');
      }
      setSearchTerm('');
      setIsModalOpen(false);
      setCurrentCategory(null);
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-[32px]',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold'
      }
    });

    if (result.isConfirmed) {
      try {
        await categoryService.deleteCategory(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Category has been removed.',
          icon: 'success',
          confirmButtonColor: '#f97316',
          customClass: {
            popup: 'rounded-[32px]',
            confirmButton: 'rounded-xl px-6 py-3 font-bold'
          }
        });
        fetchCategories();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <AdminLayout title="Manage Categories">
      <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-[20px] py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium"
          />
        </div>
        <button
          onClick={() => { setCurrentCategory({ name: '' }); setIsModalOpen(true); }}
          className="bg-stone-900 text-white font-bold px-8 py-4 rounded-[20px] flex items-center gap-2 hover:bg-stone-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-stone-200 overflow-x-auto no-scrollbar-x">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Category Name</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              <tr>
                <td colSpan={2} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                    <span className="text-sm font-bold text-stone-400">Loading categories...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-8 py-20 text-center">
                  <span className="text-sm font-bold text-stone-400">No categories found.</span>
                </td>
              </tr>
            ) : (
              currentItems.map((category) => (
                <tr key={category._id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-stone-900">{category.name}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => { setCurrentCategory(category); setIsModalOpen(true); }}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category._id)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-10 px-4 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <div className="flex items-center gap-2 overflow-x-auto max-w-[200px] md:max-w-md px-2 py-1 no-scrollbar">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-10 w-10 flex-shrink-0 rounded-xl font-bold transition-all ${
                  currentPage === i + 1
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-10 px-4 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] p-6 md:p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-2xl font-black">{currentCategory?._id ? 'Edit' : 'Add'} Category</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Category Name</label>
                  <input
                    type="text"
                    value={currentCategory?.name || ''}
                    onChange={(e) => setCurrentCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold"
                    placeholder="e.g. Real Estate"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-stone-100 text-stone-500 font-bold py-4 rounded-2xl hover:bg-stone-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-600 text-white font-bold py-4 rounded-2xl hover:bg-orange-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    {currentCategory?._id ? 'Update' : 'Create'} Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
