'use client';
import React, { useState, useRef, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import Papa from 'papaparse';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import toast from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmployeeModal from '@/components/EmployeeModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useGetEmployeesQuery, useDeleteEmployeeMutation, useBulkCreateEmployeesMutation, useUpdateEmployeeMutation } from '@/store/api';

export default function EmployeesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  
  const { data, isLoading } = useGetEmployeesQuery({ 
    search: debouncedSearch, 
    department, 
    role,
    sortBy 
  });
  
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [bulkCreate, { isLoading: isUploading }] = useBulkCreateEmployeesMutation();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          await bulkCreate(results.data).unwrap();
          toast.success(`${results.data.length} employees imported successfully!`);
        } catch (err) {
          toast.error('Failed to import employees. Check CSV format.');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  }, [bulkCreate]);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, type: 'delete' | 'status', empId: string, empName: string, currentStatus?: string }>({ isOpen: false, type: 'delete', empId: '', empName: '' });

  const handleEdit = useCallback((employee: any) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  }, []);

  const executeAction = useCallback(async () => {
    try {
      if (confirmModal.type === 'delete') {
        await deleteEmployee(confirmModal.empId).unwrap();
        toast.success(`Deleted ${confirmModal.empName}`);
      } else if (confirmModal.type === 'status') {
        const newStatus = confirmModal.currentStatus === 'Active' ? 'Inactive' : 'Active';
        const formData = new FormData();
        formData.append('status', newStatus);
        await updateEmployee({ id: confirmModal.empId, data: formData }).unwrap();
        toast.success(`Marked ${confirmModal.empName} as ${newStatus}`);
      }
    } catch (err) {
      toast.error('Action failed. Try again.');
    }
  }, [confirmModal, deleteEmployee, updateEmployee]);

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main className="main-content" style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header title="Employee Directory" />
          
          <div className="page-padding" style={{ padding: '2rem', flex: 1 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="Search by name/email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} 
                  />
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <option value="">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                  </select>
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <option value="">All Roles</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                  
                  {user?.role !== 'EMPLOYEE' && (
                    <>
                      <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                      <button className="btn-success" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <><span className="spinner"></span> Importing...</> : 'Import CSV'}
                      </button>
                      <button className="btn-primary" onClick={handleAddNew}>Add +</button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => setSortBy('name')} style={{ cursor: 'pointer' }}>Name ↕</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th onClick={() => setSortBy('joining_date')} style={{ cursor: 'pointer' }}>Joining Date ↕</th>
                      <th>Status</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i}>
                          <td><div className="shimmer" style={{ width: '30px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '120px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '150px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '100px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '80px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '100px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '60px', height: '16px', borderRadius: '4px' }}></div></td>
                        </tr>
                      ))
                    ) : data?.data?.length > 0 ? (
                      data.data.map((emp: any, index: number) => (
                        <tr key={emp.id}>
                          <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', flexShrink: 0, overflow: 'hidden' }}>
                              {emp.profile_image ? (
                                <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${emp.profile_image}`} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                emp.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            {emp.name}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{emp.user.email}</td>
                          <td>{emp.department || '-'}</td>
                          <td>{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '-'}</td>
                          <td>
                            <span className="status-indicator">
                              <span className={`status-dot ${emp.user.status === 'Inactive' ? 'suspended' : 'active'}`}></span>
                              <span style={{ color: emp.user.status === 'Inactive' ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>
                                {emp.user.status}
                              </span>
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{emp.user.role.replace('_', ' ')}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              {(user?.role === 'SUPER_ADMIN' || 
                               (user?.role === 'HR_MANAGER' && emp.user.role !== 'HR_MANAGER' && emp.user.role !== 'SUPER_ADMIN') || 
                               user?.employee_profile?.id === emp.id) && (
                                <button onClick={() => handleEdit(emp)} style={{ cursor: 'pointer', color: 'var(--info)', background: 'none', border: 'none', padding: '0.25rem' }} title="Edit">
                                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                              )}
                              
                              {/* RBAC: Only Super Admin can toggle status or delete */}
                              {user?.role === 'SUPER_ADMIN' && (
                                <>
                                  <button onClick={() => setConfirmModal({ isOpen: true, type: 'status', empId: emp.id, empName: emp.name, currentStatus: emp.user.status })} style={{ cursor: 'pointer', color: emp.user.status === 'Active' ? 'var(--warning)' : 'var(--success)', background: 'none', border: 'none', padding: '0.25rem' }} title={emp.user.status === 'Active' ? 'Deactivate' : 'Activate'}>
                                    {emp.user.status === 'Active' ? (
                                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    ) : (
                                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    )}
                                  </button>

                                  <button onClick={() => setConfirmModal({ isOpen: true, type: 'delete', empId: emp.id, empName: emp.name })} style={{ cursor: 'pointer', color: 'var(--danger)', background: 'none', border: 'none', padding: '0.25rem' }} title="Delete">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={7} style={{ textAlign: 'center' }}>No employees found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        
        {isModalOpen && (
          <EmployeeModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            employeeToEdit={editingEmployee} 
          />
        )}

        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.type === 'delete' ? 'Confirm Deletion' : 'Confirm Status Change'}
          message={confirmModal.type === 'delete' 
            ? `Are you sure you want to permanently delete the employee "${confirmModal.empName}"? This action cannot be undone.` 
            : `Are you sure you want to change the status of "${confirmModal.empName}" to ${confirmModal.currentStatus === 'Active' ? 'Inactive' : 'Active'}?`}
          onConfirm={executeAction}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          confirmText={confirmModal.type === 'delete' ? 'Delete' : 'Confirm'}
          confirmType={confirmModal.type === 'delete' ? 'danger' : (confirmModal.currentStatus === 'Active' ? 'warning' : 'success')}
        />
      </div>
    </ProtectedRoute>
  );
}
