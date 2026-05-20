import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

function Admin() {
  const [media, setMedia] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('photo');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [inputKey, setInputKey] = useState(Date.now());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMedia(data);
      } else {
        console.error('Invalid data format received:', data);
        setMedia([]);
      }
    } catch (err) {
      console.error('Failed to fetch media', err);
      setMedia([]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      setFileSizeStr('');
      return;
    }

    const sizeInMB = selectedFile.size / (1024 * 1024);
    
    if ((type === 'photo' || type === 'about_image') && sizeInMB > 50) {
      toast.error('Image size must be no more than 50 MB');
      e.target.value = '';
      setFile(null);
      setPreviewUrl(null);
      setFileSizeStr('');
      return;
    }

    if (type === 'video' && sizeInMB > 10) {
      toast.error('Video size must be no more than 10 MB');
      e.target.value = '';
      setFile(null);
      setPreviewUrl(null);
      setFileSizeStr('');
      return;
    }

    setFile(selectedFile);
    setFileSizeStr(sizeInMB.toFixed(2) + ' MB');
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const clearSelection = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileSizeStr('');
    setInputKey(Date.now());
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    clearSelection();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('file', file);

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/media');
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      toast.success('Media uploaded successfully');
      setTitle('');
      if (type === 'about_image') {
        setType('photo');
      }
      clearSelection();
      fetchMedia();
    } catch (err) {
      console.error('Upload error', err);
      toast.error('Upload failed');
    }
    setLoading(false);
    setUploadProgress(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Media deleted successfully');
        fetchMedia();
      }
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Delete failed');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === 'admin' && loginPass === 'shivangiadmin') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      toast.success('Logged in successfully');
    } else {
      toast.error('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    toast.success('Logged out');
  };

  const toasterConfig = {
    position: "top-right",
    toastOptions: {
      style: {
        background: '#201f1f',
        color: '#e5e2e1',
        border: '1px solid rgba(233, 195, 73, 0.2)',
      },
      success: {
        iconTheme: {
          primary: '#d4af37',
          secondary: '#131313',
        },
      },
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#e5e2e1] font-sans flex items-center justify-center p-8">
        <Toaster {...toasterConfig} />
        <div className="bg-[#1c1b1b] p-8 rounded-2xl border border-outline-variant/10 shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-serif italic text-[#d4af37] mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-outline">Username</label>
              <input 
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl p-4 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-outline">Password</label>
              <input 
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl p-4 outline-none" 
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#d4af37] text-[#131313] py-4 rounded-xl font-bold hover:bg-[#f2ca50] transition-all"
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => window.location.href = '/'}
              className="w-full text-center text-sm uppercase tracking-widest text-outline hover:text-[#d4af37] transition-colors"
            >
              Back to Site
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] font-sans p-8">
      <Toaster {...toasterConfig} />
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif italic text-[#d4af37]">Admin Panel</h1>
          <div className="flex gap-4">
            <button 
              onClick={handleLogout}
              className="text-sm uppercase tracking-widest text-outline border border-outline-variant/20 px-4 py-2 rounded-full hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
            >
              Logout
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="text-sm uppercase tracking-widest text-outline border border-outline-variant/20 px-4 py-2 rounded-full hover:bg-primary/10 transition-all"
            >
              Back to Site
            </button>
          </div>
        </header>

        <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-lg mb-12">
          <h2 className="text-2xl font-serif italic mb-6">Upload New Media</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">Title/Alt Text</label>
                <input 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl p-4 outline-none" 
                  placeholder="Enter title" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">Media Type</label>
                <select 
                  value={type} 
                  onChange={handleTypeChange}
                  className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl p-4 outline-none text-[#d4af37] font-semibold"
                >
                  <option value="photo">Gallery Photo</option>
                  <option value="video">Gallery Video</option>
                  {!media.some(item => item.type === 'about_image') && (
                    <option value="about_image">About Section Main Image</option>
                  )}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold">Select File</label>
              <input 
                key={inputKey} // Resets input element on change or clear
                type="file"
                required
                accept={type === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileChange}
                className="w-full bg-[#201f1f] border border-outline-variant/10 rounded-xl p-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37] file:text-[#131313] hover:file:bg-[#f2ca50] cursor-pointer" 
              />
            </div>
            {previewUrl && (
              <div className="relative space-y-2 p-4 border border-outline-variant/10 rounded-xl bg-[#1a1a1a]">
                <button 
                  type="button"
                  onClick={clearSelection}
                  className="absolute top-4 right-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-1.5 rounded-full transition-colors flex items-center justify-center z-10 border border-red-500/30 hover:border-red-500"
                  title="Remove file"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
                <p className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-2 pr-8">Preview (Size: {fileSizeStr})</p>
                {type === 'video' ? (
                  <video src={previewUrl} controls className="max-w-full h-48 rounded-lg" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-w-full h-48 object-contain rounded-lg" />
                )}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button 
                type="submit"
                disabled={loading}
                className="relative overflow-hidden bg-[#d4af37] text-[#131313] py-4 px-8 rounded-xl font-bold disabled:opacity-70 hover:bg-[#f2ca50] transition-all"
              >
                <div className="relative z-10">{loading ? `Uploading... ${uploadProgress}%` : 'Upload Media'}</div>
                {loading && (
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#f2ca50] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                )}
              </button>
              {loading && (
                <div className="text-center font-bold text-sm text-[#d4af37] animate-pulse">
                  Upload Progress: {uploadProgress}%
                </div>
              )}
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-2xl font-serif italic mb-6">Manage Media</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {media.map((item) => (
              <div key={item._id} className="relative group bg-[#201f1f] rounded-xl overflow-hidden border border-outline-variant/10">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="p-4 flex justify-between items-center bg-[#131313]">
                  <p className="text-sm font-semibold truncate flex-1 mr-4" title={item.title}>
                    {item.title} 
                    {item.type === 'about_image' && <span className="ml-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase">Main Section</span>}
                  </p>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500 hover:text-red-400 bg-red-500/10 p-2 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
            {media.length === 0 && <p className="text-gray-500 italic">No media found. Upload some to get started.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Admin;
