import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

function Admin() {
  const [media, setMedia] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('photo');
  const [tag, setTag] = useState('None');
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

  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('media'); // 'media' | 'inquiries'

  useEffect(() => {
    fetchMedia();
    fetchInquiries();
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

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (Array.isArray(data)) {
        setInquiries(data);
      } else {
        console.error('Invalid inquiries data format:', data);
        setInquiries([]);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
      setInquiries([]);
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

    if (type !== 'video' && sizeInMB > 50) {
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
    formData.append('tag', tag);
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
      setTag('None');
      if (type !== 'photo' && type !== 'video') {
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

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking inquiry?')) return;

    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Inquiry deleted successfully');
        fetchInquiries();
      }
    } catch (err) {
      console.error('Delete inquiry error', err);
      toast.error('Failed to delete inquiry');
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

        {/* Tab Selector */}
        <div className="flex gap-4 mb-10 border-b border-outline-variant/10 pb-4">
          <button
            onClick={() => setActiveTab('media')}
            className={`px-6 py-2.5 rounded-full font-serif text-sm uppercase tracking-widest font-semibold transition-all duration-300 ${activeTab === 'media'
                ? 'bg-[#d4af37] text-[#131313] shadow-md shadow-[#d4af37]/15'
                : 'text-outline hover:text-[#d4af37] hover:bg-[#d4af37]/5'
              }`}
          >
            Media Manager
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-6 py-2.5 rounded-full font-serif text-sm uppercase tracking-widest font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'inquiries'
                ? 'bg-[#d4af37] text-[#131313] shadow-md shadow-[#d4af37]/15'
                : 'text-outline hover:text-[#d4af37] hover:bg-[#d4af37]/5'
              }`}
          >
            Booking Inquiries
            {inquiries.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {inquiries.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'media' ? (
          <>
            <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-lg mb-12">
              <h2 className="text-2xl font-serif italic mb-6">Upload New Media</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
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
                      {!media.some(item => item.type === 'cover_image') && (
                        <option value="cover_image">Home Cover Image</option>
                      )}
                      {!media.some(item => item.type === 'about_image') && (
                        <option value="about_image">About Section Main Image</option>
                      )}
                      {!media.some(item => item.type === 'sangeet_bg') && (
                        <option value="sangeet_bg">Sangeet Card Background</option>
                      )}
                      {!media.some(item => item.type === 'haldi_bg') && (
                        <option value="haldi_bg">Haldi Card Background</option>
                      )}
                      {!media.some(item => item.type === 'kids_bg') && (
                        <option value="kids_bg">Kids Celebration Card Background</option>
                      )}
                      {!media.some(item => item.type === 'corporate_bg') && (
                        <option value="corporate_bg">Corporate Events Card Background</option>
                      )}
                      {!media.some(item => item.type === 'cultural_bg') && (
                        <option value="cultural_bg">Cultural Gigs Card Background</option>
                      )}
                      {!media.some(item => item.type === 'fashion_bg') && (
                        <option value="fashion_bg">Fashion Fun Card Background</option>
                      )}
                    </select>
                  </div>
                  {type === 'photo' || type === 'video' ? (
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold">Category Tag</label>
                      <select
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl p-4 outline-none text-[#d4af37] font-semibold"
                      >
                        <option value="None">None</option>
                        <option value="Sangeet Night">Sangeet Night</option>
                        <option value="Haldi Carnival">Haldi Carnival</option>
                        <option value="Kids Celebration">Kids Celebration</option>
                        <option value="Corporate Events">Corporate Events</option>
                        <option value="Cultural Gigs">Cultural Gigs</option>
                        <option value="Fashion Fun">Fashion Fun</option>
                      </select>
                    </div>
                  ) : (
                    <div className="hidden md:block"></div>
                  )}
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
                        {item.type !== 'photo' && item.type !== 'video' ? (
                          <span className="ml-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase font-bold">
                            {item.type.replace('_bg', ' Bg').replace('_image', ' Image').replace('_', ' ')}
                          </span>
                        ) : (
                          item.tag && item.tag !== 'None' && (
                            <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded uppercase font-bold">{item.tag}</span>
                          )
                        )}
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
          </>
        ) : (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif italic">Booking Inquiries ({inquiries.length})</h2>
              <button
                onClick={fetchInquiries}
                className="text-xs uppercase tracking-widest text-[#d4af37] border border-[#d4af37]/20 px-3 py-1.5 rounded-full hover:bg-[#d4af37]/10 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            <div className="space-y-6">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant/10 shadow-lg relative group transition-all hover:border-[#d4af37]/30"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-serif text-[#d4af37] font-bold mb-1">{inquiry.fullName}</h3>
                      <p className="text-xs text-outline mb-2">
                        Received: {new Date(inquiry.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-primary/20">
                          {inquiry.eventType}
                        </span>
                        {inquiry.eventDate && (
                          <span className="bg-surface-container-highest text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-outline-variant/20 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                            {new Date(inquiry.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${inquiry.email}?subject=Re: booking inquiry for ${inquiry.eventType}`}
                        className="text-xs uppercase tracking-widest bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 px-4 py-2 rounded-full hover:bg-[#d4af37] hover:text-[#131313] transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">mail</span>
                        Reply via Email
                      </a>
                      <button
                        onClick={() => handleDeleteInquiry(inquiry._id)}
                        className="text-red-500 hover:text-red-400 bg-red-500/10 p-2.5 rounded-full border border-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-center"
                        title="Delete inquiry"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/10 pt-4 mt-2">
                    <p className="text-xs uppercase tracking-widest font-bold text-outline mb-2">Client Message</p>
                    <p className="text-[#e5e2e1] text-sm leading-relaxed whitespace-pre-wrap bg-[#1a1a1a] p-4 rounded-xl border border-outline-variant/5">
                      {inquiry.message}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-outline border-t border-outline-variant/5 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                      <span>Email: <a href={`mailto:${inquiry.email}`} className="text-[#d4af37] hover:underline font-semibold">{inquiry.email}</a></span>
                    </div>
                    {inquiry.phone && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">phone</span>
                          <span>Phone: <a href={`tel:${inquiry.phone}`} className="text-[#d4af37] hover:underline font-semibold">{inquiry.phone}</a></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#25D366] hover:underline flex items-center gap-1 font-bold"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.485 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.735-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            <span>Chat on WhatsApp</span>
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {inquiries.length === 0 && (
                <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <span className="material-symbols-outlined text-5xl text-outline mb-4">inbox</span>
                  <p className="text-gray-500 italic">No inquiries found. When a client submits the booking form, it will appear here!</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Admin;
