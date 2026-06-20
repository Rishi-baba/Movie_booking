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
  const [formData, setFormData] = useState({ movieId: '', theatreId: '', date: '', time: '', format: '2D', priceMultiplier: 1.0 });

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
        setFormData({ movieId: '', theatreId: '', date: '', time: '', format: '2D', priceMultiplier: 1.0 });
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
    <div>
      <h1>Show Management</h1>
      
      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h2>Add New Show</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Movie</label>
                <select name="movieId" className="form-input" value={formData.movieId} onChange={handleChange} required>
                    <option value="">Select Movie</option>
                    {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Theatre</label>
                <select name="theatreId" className="form-input" value={formData.theatreId} onChange={handleChange} required>
                    <option value="">Select Theatre</option>
                    {theatres.map(t => <option key={t._id} value={t._id}>{t.name} ({t.location})</option>)}
                </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Date</label>
                    <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Time</label>
                    <input type="time" name="time" className="form-input" value={formData.time} onChange={handleChange} required />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Format</label>
                    <input type="text" name="format" className="form-input" value={formData.format} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Price Multiplier</label>
                    <input type="number" step="0.1" name="priceMultiplier" className="form-input" value={formData.priceMultiplier} onChange={handleChange} required />
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Show'}</button>
                <button type="button" className="btn btn-danger" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2>All Shows</h2>
            {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add Show</button>}
        </div>
        
        <div className="table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Movie</th>
                        <th>Theatre</th>
                        <th>Date & Time</th>
                        <th>Format</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && shows.length === 0 ? (
                        <tr><td colSpan="5" className="skeleton" style={{ height: '50px' }}></td></tr>
                    ) : shows.length > 0 ? (
                        shows.map(show => (
                            <tr key={show._id}>
                                <td>{show.movieId?.title || 'Deleted Movie'}</td>
                                <td>{show.theatreId?.name || 'Deleted Theatre'}</td>
                                <td>{new Date(show.date).toLocaleDateString()} @ {show.time}</td>
                                <td>{show.format} (x{show.priceMultiplier})</td>
                                <td><button className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDelete(show._id)}>Delete</button></td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No shows found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ShowManager;
