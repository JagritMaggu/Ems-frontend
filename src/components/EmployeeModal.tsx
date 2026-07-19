'use client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCreateEmployeeMutation, useUpdateEmployeeMutation } from '@/store/api';
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
    password: ''
  });

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
      const payload = { ...formData, salary: Number(formData.salary) };
      if (!payload.password) delete payload.password; // Don't send empty password on update

      if (employeeToEdit) {
        await updateEmployee({ id: employeeToEdit.id, ...payload }).unwrap();
      } else {
        await createEmployee(payload).unwrap();
        toast.success('Employee created successfully!');
      }
      onClose();
    } catch (err) {
      toast.error('Error saving employee. Check console.');
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
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Full Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} required disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
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
            <select name="role" value={formData.role} onChange={handleChange} required disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white' }}>
              <option value="EMPLOYEE">Employee</option>
              <option value="HR_MANAGER">HR Manager</option>
              {user?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} disabled={user?.role === 'EMPLOYEE'} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white' }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
