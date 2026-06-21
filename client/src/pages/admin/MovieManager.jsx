import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAdminMovies, createMovie, updateMovie, deleteMovie, resetMovieState } from '../../features/admin/adminMovieSlice';
import { getImageUrl } from '../../utils/helpers';

const MovieManager = () => {
  const dispatch = useDispatch();
  const { movies, isLoading, isError, message } = useSelector((state) => state.adminMovie);
  
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(null); // Will store movie ID if editing
  const initialFormState = {
    title: '',
    description: '',
    duration: '',
    formats: '2D, 3D',
    genre: '',
    releaseDate: '',
    rating: '',
    certificate: 'U/A',
    status: 'Now Showing',
    poster: null,
    banner: null
  };
  const [formData, setFormData] = useState(initialFormState);

  const [castList, setCastList] = useState([{ name: '', role: '', image: '' }]);

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
    if (e.target.name === 'poster' || e.target.name === 'banner') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleCastChange = (index, field, value) => {
    const newCast = [...castList];
    newCast[index][field] = value;
    setCastList(newCast);
  };

  const addCastMember = () => setCastList([...castList, { name: '', role: '', image: '' }]);
  const removeCastMember = (index) => setCastList(castList.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editMode && !formData.poster) return toast.error('Please upload a poster');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('duration', formData.duration);
    data.append('formats', formData.formats);
    data.append('genre', formData.genre);
    data.append('releaseDate', formData.releaseDate);
    data.append('rating', formData.rating);
    data.append('certificate', formData.certificate);
    data.append('status', formData.status);
    data.append('cast', JSON.stringify(castList.filter(c => c.name)));
    
    if (formData.poster) data.append('poster', formData.poster);
    if (formData.banner) data.append('banner', formData.banner);

    if (editMode) {
        dispatch(updateMovie({ id: editMode, movieData: data })).then((res) => {
          if (!res.error) {
            toast.success('Movie updated successfully!');
            setShowForm(false);
            setEditMode(null);
            setFormData(initialFormState);
            setCastList([{ name: '', role: '', image: '' }]);
          }
        });
    } else {
        dispatch(createMovie(data)).then((res) => {
          if (!res.error) {
            toast.success('Movie created successfully!');
            setShowForm(false);
            setFormData(initialFormState);
            setCastList([{ name: '', role: '', image: '' }]);
          }
        });
    }
  };

  const handleEditClick = (movie) => {
    setEditMode(movie._id);
    setFormData({
        title: movie.title || '',
        description: movie.description || '',
        duration: movie.duration || '',
        formats: movie.formats ? movie.formats.join(', ') : '2D',
        genre: movie.genre ? movie.genre.join(', ') : '',
        releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
        rating: movie.rating || '',
        certificate: movie.certificate || 'U/A',
        status: movie.status || 'Now Showing',
        poster: null,
        banner: null
    });
    setCastList(movie.cast && movie.cast.length > 0 ? movie.cast : [{ name: '', role: '', image: '' }]);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditMode(null);
    setFormData(initialFormState);
    setCastList([{ name: '', role: '', image: '' }]);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
        dispatch(deleteMovie(id)).then((res) => {
            if (!res.error) toast.success('Movie deleted');
        });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Movie Management</h1>
      
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Add New Movie</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
              <div className="form-group mb-0">
                  <label className="form-label">Duration (minutes)</label>
                  <input type="number" name="duration" className="form-input" value={formData.duration} onChange={handleChange} required />
              </div>
              <div className="form-group mb-0">
                  <label className="form-label">Rating (0 - 10)</label>
                  <input type="number" step="0.1" name="rating" className="form-input" value={formData.rating} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
              <div className="form-group">
                  <label className="form-label">Formats (comma separated)</label>
                  <input type="text" name="formats" className="form-input" value={formData.formats} onChange={handleChange} required />
              </div>
              <div className="form-group">
                  <label className="form-label">Certificate</label>
                  <select name="certificate" className="form-input" value={formData.certificate} onChange={handleChange}>
                    <option value="U">U</option>
                    <option value="U/A">U/A</option>
                    <option value="A">A</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                  </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
              <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-input" value={formData.status} onChange={handleChange}>
                    <option value="Now Showing">Now Showing</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
              </div>
              <div className="form-group">
                  <label className="form-label">Release Date</label>
                  <input type="date" name="releaseDate" className="form-input" value={formData.releaseDate} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 mb-4">
              <div className="form-group">
                  <label className="form-label">Genre (comma separated)</label>
                  <input type="text" name="genre" className="form-input" value={formData.genre} onChange={handleChange} placeholder="Action, Sci-Fi" required />
              </div>
            </div>

            <div className="form-group border border-gray-200 p-4 rounded-lg mb-4">
                <label className="flex items-center justify-between mb-4 font-medium text-gray-900">
                  <span>Cast Members</span>
                  <button type="button" onClick={addCastMember} className="bg-primary text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">+ Add Cast</button>
                </label>
                {castList.map((cast, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 mb-3 items-center">
                    <input type="text" placeholder="Actor Name" className="form-input w-full sm:w-auto flex-1" value={cast.name} onChange={(e) => handleCastChange(index, 'name', e.target.value)} required />
                    <input type="text" placeholder="Role Name" className="form-input w-full sm:w-auto flex-1" value={cast.role} onChange={(e) => handleCastChange(index, 'role', e.target.value)} required />
                    <input type="url" placeholder="Image URL" className="form-input w-full sm:w-auto flex-1" value={cast.image} onChange={(e) => handleCastChange(index, 'image', e.target.value)} required />
                    {castList.length > 1 && (
                      <button type="button" onClick={() => removeCastMember(index)} className="bg-red-500 hover:bg-red-600 text-white p-2 sm:px-4 sm:py-2 rounded-md w-full sm:w-auto">X</button>
                    )}
                  </div>
                ))}
            </div>

            <div className="form-group">
                <label className="form-label">Poster Image {!editMode && '(Required)'}</label>
                <input type="file" name="poster" accept="image/*" className="form-input" onChange={handleChange} required={!editMode} />
            </div>

            <div className="form-group">
                <label className="form-label">Banner Image (Optional)</label>
                <input type="file" name="banner" accept="image/*" className="form-input" onChange={handleChange} />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button type="submit" className="bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto" disabled={isLoading}>
                    {isLoading ? 'Uploading...' : editMode ? 'Update Movie' : 'Save Movie'}
                </button>
                <button type="button" className="bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto" onClick={cancelForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">All Movies</h2>
            {!showForm && <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors" onClick={() => setShowForm(true)}>+ Add Movie</button>}
        </div>
        
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Poster</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Title</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Release</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Duration</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Certificate</th>
                        <th className="p-4 text-sm font-semibold text-gray-500 border-b border-gray-100">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && movies.length === 0 ? (
                        <tr><td colSpan="6" className="skeleton h-[50px]"></td></tr>
                    ) : movies.length > 0 ? (
                        movies.map(movie => (
                            <tr key={movie._id} className="hover:bg-gray-50/50">
                                <td className="p-4 border-b border-gray-100"><img src={getImageUrl(movie.poster)} alt="poster" className="w-[50px] rounded" /></td>
                                <td className="p-4 border-b border-gray-100">
                                  <div className="font-semibold text-gray-900">{movie.title}</div>
                                  <div className="text-sm text-gray-500">{movie.genre?.join(', ')} • Rating: {movie.rating}</div>
                                </td>
                                <td className="p-4 border-b border-gray-100">{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="p-4 border-b border-gray-100">{movie.duration} min</td>
                                <td className="p-4 border-b border-gray-100">
                                  <span className="inline-block px-2 py-1 border border-gray-200 rounded text-xs font-bold mb-1">{movie.certificate || 'U/A'}</span>
                                  <span className={`block text-xs font-medium ${movie.status === 'Coming Soon' ? 'text-amber-500' : 'text-emerald-500'}`}>{movie.status || 'Now Showing'}</span>
                                </td>
                                <td className="p-4 border-b border-gray-100">
                                    <div className="flex gap-2">
                                      <button className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors" onClick={() => handleEditClick(movie)}>Edit</button>
                                      <button className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors" onClick={() => handleDelete(movie._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-500 border-b border-gray-100">No movies found. Add one above!</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default MovieManager;
