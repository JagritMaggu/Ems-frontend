'use client';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGetOrganizationTreeQuery } from '@/store/api';

export default function OrganizationPage() {
  const { data, isLoading } = useGetOrganizationTreeQuery({});

  // Recursive component to render tree nodes with sleek Avatar card UI
  const renderTree = (node: any, level: number = 0) => (
    <div key={node.id} style={{ marginLeft: level > 0 ? '2.5rem' : '0', marginTop: '1rem', borderLeft: level > 0 ? '2px solid var(--border)' : 'none', paddingLeft: level > 0 ? '1.5rem' : '0', position: 'relative' }}>
      
      {/* Horizontal connector line */}
      {level > 0 && (
        <div style={{ position: 'absolute', left: '0', top: '34px', width: '1.5rem', height: '2px', backgroundColor: 'var(--border)' }}></div>
      )}

      <div className="card" style={{ padding: '1rem', display: 'inline-flex', alignItems: 'center', gap: '1rem', minWidth: '320px', border: '1px solid var(--border)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {node.profile_image ? (
            <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${node.profile_image}`} alt={node.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>{node.name?.substring(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{node.name}</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-main)', padding: '0.15rem 0.5rem', borderRadius: '1rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {node.designation || 'Employee'}
            </span>
            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary-light)', padding: '0.15rem 0.5rem', borderRadius: '1rem', color: 'var(--primary)', fontWeight: 600 }}>
              {node.department || 'Company'}
            </span>
          </div>
        </div>
      </div>
      
      {node.direct_reports && node.direct_reports.length > 0 && (
        <div style={{ marginTop: '0.25rem' }}>
          {node.direct_reports.map((child: any) => renderTree(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        
        <main className="main-content" style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header title="Organizational Hierarchy" />
          
          <div className="page-padding" style={{ padding: '2rem', flex: 1 }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Visual reporting structure of the company.</p>
            
            <div className="card" style={{ overflowX: 'auto', padding: '2rem' }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                  <div className="shimmer" style={{ width: '250px', height: '60px', borderRadius: '8px' }}></div>
                  <div style={{ display: 'flex', gap: '2rem', paddingLeft: '2rem' }}>
                    <div className="shimmer" style={{ width: '200px', height: '60px', borderRadius: '8px' }}></div>
                    <div className="shimmer" style={{ width: '200px', height: '60px', borderRadius: '8px' }}></div>
                  </div>
                </div>
              ) : data?.data && data.data.length > 0 ? (
                <div>
                  {/* Start rendering from all root nodes (users with no manager) */}
                  {data.data.map((rootNode: any) => renderTree(rootNode, 0))}
                </div>
              ) : (
                <p>No hierarchy found. Try assigning a Reporting Manager to an employee.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
