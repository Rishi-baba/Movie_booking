import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAdminShows, createShow, deleteShow, resetShowState } from '../../features/admin/adminShowSlice';
import { getAdminMovies } from '../../features/admin/adminMovieSlice';
import { getAdminTheatres } from '../../features/admin/adminTheatreSlice';

const ShowManager = () => {
  const dispatch = useDispatch();
  const { shows, isLoading, isError, message } = useSelector((state) => state.adminShow);
  const { movies } = useSelector((state) => state.adminMovie);
  const { theatres } = useSelector((state) => state.adminTheatre);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ movieId: '', theatreId: '', date: '', time: '', format: '2D', priceMultiplier: 1.0, screenType: 'Curved' });

  useEffect(() => {
    if (isError) toast.error(message);
    dispatch(getAdminShows());
    dispatch(getAdminMovies());
    dispatch(getAdminTheatres());
    return () => dispatch(resetShowState());
  }, [dispatch, isError, message]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createShow(formData)).then((res) => {
      if (!res.error) {
        toast.success('Show created!');
        setShowForm(false);
        setFormData({ movieId: '', theatreId: '', date: '', time: '', format: '2D', priceMultiplier: 1.0, screenType: 'Curved' });
        // Refresh shows to get populated fields
        dispatch(getAdminShows()); 
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this show?')) {
        dispatch(deleteShow(id)).then((res) => { if (!res.error) toast.success('Show deleted'); });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Show Management</h1>
      
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Add New Show</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
              <div className="form-group mb-0">
                  <label className="form-label">Movie</label>
                  <select name="movieId" className="form-input" value={formData.movieId} onChange={handleChange} required>
                      <option value="">Select Movie</option>
                      {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                  </select>
              </div>
              <div className="form-group mb-0">
                  <label className="form-label">Theatre</label>
                  <select name="theatreId" className="form-input" value={formData.theatreId} onChange={handleChange} required>
                      <option value="">Select Theatre</option>
                      {theatres.map(t => <option key={t._id} value={t._id}>{t.name} ({t.location})</option>)}
                  </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                <div className="form-group mb-0">
                    <label className="form-label">Date</label>
                    <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="form-group mb-0">
                    <label className="form-label">Time</label>
                    <input type="time" name="time" className="form-input" value={formData.time} onChange={handleChange} required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4">
                <div className="form-group mb-0">
                    <label className="form-label">Format</label>
                    <input type="text" name="format" className="form-input" value={formData.format} onChange={handleChange} required />
                </div>
                <div className="form-group mb-0">
                    <label className="form-label">Screen Type</label>
                    <select name="screenType" className="form-input" value={formData.screenType} onChange={handleChange} required>
                        <option value="Curved">Curved</option>
                        <option value="Plain">Plain</option>
                    </select>
                </div>
                <div className="form-group mb-0">
                    <label className="form-label">Price Multiplier</label>
                    <input type="number" step="0.1" name="priceMultiplier" className="form-input" value={formData.priceMultiplier} onChange={handleChange} required />
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button type="submit" className="bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Show'}</button>
                <button type="button" className="bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">All Shows</h2>
            {!showForm && <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors" onClick={() => setShowForm(true)}>+ Add Show</button>}
        </div>
        
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Movie</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Theatre</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Date & Time</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Format</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && shows.length === 0 ? (
                        <tr><td colSpan="5" className="skeleton h-[50px]"></td></tr>
                    ) : shows.length > 0 ? (
                        shows.map(show => (
                            <tr key={show._id} className="hover:bg-gray-50/50">
                                <td className="p-4 border-b border-gray-100 font-medium text-gray-900">{show.movieId?.title || 'Deleted Movie'}</td>
                                <td className="p-4 border-b border-gray-100">{show.theatreId?.name || 'Deleted Theatre'}</td>
                                <td className="p-4 border-b border-gray-100">{new Date(show.date).toLocaleDateString()} @ {show.time}</td>
                                <td className="p-4 border-b border-gray-100">{show.format} <span className="text-gray-400 text-xs">(x{show.priceMultiplier})</span></td>
                                <td className="p-4 border-b border-gray-100">
                                    <button className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors" onClick={() => handleDelete(show._id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500 border-b border-gray-100">No shows found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ShowManager;
