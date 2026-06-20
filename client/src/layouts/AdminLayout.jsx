import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '2rem 1rem' }}>
        <h2 style={{ color: 'var(--brand-primary)', marginBottom: '2rem', textAlign: 'center' }}>Admin Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/admin" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'var(--transition-fast)' }}>Dashboard</Link>
          <Link to="/admin/movies" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'var(--transition-fast)' }}>Movies</Link>
          <Link to="/admin/theatres" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'var(--transition-fast)' }}>Theatres</Link>
          <Link to="/admin/shows" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'var(--transition-fast)' }}>Shows</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
