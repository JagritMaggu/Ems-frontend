'use client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, useGetEmployeesQuery } from '@/store/api';
import toast from 'react-hot-toast';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: any | null;
}

export default function EmployeeModal({ isOpen, onClose, employeeToEdit }: EmployeeModalProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const { data: employeesData } = useGetEmployeesQuery({});

  const [formData, setFormData] = useState({
    name: employeeToEdit?.name || '',
    email: employeeToEdit?.user?.email || '',
    phone: employeeToEdit?.phone || '',
    department: employeeToEdit?.department || '',
    designation: employeeToEdit?.designation || '',
    salary: employeeToEdit?.salary || '',
    joining_date: employeeToEdit?.joining_date ? new Date(employeeToEdit.joining_date).toISOString().split('T')[0] : '',
    status: employeeToEdit?.user?.status || 'Active',
    role: employeeToEdit?.user?.role || 'EMPLOYEE',
    reporting_manager_id: employeeToEdit?.reporting_manager_id || '',
    password: ''
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'phone') {
      const numericValue = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, phone: numericValue });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'salary') {
          payload.append('salary', String(Number((formData as any)[key])));
        } else if (key === 'password' && !(formData as any).password) {
          // Skip empty password
        } else if ((formData as any)[key] !== undefined && (formData as any)[key] !== null && (formData as any)[key] !== '') {
          payload.append(key, (formData as any)[key]);
        }
      });
      
      if (profileImageFile) {
        payload.append('profile_image', profileImageFile);
      }

      if (employeeToEdit) {
        await updateEmployee({ id: employeeToEdit.id, data: payload }).unwrap();
        toast.success('Employee updated successfully!', { id: 'emp-update' });
      } else {
        await createEmployee(payload).unwrap();
        toast.success('Employee created successfully!', { id: 'emp-create' });
      }
      onClose();
    } catch (err) {
      toast.error('Error saving employee. Check console.', { id: 'emp-error' });
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="card modal-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {employeeToEdit ? 'Edit Employee' : 'Add Employee'}
        </h2>
        
        <form onSubmit={handleSubmit} className="modal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div 
                style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}
              >
                {profileImageFile ? (
                  <img src={URL.createObjectURL(profileImageFile)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : employeeToEdit?.profile_image ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${employeeToEdit.profile_image}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="40" height="40" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                )}
              </div>
              <div 
                onClick={() => document.getElementById('profileImageInput')?.click()}
                style={{ position: 'absolute', bottom: 0, right: -4, backgroundColor: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Full Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} required disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
              <input id="profileImageInput" type="file" accept="image/*" onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!employeeToEdit} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Password {employeeToEdit ? '(Leave blank to keep)' : '*'}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required={!employeeToEdit} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} minLength={10} pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" required style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Salary (Number) *</label>
            <input type="number" min="0" name="salary" value={formData.salary} onChange={handleChange} required disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Department</label>
            <input name="department" value={formData.department} onChange={handleChange} disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Designation</label>
            <input name="designation" value={formData.designation} onChange={handleChange} disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Joining Date</label>
            <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Role *</label>
            <select name="role" value={formData.role} onChange={handleChange} required disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <option value="EMPLOYEE">Employee</option>
              <option value="HR_MANAGER">HR Manager</option>
              {user?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Reporting Manager</label>
            <select name="reporting_manager_id" value={formData.reporting_manager_id} onChange={handleChange} disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <option value="">None (Top Level)</option>
              {employeesData?.data?.map((emp: any) => (
                // Filter out themselves so they can't assign themselves as manager
                emp.id !== employeeToEdit?.id && (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation || 'Employee'})</option>
                )
              ))}
            </select>
          </div>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-danger">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isCreating || isUpdating} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '150px', justifyContent: 'center' }}>
              {isCreating || isUpdating ? <><span className="spinner"></span> Saving...</> : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
