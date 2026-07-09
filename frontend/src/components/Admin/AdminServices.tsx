import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminToast } from '../ui/AdminToast';
import { API_BASE_URL } from '../../config';

interface Service {
  id: number;
  title: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  highlights: string;
  imageName: string;
}

const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Dynamically compute categories from services
  const CATEGORIES = ["All Services", ...Array.from(new Set(services.map(s => s.category).filter(Boolean)))];
  
  const [currentService, setCurrentService] = useState<Partial<Service>>({
    title: '',
    category: CATEGORIES[0],
    description: '',
    price: '',
    duration: '',
    highlights: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchServices().then((fetchedServices) => {
      if (fetchedServices && fetchedServices.length > 0) {
        handleCategoryClick(CATEGORIES[0]);
      }
    });
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/services`);
      const data = await res.json();
      setServices(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch services", err);
      return [];
    }
  };

  const handleCategoryClick = (category: string) => {
    setShowForm(false);
    
    // Reset form for a new entry in this category
    setCurrentService({
      title: '',
      category: category === "All Services" ? "" : category,
      description: '',
      price: '',
      duration: '',
      highlights: '',
    });
    setIsEditing(false);
    setSelectedFile(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('service', JSON.stringify(currentService));
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const url = isEditing && currentService.id 
        ? `${API_BASE_URL}/api/services/${currentService.id}`
        : `${API_BASE_URL}/api/services`;
        
      const method = isEditing && currentService.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        if (!isEditing) {
          resetForm();
        }
        fetchServices();
        showToast(isEditing ? "Service updated successfully!" : "New service created successfully!");
      } else {
        console.error("Failed to save service");
        showToast("Failed to save service. Please try again.");
      }
    } catch (err) {
      console.error("Error saving service", err);
      showToast("An error occurred while saving the service.");
    }
  };

  const editService = (service: Service) => {
    setCurrentService(service);
    setIsEditing(true);
    setShowForm(true);
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setCurrentService({
      title: '',
      category: 'General',
      description: 'Nourishing and premium salon services tailored for you.',
      price: '',
      duration: '45 - 60 Mins',
      highlights: 'Premium Care, Professional Styling',
    });
    setIsEditing(false);
    setSelectedFile(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const filteredServices = services;

  return (
    <div className="w-full relative p-6 md:p-8">
      <AdminToast
        message={toastMessage || ''}
        isOpen={!!toastMessage}
        onClose={() => setToastMessage('')}
      />

      <div className="space-y-8">
        <div className="flex justify-between items-center bg-surface-dim/30 p-6 rounded-2xl border border-white/5">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Manage Services</h2>
            <p className="text-sm text-on-surface/60 mt-1">Update services offered in your salon.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-light rounded-2xl p-6 border border-white/10 shadow-luxury"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  {isEditing ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-2 text-on-surface/50 hover:text-white bg-surface rounded-full hover:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface/60 uppercase tracking-wider mb-2">Service Title</label>
                    <input 
                      required
                      type="text" 
                      value={currentService.title || ''}
                      onChange={e => setCurrentService({...currentService, title: e.target.value})}
                      className="w-full bg-background border border-on-surface/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                      placeholder="e.g. Signature Bridal Makeup"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface/60 uppercase tracking-wider mb-2">Price</label>
                    <input 
                      required
                      type="text" 
                      value={currentService.price || ''}
                      onChange={e => setCurrentService({...currentService, price: e.target.value})}
                      className="w-full bg-background border border-on-surface/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                      placeholder="e.g. ₹599+"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 flex gap-4">
                  <button type="submit" className="flex-1 md:flex-none px-8 py-4 bg-primary text-background font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <Save size={18} />
                    {isEditing ? 'Update Service' : 'Save New Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* Existing Services List */}
        {filteredServices.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 px-2">All Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map(service => (
                <div key={service.id} className="bg-surface rounded-2xl p-4 border border-white/5 flex items-center justify-between hover:border-primary/30 transition-colors group">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{service.title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-primary font-black tracking-widest text-sm">{service.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => editService(service)}
                      className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-background transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminServices;
