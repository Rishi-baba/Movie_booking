import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAdminMovies, createMovie, deleteMovie, resetMovieState } from '../../features/admin/adminMovieSlice';

const MovieManager = () => {
  const dispatch = useDispatch();
  const { movies, isLoading, isError, message } = useSelector((state) => state.adminMovie);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    formats: '2D, 3D',
    cast: '',
    poster: null
  });

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getAdminMovies());
    
    return () => {
      dispatch(resetMovieState());
    };
  }, [dispatch, isError, message]);

  const handleChange = (e) => {
    if (e.target.name === 'poster') {
      setFormData({ ...formData, poster: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.poster) return toast.error('Please upload a poster');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('duration', formData.duration);
    data.append('formats', formData.formats);
    data.append('cast', formData.cast);
    data.append('poster', formData.poster);

    dispatch(createMovie(data)).then((res) => {
      if (!res.error) {
        toast.success('Movie created successfully!');
        setShowForm(false);
        setFormData({ title: '', description: '', duration: '', formats: '2D, 3D', cast: '', poster: null });
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
        dispatch(deleteMovie(id)).then((res) => {
            if (!res.error) toast.success('Movie deleted');
        });
    }
  };

  return (
    <div>
      <h1>Movie Management</h1>
      
      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h2>Add New Movie</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input type="number" name="duration" className="form-input" value={formData.duration} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Formats (comma separated)</label>
                <input type="text" name="formats" className="form-input" value={formData.formats} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Cast (comma separated)</label>
                <input type="text" name="cast" className="form-input" value={formData.cast} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label className="form-label">Poster Image</label>
                <input type="file" name="poster" accept="image/*" className="form-input" onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Uploading...' : 'Save Movie'}
                </button>
                <button type="button" className="btn btn-danger" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2>All Movies</h2>
            {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add Movie</button>}
        </div>
        
        <div className="table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Poster</th>
                        <th>Title</th>
                        <th>Duration</th>
                        <th>Formats</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && movies.length === 0 ? (
                        <tr><td colSpan="5" className="skeleton" style={{ height: '50px' }}></td></tr>
                    ) : movies.length > 0 ? (
                        movies.map(movie => (
                            <tr key={movie._id}>
                                <td><img src={movie.poster?.url} alt="poster" style={{ width: '50px', borderRadius: '4px' }} /></td>
                                <td>{movie.title}</td>
                                <td>{movie.duration} min</td>
                                <td>{movie.formats.join(', ')}</td>
                                <td>
                                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDelete(movie._id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No movies found. Add one above!</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default MovieManager;
