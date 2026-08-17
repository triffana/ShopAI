import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Profile } from '../../types';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase.from('profiles') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data as Profile[]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6 pb-12 text-[#F7F4EA]">
      <div className="pb-4 border-b border-[#1F6F50]/30">
        <h1 className="text-2xl font-bold text-white tracking-tight">User Registry</h1>
        <p className="text-xs text-[#F7F4EA]/70 mt-1">Manage registered platform accounts</p>
      </div>

      <div className="bg-[#1F6F50]/10 rounded-xl border border-[#1F6F50]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F7F4EA]">
            <thead className="bg-[#12372A] text-[#B7F34A] font-bold border-b border-[#1F6F50]/40 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F6F50]/20">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#F7F4EA]/60">
                    Loading users list...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#F7F4EA]/70 italic">
                    No registered user accounts found in profiles table yet.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1F6F50]/20 transition">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#1F6F50] text-[#B7F34A] font-bold flex items-center justify-center text-xs">
                        {u.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span>{u.full_name || 'Customer'}</span>
                    </td>
                    <td className="p-4 text-[#F7F4EA]/80 font-mono">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-[#B7F34A]/20 text-[#B7F34A] border border-[#B7F34A]/40'
                            : 'bg-[#1F6F50]/30 text-white border border-[#1F6F50]/50'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[#F7F4EA]/70">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
