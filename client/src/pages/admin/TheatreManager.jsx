import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAdminTheatres, createTheatre, deleteTheatre, resetTheatreState } from '../../features/admin/adminTheatreSlice';

const TheatreManager = () => {
  const dispatch = useDispatch();
  const { theatres, isLoading, isError, message } = useSelector((state) => state.adminTheatre);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', basePrice: '' });

  useEffect(() => {
    if (isError) toast.error(message);
    dispatch(getAdminTheatres());
    return () => dispatch(resetTheatreState());
  }, [dispatch, isError, message]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createTheatre(formData)).then((res) => {
      if (!res.error) {
        toast.success('Theatre created!');
        setShowForm(false);
        setFormData({ name: '', location: '', basePrice: '' });
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this theatre?')) {
        dispatch(deleteTheatre(id)).then((res) => { if (!res.error) toast.success('Theatre deleted'); });
    }
  };

  return (
    <div>
      <h1>Theatre Management</h1>
      
      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h2>Add New Theatre</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" name="location" className="form-input" value={formData.location} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Base Price ($)</label>
                <input type="number" name="basePrice" className="form-input" value={formData.basePrice} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Theatre'}</button>
                <button type="button" className="btn btn-danger" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2>All Theatres</h2>
            {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add Theatre</button>}
        </div>
        
        <div className="table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Base Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && theatres.length === 0 ? (
                        <tr><td colSpan="4" className="skeleton" style={{ height: '50px' }}></td></tr>
                    ) : theatres.length > 0 ? (
                        theatres.map(theatre => (
                            <tr key={theatre._id}>
                                <td>{theatre.name}</td>
                                <td>{theatre.location}</td>
                                <td>${theatre.basePrice}</td>
                                <td><button className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDelete(theatre._id)}>Delete</button></td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No theatres found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default TheatreManager;
