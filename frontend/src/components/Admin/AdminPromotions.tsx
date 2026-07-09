import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from '../ui/ConfirmModal';
import { AdminToast } from '../ui/AdminToast';
import { API_BASE_URL as CONFIG_API_BASE_URL } from "../../config";

interface Promotion {
  id: number;
  isActive: boolean;
  tagText: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  offerTag: string;
  offerTitle: string;
  discountValue: string;
  discountSuffix: string;
  features: string;
  imageName: string;
}

const API_BASE_URL = `${CONFIG_API_BASE_URL}/api/promotions`;
const UPLOAD_URL = `${CONFIG_API_BASE_URL}/api/promotions/upload`;
const GALLERY_IMAGE_URL = `${CONFIG_API_BASE_URL}/api/gallery/images`;

const defaultPromotion: Promotion = {
  id: 0,
  isActive: true,
  tagText: "Exclusive Loyalty Reward",
  titlePart1: "Bridal",
  titlePart2: "Makeup Offer",
  description: "A special celebration of our regular clients. Experience the peak of bridal artistry with an exclusive reward.",
  offerTag: "Limited Time",
  offerTitle: "Loyalty Benefit",
  discountValue: "20%",
  discountSuffix: "OFF",
  features: "Exclusive for Regular Customers, Complete Bridal Transformation",
  imageName: ""
};

const mapToCamel = (data: any): Promotion => ({
  id: data.id,
  isActive: data.is_active ?? data.isActive,
  tagText: data.tag_text ?? data.tagText,
  titlePart1: data.title_part1 ?? data.titlePart1,
  titlePart2: data.title_part2 ?? data.titlePart2,
  description: data.description,
  offerTag: data.offer_tag ?? data.offerTag,
  offerTitle: data.offer_title ?? data.offerTitle,
  discountValue: data.discount_value ?? data.discountValue,
  discountSuffix: data.discount_suffix ?? data.discountSuffix,
  features: data.features,
  imageName: data.image_name ?? data.imageName,
});

const mapToSnake = (data: any) => ({
  id: data.id,
  is_active: data.isActive,
  tag_text: data.tagText,
  title_part1: data.titlePart1,
  title_part2: data.titlePart2,
  description: data.description,
  offer_tag: data.offerTag,
  offer_title: data.offerTitle,
  discount_value: data.discountValue,
  discount_suffix: data.discountSuffix,
  features: data.features,
  image_name: data.imageName,
});

const LoadedImage = ({ 
  src, 
  alt, 
  className, 
  wrapperClassName = "w-full h-full" 
}: { 
  src: string; 
  alt: string; 
  className: string; 
  wrapperClassName?: string; 
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-surface-light animate-pulse flex items-center justify-center">
           <span className="text-xs text-on-surface/30 font-bold uppercase tracking-widest">Loading Media...</span>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} transition-opacity duration-1000 ${loaded ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'}`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
};


const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [currentPromo, setCurrentPromo] = useState<Partial<Promotion>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, isOpen: true });
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch promotions");
      const data = await response.json();
      
      if (data && data.length > 0) {
        setPromotions(data.map(mapToCamel));
      } else {
        // Show default data if DB is empty
        setPromotions([defaultPromotion]);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback to default data on network error
      setPromotions([defaultPromotion]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentPromo({
      isActive: false,
      tagText: "",
      titlePart1: "",
      titlePart2: "",
      description: "",
      offerTag: "",
      offerTitle: "",
      discountValue: "",
      discountSuffix: "",
      features: "",
      imageName: ""
    });
    setSelectedFile(null);
    setIsEditing(true);
  };

  const handleEdit = (promo: Promotion) => {
    setCurrentPromo(promo);
    setSelectedFile(null);
    setIsEditing(true);
  };

  const confirmDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setItemToDelete(null);
      fetchPromotions();
      showToast("Offer deleted successfully!");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      const updatedPromo = { ...promo, isActive: !promo.isActive };
      const response = await fetch(`${API_BASE_URL}/${promo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapToSnake(updatedPromo))
      });
      if (!response.ok) throw new Error("Failed to update status");
      fetchPromotions();
      showToast("Offer status updated successfully!");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalImageName = currentPromo.imageName;

      // Upload image if a new file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch(UPLOAD_URL, {
          method: "POST",
          body: formData
        });
        if (!uploadRes.ok) throw new Error("Failed to upload image");
        finalImageName = await uploadRes.text();
      }

      const promoToSave = { ...currentPromo, imageName: finalImageName };

      const method = promoToSave.id ? "PUT" : "POST";
      const url = promoToSave.id ? `${API_BASE_URL}/${promoToSave.id}` : API_BASE_URL;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapToSnake(promoToSave))
      });

      if (!response.ok) throw new Error("Failed to save promotion");
      
      setIsEditing(false);
      fetchPromotions();
      showToast(promoToSave.id ? "Offer updated successfully!" : "New offer created successfully!");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="text-on-surface/60 p-8 text-center animate-pulse">Loading promotions...</div>;
  if (error) return <div className="text-red-400 bg-red-900/20 p-4 rounded-xl border border-red-500/20">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface-dim/30 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Manage Offers</h2>
          <p className="text-sm text-on-surface/60 mt-1">Create and manage your special offers and discounts.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface-light rounded-2xl p-6 border border-white/10 shadow-luxury"
          >
            <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
              <Gift size={20} />
              {currentPromo.id ? "Edit Offer" : "Create New Offer"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-on-surface/60 uppercase tracking-wider block">Offer Title (Static)</label>
                  <div className="w-full bg-background/50 border border-white/5 rounded-xl px-4 py-3 text-on-surface/80 font-medium">
                    {currentPromo.titlePart1} {currentPromo.titlePart2} {currentPromo.offerTitle ? `(${currentPromo.offerTitle})` : ''}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface/60 uppercase tracking-wider">Discount Value</label>
                    <input type="text" value={currentPromo.discountValue || ""} onChange={e => setCurrentPromo({...currentPromo, discountValue: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 font-bold text-primary outline-none focus:border-primary transition-colors" placeholder="e.g. 20%" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface/60 uppercase tracking-wider">Discount Suffix</label>
                    <input type="text" value={currentPromo.discountSuffix || ""} onChange={e => setCurrentPromo({...currentPromo, discountSuffix: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors" placeholder="e.g. OFF" />
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface/60 uppercase tracking-wider">Features (Comma Separated)</label>
                  <input type="text" value={currentPromo.features || ""} onChange={e => setCurrentPromo({...currentPromo, features: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors" placeholder="Feature 1, Feature 2" />
                </div> */}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-on-surface/60 uppercase tracking-wider">Offer Background Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:transition-colors cursor-pointer" 
                  />
                  
                  {/* Image Preview */}
                  <div className="mt-4 flex justify-center">
                    {selectedFile ? (
                      <div className="relative inline-block">
                        <LoadedImage 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="New preview" 
                          wrapperClassName="inline-block"
                          className="max-h-64 md:max-h-80 w-auto rounded-xl object-contain border border-on-surface/10 bg-on-surface/5 shadow-md block"
                        />
                        <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
                          NEW
                        </span>
                      </div>
                    ) : currentPromo.imageName ? (
                      <div className="relative inline-block">
                        <LoadedImage 
                          src={`${GALLERY_IMAGE_URL}/${currentPromo.imageName.replace(/"/g, '')}`} 
                          alt="Current image" 
                          wrapperClassName="inline-block"
                          className="max-h-64 md:max-h-80 w-auto rounded-xl object-contain border border-on-surface/10 bg-on-surface/5 shadow-md block"
                        />
                        <p className="text-xs text-on-surface/50 mt-2 text-center">Current image will be kept if no new file is selected.</p>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2 flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={currentPromo.isActive || false}
                    onChange={e => setCurrentPromo({...currentPromo, isActive: e.target.checked})}
                    className="w-5 h-5 rounded bg-surface border-white/20 text-primary focus:ring-primary focus:ring-offset-surface-dim"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-on-surface">Set as Active Offer (will deactivate others)</label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-full font-bold text-on-surface/60 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="btn-premium flex items-center gap-2 min-w-[120px] justify-center">
                  {isUploading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <Check size={18} />}
                  {isUploading ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-on-surface/40 bg-surface-dim/20 rounded-2xl border border-white/5 border-dashed">
                <Gift size={48} className="mx-auto mb-4 opacity-20" />
                <p>No offers added yet. Click 'New Offer' to create one.</p>
              </div>
            ) : (
              promotions.map(promo => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative bg-surface rounded-2xl ${promo.isActive ? 'border-2 border-primary shadow-[0_10px_30px_rgba(201,162,74,0.15)]' : 'border border-on-surface/10'}`}
                >
                  <div className={`relative bg-surface-dim rounded-t-2xl overflow-hidden ${promo.imageName ? 'min-h-[200px]' : 'h-48'}`}>
                    {promo.imageName ? (
                      <LoadedImage src={`${GALLERY_IMAGE_URL}/${promo.imageName.replace(/"/g, '')}`} alt="Offer background" className="w-full h-auto block min-h-[200px] object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface/20">
                        <ImageIcon size={48} />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-primary">{promo.discountValue}</span>
                        <span className="text-sm font-bold text-on-surface/50">{promo.discountSuffix}</span>
                      </div>
                      <button 
                        onClick={() => handleToggleActive(promo)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${promo.isActive ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-dim text-on-surface/40 hover:text-on-surface'}`}
                      >
                        {promo.isActive ? 'Active' : 'Set Active'}
                      </button>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">{promo.titlePart1} {promo.titlePart2}</h4>
                      {promo.offerTitle && <p className="text-xs text-primary/80 font-medium mt-0.5">{promo.offerTitle}</p>}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-xs text-on-surface/40 font-medium">Offer #{promo.id}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(promo)} className="p-2 rounded-lg bg-surface hover:bg-white/10 text-on-surface/60 hover:text-white transition-colors shadow-sm" title="Edit">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={itemToDelete !== null}
        message="Are you sure you want to delete this promotion? This action cannot be undone."
        onConfirm={() => {
          if (itemToDelete !== null) {
            confirmDelete(itemToDelete);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />

      <AdminToast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminPromotions;
