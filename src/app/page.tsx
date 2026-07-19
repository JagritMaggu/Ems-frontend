'use client';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGetDashboardStatsQuery, useGetEmployeesQuery } from '@/store/api';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery({});
  const { data: employeesData, isLoading: empsLoading } = useGetEmployeesQuery({ limit: 5, sortBy: 'created_at' });

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        
        <main className="main-content" style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header title="Dashboards" />
          
          <div className="page-padding" style={{ padding: '2rem', flex: 1 }}>
            {/* Top KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>Total Employees</p>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {statsLoading ? <div className="shimmer" style={{ width: '120px', height: '14px', borderRadius: '4px' }}></div> : `Currently Managed (${stats?.data?.totalEmployees || 0})`}
                  </div>
                </div>
              </div>
              
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>Active Employees</p>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {statsLoading ? <div className="shimmer" style={{ width: '120px', height: '14px', borderRadius: '4px' }}></div> : `Status Active (${stats?.data?.activeEmployees || 0})`}
                  </div>
                </div>
              </div>
              
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>Departments</p>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {statsLoading ? <div className="shimmer" style={{ width: '120px', height: '14px', borderRadius: '4px' }}></div> : `Company Departments (${stats?.data?.departmentCount || 0})`}
                  </div>
                </div>
              </div>
            </div>
            {/* Charts Area */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card">
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Employees by Department</h3>
                <div style={{ height: '300px' }}>
                  {statsLoading ? <div className="shimmer" style={{ width: '100%', height: '100%', borderRadius: '4px' }}></div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.data?.departmentDistribution || []}>
                        <XAxis dataKey="department" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                        <Tooltip cursor={false} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Active vs Inactive</h3>
                <div style={{ height: '300px' }}>
                  {statsLoading ? <div className="shimmer" style={{ width: '100%', height: '100%', borderRadius: '4px' }}></div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Active', value: stats?.data?.activeEmployees || 0 },
                            { name: 'Inactive', value: stats?.data?.inactiveEmployees || 0 }
                          ]}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          <Cell fill="var(--success)" />
                          <Cell fill="var(--danger)" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Main Table Area */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 600 }}>Recent Employees</h3>
                <Link href="/employees">
                  <button className="btn-primary">View All Directory</button>
                </Link>
              </div>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td><div className="shimmer" style={{ width: '120px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '150px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '100px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '80px', height: '16px', borderRadius: '4px' }}></div></td>
                          <td><div className="shimmer" style={{ width: '100px', height: '16px', borderRadius: '4px' }}></div></td>
                        </tr>
                      ))
                    ) : employeesData?.data?.slice(0, 5).map((emp: any) => (
                      <tr key={emp.id}>
                        <td style={{ fontWeight: 500 }}>{emp.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{emp.user.email}</td>
                        <td>{emp.department || '-'}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
