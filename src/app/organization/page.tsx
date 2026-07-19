'use client';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGetOrganizationTreeQuery } from '@/store/api';

export default function OrganizationPage() {
  const { data, isLoading } = useGetOrganizationTreeQuery({});

  // Recursive component to render tree nodes
  const renderTree = (node: any) => (
    <div key={node.id} style={{ marginLeft: '2rem', marginTop: '1rem', borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
      <div className="card" style={{ padding: '1rem', display: 'inline-block', minWidth: '250px' }}>
        <p style={{ fontWeight: 600 }}>{node.name}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{node.designation || 'Employee'}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>{node.department || 'No Department'}</p>
      </div>
      {node.direct_reports && node.direct_reports.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          {node.direct_reports.map((child: any) => renderTree(child))}
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
                  {data.data.map((rootNode: any) => renderTree(rootNode))}
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
