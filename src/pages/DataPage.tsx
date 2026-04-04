
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Plus, Search, Edit2, Trash2, Loader2, X, Check, Database, MapPin, Tag, FileText, IndianRupee, Hash, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dataService from '../services/dataService';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface Category {
  _id: string;
  name: string;
}

interface Dataset {
  _id: string;
  category: Category | string;
  name: string;
  description: string;
  location: string;
  price: number;
  totalRecords: number;
  link?: string;
}

export default function DataPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<Partial<Dataset> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDatasets();
    fetchCategories();
  }, []);

  const fetchDatasets = async () => {
    try {
      setIsLoading(true);
      const data = await dataService.getAllData();
      setDatasets(data);
    } catch (error) {
      toast.error('Failed to fetch datasets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {}
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const categoryId = (currentDataset?.category as any)?._id || currentDataset?.category;
      const payload = {
        category: categoryId,
        name: currentDataset?.name,
        description: currentDataset?.description,
        location: currentDataset?.location,
                        price: Math.round(Number(currentDataset?.price || 0) * 1.18), // Auto-add 18% GST (rounded)
                        totalRecords: currentDataset?.totalRecords,
                        link: currentDataset?.link,
                      };
                      console.log('Dataset Payload (inc. GST):', payload);
                
                      if (currentDataset?._id) {
        const updated = await dataService.updateData(currentDataset._id, payload);
        // Find category locally to maintain population
        const cat = categories.find(c => c._id === categoryId);
        const populated = { ...updated, category: cat || updated.category };
        
        setDatasets(prev => prev.map(d => d._id === updated._id ? populated : d));
        toast.success('Dataset updated successfully');
      } else {
        const created = await dataService.createData(payload);
        // Find category locally to maintain population
        const cat = categories.find(c => c._id === categoryId);
        const populated = { ...created, category: cat || created.category };

        setDatasets(prev => [populated, ...prev]);
        toast.success('Dataset created successfully');
      }
      setSearchTerm('');
      setIsModalOpen(false);
      setCurrentDataset(null);
    } catch (error) {
      console.error(error);
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
        await dataService.deleteData(id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Dataset has been removed.',
          icon: 'success',
          confirmButtonColor: '#f97316',
          customClass: {
            popup: 'rounded-[32px]',
            confirmButton: 'rounded-xl px-6 py-3 font-bold'
          }
        });
        fetchDatasets();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredDatasets = datasets.filter(d => 
    (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((d.category as any)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDatasets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDatasets.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <AdminLayout title="Manage Datasets">
      <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-[20px] py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium"
          />
        </div>
        <button
          onClick={() => { setCurrentDataset({ name: '', description: '', price: 0, location: '', totalRecords: 0, category: '', link: '' }); setIsModalOpen(true); }}
          className="bg-stone-900 text-white font-bold px-8 py-4 rounded-[20px] flex items-center gap-2 hover:bg-stone-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Add Dataset
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-stone-200 overflow-x-auto no-scrollbar-x">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Dataset Info</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Category</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Price (inc. GST)</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Download Link</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                    <span className="text-sm font-bold text-stone-400">Loading datasets...</span>
                  </div>
                </td>
              </tr>
            ) : filteredDatasets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <span className="text-sm font-bold text-stone-400">No datasets found.</span>
                </td>
              </tr>
            ) : (
              currentItems.map((dataset) => (
                <tr key={dataset._id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-stone-900">{dataset.name}</div>
                    <div className="text-xs text-stone-400 font-medium flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {dataset.location}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold ring-1 ring-orange-100">
                      {(dataset.category as any)?.name || (dataset.category as string) || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-stone-900 flex items-center gap-0.5 whitespace-nowrap">
                       ₹{dataset.price?.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-stone-400 font-bold">
                       Base: ₹{Math.round((dataset.price || 0) / 1.18)}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {dataset.link ? (
                      <a 
                        href={dataset.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 w-fit transition-all hover:translate-x-1"
                      >
                        <LinkIcon size={12} />
                        View Source
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-stone-300">No Link</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => { 
                          setCurrentDataset({ 
                            ...dataset, 
                            price: Math.round((dataset.price || 0) / 1.18) 
                          }); 
                          setIsModalOpen(true); 
                        }}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(dataset._id)}
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
          <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1 no-scrollbar">
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
              className="relative w-full max-w-2xl bg-white rounded-[32px] p-6 md:p-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-2xl font-black">{currentDataset?._id ? 'Edit' : 'Add'} Dataset</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Dataset Name</label>
                    <div className="relative">
                      <Database className="absolute left-4 top-4 text-stone-300" size={18} />
                      <input
                        type="text"
                        value={currentDataset?.name || ''}
                        onChange={(e) => setCurrentDataset(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold"
                        placeholder="e.g. Bangalore IT Companies"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-4 text-stone-300" size={18} />
                      <select
                        value={(currentDataset?.category as any)?._id || currentDataset?.category || ''}
                        onChange={(e) => setCurrentDataset(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold appearance-none"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-stone-300" size={18} />
                      <input
                        type="text"
                        value={currentDataset?.location || ''}
                        onChange={(e) => setCurrentDataset(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold"
                        placeholder="e.g. India"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Base Price (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-4 text-stone-300" size={18} />
                      <input
                        type="number"
                        value={currentDataset?.price || ''}
                        onChange={(e) => setCurrentDataset(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold"
                        placeholder="999"
                        required
                      />
                    </div>
                    {currentDataset?.price && currentDataset.price > 0 && (
                      <div className="text-[10px] font-bold text-emerald-600 pl-1 animate-pulse">
                        + 18% GST = ₹{Math.round(currentDataset.price * 1.18)} Total
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Total Records</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-4 text-stone-300" size={18} />
                      <input
                        type="number"
                        value={currentDataset?.totalRecords || ''}
                        onChange={(e) => setCurrentDataset(prev => ({ ...prev, totalRecords: Number(e.target.value) }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold"
                        placeholder="5000"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Download Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-4 text-stone-300" size={18} />
                      <input
                        type="url"
                        value={currentDataset?.link || ''}
                        onChange={(e) => setCurrentDataset(prev => ({ ...prev, link: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold"
                        placeholder="https://example.com/dataset"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-stone-300" size={18} />
                    <textarea
                      value={currentDataset?.description || ''}
                      onChange={(e) => setCurrentDataset(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold min-h-[120px]"
                      placeholder="Enter detailed description..."
                      required
                    />
                  </div>
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
                    {currentDataset?._id ? 'Update' : 'Create'} Dataset
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
