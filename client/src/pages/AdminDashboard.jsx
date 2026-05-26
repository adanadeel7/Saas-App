import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  // Verify access
  useEffect(() => {
    const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    if (!user || (user.role !== 'admin' && user.email?.toLowerCase() !== adminEmail)) {
      toast.error('Access denied. Administrator credentials required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get('/admin/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch admin users:', err);
        toast.error(err.response?.data?.message || 'Failed to load user directories.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdatePlan = async (userId, newPlan) => {
    try {
      toast.loading('Updating user plan...');
      await API.put(`/admin/users/${userId}/plan`, { plan: newPlan });
      toast.dismiss();
      toast.success(`Plan updated to ${newPlan.toUpperCase()}`);
      
      // Update local state
      setUsers(users.map((u) => (u._id === userId ? { ...u, plan: newPlan } : u)));
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'Failed to update plan');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      toast.loading('Updating user role...');
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.dismiss();
      toast.success(`Role updated to ${newRole.toUpperCase()}`);
      
      // Update local state
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the platform? This will delete all their invoices.`)) {
      return;
    }

    try {
      toast.loading('Deleting user...');
      await API.delete(`/admin/users/${userId}`);
      toast.dismiss();
      toast.success('User removed successfully');
      
      // Update local state
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Summary Metrics
  const totalUsers = users.length;
  const verifiedUsersCount = users.filter((u) => u.isVerified).length;
  const verifiedPercent = totalUsers > 0 ? Math.round((verifiedUsersCount / totalUsers) * 100) : 0;
  
  const proUsersCount = users.filter((u) => u.plan === 'pro').length;
  const businessUsersCount = users.filter((u) => u.plan === 'business').length;
  const payingUsersCount = proUsersCount + businessUsersCount;

  // Filtered Users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && u.isVerified) || 
      (verificationFilter === 'unverified' && !u.isVerified);

    return matchesSearch && matchesPlan && matchesVerification;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="max-w-container-max-width mx-auto px-margin-desktop py-10 flex gap-gutter min-h-screen">
      <Sidebar />

      {/* Main Content Canvas */}
      <section className="flex-grow flex flex-col gap-10 animate-fade-in text-on-surface">
        {/* Header Row */}
        <div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface">Admin Directory</h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            Overview of all registered users and account subscription statuses.
          </p>
        </div>

        {/* Admin Stats Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
            <span className="text-on-surface-variant text-xs uppercase tracking-wider font-bold">Total Registrations</span>
            <span className="text-3xl font-extrabold text-primary font-mono">{totalUsers}</span>
            <span className="text-[10px] text-on-surface-variant">Active accounts total</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
            <span className="text-on-surface-variant text-xs uppercase tracking-wider font-bold">Email Verification</span>
            <span className="text-3xl font-extrabold text-green-400 font-mono">{verifiedPercent}%</span>
            <span className="text-[10px] text-on-surface-variant">{verifiedUsersCount} of {totalUsers} verified</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
            <span className="text-on-surface-variant text-xs uppercase tracking-wider font-bold">Pro Subscribers</span>
            <span className="text-3xl font-extrabold text-primary font-mono">{proUsersCount}</span>
            <span className="text-[10px] text-on-surface-variant">Pro tier members</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
            <span className="text-on-surface-variant text-xs uppercase tracking-wider font-bold">Business Partners</span>
            <span className="text-3xl font-extrabold text-tertiary font-mono">{businessUsersCount}</span>
            <span className="text-[10px] text-on-surface-variant">Studio-scale accounts</span>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96 flex items-center bg-surface-dim border border-outline-variant rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-on-surface-variant pl-3 pr-2 select-none">search</span>
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent py-3 pr-4 text-sm focus:outline-none text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            {/* Filter by Plan */}
            <div className="flex flex-col gap-1 flex-grow sm:flex-grow-0">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Plan Tier</label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>

            {/* Filter by Verification Status */}
            <div className="flex flex-col gap-1 flex-grow sm:flex-grow-0">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Verification</label>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Table Grid */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-xs text-on-surface-variant font-bold">Retrieving directories...</span>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-high/40 text-on-surface-variant uppercase text-xs">
                    <th className="px-6 py-4 font-bold">User Profile</th>
                    <th className="px-6 py-4 font-bold">Access Email</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold">Verification</th>
                    <th className="px-6 py-4 font-bold">Billing Plan</th>
                    <th className="px-6 py-4 font-bold text-right">Register Date</th>
                    <th className="px-6 py-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredUsers.map((u) => {
                    const planBadges = {
                      free: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/20',
                      pro: 'bg-primary/10 text-primary border border-primary/20',
                      business: 'bg-tertiary/10 text-tertiary border border-tertiary/20',
                    };
                    const verifyBadge = u.isVerified 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

                    return (
                      <tr key={u._id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-xs font-bold shadow-sm">
                              {getInitials(u.name)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-on-surface">{u.name}</span>
                              {u.company && (
                                <span className="text-[10px] text-on-surface-variant font-bold truncate max-w-[120px]">
                                  {u.company}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-on-surface-variant">
                          {u.email}
                        </td>
                        <td className="px-6 py-4">
                          {u._id === user?._id ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                              {u.role}
                            </span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                              className="bg-surface border border-outline-variant rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary capitalize cursor-pointer font-bold"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${verifyBadge}`}>
                            {u.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.role === 'admin' ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${planBadges[u.plan]}`}>
                              {u.plan}
                            </span>
                          ) : (
                            <select
                              value={u.plan}
                              onChange={(e) => handleUpdatePlan(u._id, e.target.value)}
                              className="bg-surface border border-outline-variant rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary capitalize cursor-pointer font-bold"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                              <option value="business">Business</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-on-surface-variant">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {u._id !== user?._id && u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="text-error hover:text-red-400 p-1 rounded hover:bg-surface-container-highest transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                delete
                              </span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-on-surface-variant/40 text-sm">
                        No registered members match the active search/filters criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
