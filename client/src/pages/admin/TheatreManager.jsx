import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAdminTheatres, createTheatre, deleteTheatre, resetTheatreState } from '../../features/admin/adminTheatreSlice';
import { getAdminShows } from '../../features/admin/adminShowSlice';
import { getImageUrl } from '../../utils/helpers';
import api from '../../utils/api';

const TheatreManager = () => {
  const dispatch = useDispatch();
  const { theatres, isLoading, isError, message } = useSelector((state) => state.adminTheatre);
  const { shows } = useSelector((state) => state.adminShow);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', basePrice: '', logo: null });

  useEffect(() => {
    if (isError) toast.error(message);
    dispatch(getAdminTheatres());
    dispatch(getAdminShows());
    return () => dispatch(resetTheatreState());
  }, [dispatch, isError, message]);

  const handleChange = (e) => {
    if (e.target.name === 'logo') {
      setFormData({ ...formData, logo: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleEdit = (theatre) => {
    setFormData({
      name: theatre.name,
      location: theatre.location,
      basePrice: theatre.basePrice,
      logo: null // Require re-upload if they want to change it
    });
    setEditingId(theatre._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('location', formData.location);
    data.append('basePrice', formData.basePrice);
    if (formData.logo) {
      data.append('logo', formData.logo);
    }

    if (editingId) {
      try {
        await api.put(`/admin/theatres/${editingId}`, data);
        toast.success('Theatre updated successfully!');
        dispatch(getAdminTheatres());
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', location: '', basePrice: '', logo: null });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error updating theatre');
      }
    } else {
      dispatch(createTheatre(data)).then((res) => {
        if (!res.error) {
          toast.success('Theatre created!');
          setShowForm(false);
          setFormData({ name: '', location: '', basePrice: '', logo: null });
        }
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this theatre?')) {
        dispatch(deleteTheatre(id)).then((res) => { if (!res.error) toast.success('Theatre deleted'); });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Theatre Management</h1>
      
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">{editingId ? 'Edit Theatre' : 'Add New Theatre'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
              <div className="form-group mb-0">
                  <label className="form-label">Name</label>
                  <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group mb-0">
                  <label className="form-label">Location</label>
                  <input type="text" name="location" className="form-input" value={formData.location} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
              <div className="form-group mb-0">
                  <label className="form-label">Base Price (₹)</label>
                  <input type="number" name="basePrice" className="form-input" value={formData.basePrice} onChange={handleChange} required />
              </div>
              <div className="form-group mb-0">
                  <label className="form-label">Theatre Logo {editingId && '(Leave empty to keep existing)'}</label>
                  <input type="file" name="logo" accept="image/*" className="form-input" onChange={handleChange} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button type="submit" className="bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Theatre'}</button>
                <button type="button" className="bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">All Theatres</h2>
            {!showForm && <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors" onClick={() => { setFormData({ name: '', location: '', basePrice: '', logo: null }); setEditingId(null); setShowForm(true); }}>+ Add Theatre</button>}
        </div>
        
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Logo</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Name</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Location</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Base Price</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Playing Movies</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && theatres.length === 0 ? (
                        <tr><td colSpan="6" className="skeleton h-[50px]"></td></tr>
                    ) : theatres.length > 0 ? (
                        theatres.map(theatre => {
                            // Find unique movies playing here
                            const moviesHere = shows.filter(s => s.theatreId?._id === theatre._id || s.theatreId === theatre._id);
                            const uniqueMovieTitles = [...new Set(moviesHere.map(s => s.movieId?.title))].filter(Boolean);

                            return (
                              <tr key={theatre._id} className="hover:bg-gray-50/50">
                                  <td className="p-4 border-b border-gray-100">
                                    {theatre.logo && getImageUrl(theatre.logo) ? (
                                      <img src={getImageUrl(theatre.logo)} alt="logo" className="w-[40px] h-[40px] rounded-full object-cover bg-gray-100" />
                                    ) : (
                                      <div className="w-[40px] h-[40px] rounded-full bg-gray-100 flex items-center justify-center text-xs">N/A</div>
                                    )}
                                  </td>
                                  <td className="p-4 border-b border-gray-100 font-medium text-gray-900">{theatre.name}</td>
                                  <td className="p-4 border-b border-gray-100">{theatre.location}</td>
                                  <td className="p-4 border-b border-gray-100">₹{theatre.basePrice}</td>
                                  <td className="p-4 border-b border-gray-100 text-sm text-gray-500">
                                    {uniqueMovieTitles.length > 0 ? uniqueMovieTitles.join(', ') : 'None'}
                                  </td>
                                  <td className="p-4 border-b border-gray-100">
                                    <div className="flex gap-2">
                                      <button className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors" onClick={() => handleEdit(theatre)}>Edit</button>
                                      <button className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors" onClick={() => handleDelete(theatre._id)}>Delete</button>
                                    </div>
                                  </td>
                              </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-500 border-b border-gray-100">No theatres found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default TheatreManager;
