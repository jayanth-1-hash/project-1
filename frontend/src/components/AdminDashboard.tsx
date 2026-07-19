import { useState, useEffect } from 'react';

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  interest: string;
  budget: string;
  visitDate: string;
  message: string;
  createdAt: string;
}

export function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const fetchInquiries = async (authPassword = password) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/inquiries', {
        headers: {
          'Authorization': `Bearer ${authPassword}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid password');
        throw new Error('Failed to fetch inquiries');
      }
      const data = await res.json();
      const sortedInquiries = (data.inquiries || []).sort((a: Inquiry, b: Inquiry) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInquiries(sortedInquiries);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Error loading inquiries. Make sure the backend server is running.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch automatically if we are authenticated (e.g. on hot reload)
    // For normal flow, wait for login.
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInquiries(password);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead? This cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/inquiries/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      if (res.ok) {
        setInquiries(prev => prev.filter(inq => inq.id !== id));
      } else {
        alert('Failed to delete lead. Please try again.');
      }
    } catch (err) {
      alert('Network error while deleting lead.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-headline-lg text-primary">Admin Login</h1>
            <p className="text-sm text-on-surface-variant mt-2">Enter the admin password to view customer leads.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-on-surface"
                required
              />
            </div>
            {error && <div className="text-error text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
            <a href="/" className="block text-center text-sm text-primary hover:underline mt-4">
              Return to Website
            </a>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-error/10 text-error p-4 rounded-lg border border-error/20 text-sm">
          {error}
        </div>
      );
    }
    
    if (inquiries.length === 0) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl md:text-6xl text-on-surface-variant mb-4">inbox</span>
          <h3 className="text-lg md:text-xl font-bold text-primary">No inquiries yet</h3>
          <p className="text-sm text-on-surface-variant">When customers submit forms, they will appear here.</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-[16px] md:rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
        
        {/* Mobile View: Stacked Cards */}
        <div className="block lg:hidden divide-y divide-outline-variant/20">
          {inquiries.map((inq) => (
            <div key={inq.id} className="p-4 hover:bg-surface/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-primary text-base">{inq.name}</h4>
                  <div className="text-xs text-on-surface-variant mt-0.5">{inq.phone}</div>
                </div>
                <button 
                  onClick={() => handleDelete(inq.id)}
                  className="text-error/80 hover:text-error p-1.5 rounded-full hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold">
                  {inq.interest}
                </span>
                <span className="bg-surface-container-highest text-on-surface px-2.5 py-1 rounded-full text-[10px]">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                {inq.budget !== 'Not specified' && (
                  <div>
                    <span className="text-on-surface-variant text-[10px] uppercase block">Budget</span>
                    <span className="font-medium text-on-surface">{inq.budget}</span>
                  </div>
                )}
                {inq.visitDate !== 'Not specified' && inq.visitDate !== '' && (
                  <div>
                    <span className="text-on-surface-variant text-[10px] uppercase block">Visit Date</span>
                    <span className="font-medium text-secondary">{inq.visitDate}</span>
                  </div>
                )}
              </div>

              {inq.message && (
                <div className="text-xs text-on-surface bg-surface-container-lowest p-2 rounded-md border border-outline-variant/20">
                  {inq.message}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View: Compact Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Customer Info</th>
                <th className="p-4 font-bold">Requirements</th>
                <th className="p-4 font-bold">Message</th>
                <th className="p-4 font-bold w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-surface/30 transition-colors">
                  <td className="p-4 align-top">
                    <div className="font-bold text-primary">{inq.name}</div>
                    <div className="text-xs text-on-surface-variant mt-1">{inq.phone}</div>
                    <div className="text-[10px] text-on-surface-variant mt-2">{new Date(inq.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4 align-top">
                    <span className="inline-block bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold mb-2">
                      {inq.interest}
                    </span>
                    <div className="text-xs text-on-surface space-y-1 mt-1">
                      {inq.budget !== 'Not specified' && <div><span className="text-on-surface-variant">Budget:</span> {inq.budget}</div>}
                      {inq.visitDate !== 'Not specified' && inq.visitDate !== '' && <div><span className="text-on-surface-variant">Visit:</span> {inq.visitDate}</div>}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    {inq.message ? (
                      <p className="text-xs text-on-surface max-w-xs">{inq.message}</p>
                    ) : (
                      <span className="text-on-surface-variant italic text-xs">No message</span>
                    )}
                  </td>
                  <td className="p-4 align-top text-center">
                    <button 
                      onClick={() => handleDelete(inq.id)}
                      className="text-error/80 hover:text-error p-2 rounded-full hover:bg-error/10 transition-colors"
                      title="Delete Lead"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8">
      <div className="w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline-lg text-primary">Admin Dashboard</h1>
            <p className="text-sm text-on-surface-variant mt-1 md:mt-2">View and manage all customer inquiries.</p>
          </div>
          <a href="/" className="bg-primary text-white text-sm md:text-base px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto text-center">
            Back to Website
          </a>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
