'use client';
import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmployeeModal from '@/components/EmployeeModal';
import { useGetEmployeesQuery, useDeleteEmployeeMutation, useBulkCreateEmployeesMutation } from '@/store/api';

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
  
  const { data, isLoading } = useGetEmployeesQuery({ 
    search: searchTerm, 
    department, 
    role,
    sortBy 
  });
  
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [bulkCreate, { isLoading: isUploading }] = useBulkCreateEmployeesMutation();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          await bulkCreate(results.data).unwrap();
          alert(`${results.data.length} employees imported successfully!`);
        } catch (err) {
          alert('Failed to import employees. Check CSV format.');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      await deleteEmployee(id);
    }
  };

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
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'white' }}>
                    <option value="">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                  </select>
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'white' }}>
                    <option value="">All Roles</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                  
                  {user?.role !== 'EMPLOYEE' && (
                    <>
                      <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                      <button className="btn-primary" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }} onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? 'Importing...' : 'Import CSV'}
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
                          <td style={{ fontWeight: 500 }}>{emp.name}</td>
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
                            <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)' }}>
                              {(user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER' || user?.employee_profile?.id === emp.id) && (
                                <button onClick={() => handleEdit(emp)} style={{ cursor: 'pointer', color: 'var(--info)' }}>Edit</button>
                              )}
                              
                              {/* RBAC: Only Super Admin can delete */}
                              {user?.role === 'SUPER_ADMIN' && (
                                <button onClick={() => handleDelete(emp.id)} style={{ cursor: 'pointer', color: 'var(--danger)' }}>Delete</button>
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
      </div>
    </ProtectedRoute>
  );
}
