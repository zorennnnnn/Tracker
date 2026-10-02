import { useEffect, useState } from 'react';
import api from '../api';
import ProjectForm from '../components/ProjectForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load projects
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  // Create or update
  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/projects/${editing.id}`, form);
      } else {
        await api.post('/projects', form);
      }
      setFormOpen(false);
      setEditing(null);
      await loadProjects();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/projects/${deleteTarget.id}`);
    setDeleteTarget(null);
    await loadProjects();
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p) => { setEditing(p); setFormOpen(true); };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: 24 }}>Client Projects</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ New Project</button>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <div style={styles.empty}>
          <p>No projects yet.</p>
          <button className="btn-primary" onClick={openCreate}>Create your first project</button>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Project</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Start</Th>
                <Th>Due</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} style={styles.row}>
                  <Td>{p.client_name}</Td>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{p.project_name}</div>
                    {p.description && (
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {p.description.length > 60
                          ? p.description.slice(0, 60) + '…'
                          : p.description}
                      </div>
                    )}
                  </Td>
                  <Td><StatusBadge status={p.status} /></Td>
                  <Td><PriorityBadge priority={p.priority} /></Td>
                  <Td>{p.start_date}</Td>
                  <Td>{p.due_date}</Td>
                  <Td align="right">
                    <button className="btn-secondary" onClick={() => openEdit(p)} style={{ marginRight: 6 }}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => setDeleteTarget(p)}>
                      Delete
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectForm
        open={formOpen}
        initial={editing}
        onSubmit={handleSubmit}
        onCancel={() => { setFormOpen(false); setEditing(null); }}
        submitting={submitting}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project?"
        message={`Are you sure you want to delete "${deleteTarget?.project_name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function Th({ children, align = 'left' }) {
  return (
    <th style={{
      textAlign: align, padding: '10px 12px',
      fontSize: 12, textTransform: 'uppercase',
      color: '#6b7280', borderBottom: '1px solid #e5e7eb',
    }}>
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }) {
  return (
    <td style={{ textAlign: align, padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
      {children}
    </td>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: 24 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24,
  },
  tableWrap: {
    background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  row: { transition: 'background 0.1s' },
  empty: {
    background: 'white', padding: 48, borderRadius: 10,
    border: '1px dashed #d1d5db', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  },
};