'use client';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { useTheme } from '@/context/ThemeContext';
import { RootState } from '@/store';
import toast from 'react-hot-toast';
import EmployeeModal from './EmployeeModal';
import { useGetEmployeeByIdQuery } from '@/store/api';

export default function Header({ title }: { title?: string }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const { theme, toggleTheme } = useTheme();
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { data: currentEmployeeData } = useGetEmployeeByIdQuery(user?.employee_profile?.id || '', { skip: !isProfileModalOpen || !user?.employee_profile?.id });

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully', { id: 'logout-toast' });
    router.push('/login');
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button className="show-on-mobile" onClick={() => dispatch(toggleSidebar())} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--primary)', marginRight: '0.5rem' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        {title && <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, paddingLeft: '0.5rem' }}>{title}</h1>}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="hide-on-mobile" style={{ textAlign: 'right' }}>
          {user?.name ? (
            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</p>
          ) : (
            <div className="shimmer" style={{ width: '80px', height: '14px', borderRadius: '4px', marginBottom: '4px', display: 'inline-block' }}></div>
          )}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'HR_MANAGER' ? 'HR Manager' : user?.role ? 'Employee' : <div className="shimmer" style={{ width: '60px', height: '12px', borderRadius: '4px', display: 'inline-block' }}></div>}
          </div>
        </div>

        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
          {theme === 'light' ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          )}
        </button>
        <div 
          onClick={() => {
            if (user?.role === 'SUPER_ADMIN' && !user?.employee_profile?.id) {
              toast('Super Admin has no employee profile to edit.', { icon: 'ℹ️' });
            } else if (!user?.employee_profile?.id) {
              toast.error('Session expired or incomplete. Please re-login.');
            } else {
              setIsProfileModalOpen(true);
            }
          }}
          title="Edit Profile"
          style={{ 
          width: '36px', height: '36px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary-light)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)', fontWeight: 600, cursor: 'pointer'
        }}>
          {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
        </div>
        
        <button 
          onClick={handleLogout}
          className="btn-danger"
        >
          Logout
        </button>
      </div>

      {isProfileModalOpen && currentEmployeeData?.data && (
        <EmployeeModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
          employeeToEdit={currentEmployeeData.data} 
        />
      )}
    </header>
  );
}
