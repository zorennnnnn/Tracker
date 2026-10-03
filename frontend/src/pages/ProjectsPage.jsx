import { useEffect, useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import api from '../api';
import ProjectForm from '../components/ProjectForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { STATUSES, PRIORITIES } from '../utils/constants';

const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };

const STATUS_COLORS = {
  'Planning':    '#008CAD',
  'In Progress': '#E6AB26',
  'On Hold':     '#DC2626',
  'Completed':   '#10B981',
};

const PRIORITY_COLORS = {
  Low:    '#94A3B8',
  Medium: '#008CAD',
  High:   '#E6AB26',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date_asc');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  /* -----------------------------------------------------------
     STATS
  ----------------------------------------------------------- */
  const stats = useMemo(() => {
    const today = new Date();
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === 'In Progress').length;
    const completed = projects.filter((p) => p.status === 'Completed').length;
    const highPriority = projects.filter((p) => p.priority === 'High').length;
    const overdue = projects.filter(
      (p) => p.status !== 'Completed' && p.due_date && new Date(p.due_date) < today
    ).length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    return { total, inProgress, completed, highPriority, overdue, completionRate };
  }, [projects]);

  /* -----------------------------------------------------------
     CHART DATA
  ----------------------------------------------------------- */
  const statusChartData = useMemo(() => {
    const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    projects.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });
    return STATUSES.map((s) => ({ name: s, value: counts[s] }));
  }, [projects]);

  const priorityChartData = useMemo(() => {
    const counts = PRIORITIES.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
    projects.forEach((p) => { if (counts[p.priority] !== undefined) counts[p.priority]++; });
    return PRIORITIES.map((p) => ({ name: p, count: counts[p] }));
  }, [projects]);

  // Projects due per month for the next ~6 months
  const timelineData = useMemo(() => {
    const buckets = {};
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      buckets[key] = 0;
    }
    projects.forEach((p) => {
      if (!p.due_date) return;
      const d = new Date(p.due_date);
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (key in buckets) buckets[key]++;
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [projects]);

  /* -----------------------------------------------------------
     FILTER + SORT
  ----------------------------------------------------------- */
  const visibleProjects = useMemo(() => {
    let list = [...projects];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.client_name?.toLowerCase().includes(q) ||
          p.project_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') list = list.filter((p) => p.status === statusFilter);
    if (priorityFilter !== 'All') list = list.filter((p) => p.priority === priorityFilter);

    switch (sortBy) {
      case 'due_date_asc':     list.sort((a, b) => (a.due_date || '').localeCompare(b.due_date || '')); break;
      case 'due_date_desc':    list.sort((a, b) => (b.due_date || '').localeCompare(a.due_date || '')); break;
      case 'priority_high':    list.sort((a, b) => (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0)); break;
      case 'priority_low':     list.sort((a, b) => (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0)); break;
      case 'project_name_asc': list.sort((a, b) => (a.project_name || '').localeCompare(b.project_name || '')); break;
      case 'project_name_desc':list.sort((a, b) => (b.project_name || '').localeCompare(a.project_name || '')); break;
      default: break;
    }
    return list;
  }, [projects, search, statusFilter, priorityFilter, sortBy]);

  /* -----------------------------------------------------------
     CRUD
  ----------------------------------------------------------- */
  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      if (editing) await api.put(`/projects/${editing.id}`, form);
      else await api.post('/projects', form);
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
    <>
      {/* ================= HEADER (logo + title + action) ================= */}
      <header className="page-header">
        <div className="page-header-left">
          <img src="/koda.png" alt="Koda" className="header-logo" />
          <div>
            <h1>
              <span className="accent-dot" />
              Projects Dashboard
            </h1>
            <p className="page-subtitle">
              {stats.total} total · {stats.completionRate}% completed · {stats.overdue} overdue
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </button>
      </header>

      {/* ================= STATS ================= */}
      <section className="stats-grid">
        <StatCard label="Total"        value={stats.total}       icon="teal"  hint="All engagements" />
        <StatCard label="In progress"  value={stats.inProgress}  icon="gold"  hint="Currently active" />
        <StatCard label="Completed"    value={stats.completed}   icon="green" hint={`${stats.completionRate}% completion rate`} />
        <StatCard label="Overdue"      value={stats.overdue}     icon="red"   hint="Past due date" />
      </section>

      {/* ================= CHARTS ================= */}
      <section className="charts-grid">
        {/* Donut – status split */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Projects by status</span>
            <span className="chart-sub">{stats.total} total</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar – priority distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Priority distribution</span>
            <span className="chart-sub">By count</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={priorityChartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,140,173,0.06)' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {priorityChartData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area – upcoming deadlines */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Upcoming deadlines</span>
            <span className="chart-sub">Next 6 months</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={timelineData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#008CAD" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#008CAD" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#008CAD"
                  strokeWidth={2.5}
                  fill="url(#tealGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ================= TOOLBAR ================= */}
      <div className="toolbar">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or project..."
          />
        </div>

        <div className="filter-group">
          <div className="filter-badge">
            <span className="filter-label">Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filter-badge">
            <span className="filter-label">Priority</span>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="sort-wrapper">
            <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h12M3 18h6" />
            </svg>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="due_date_asc">Due date (earliest)</option>
              <option value="due_date_desc">Due date (latest)</option>
              <option value="priority_high">Priority (high → low)</option>
              <option value="priority_low">Priority (low → high)</option>
              <option value="project_name_asc">Project name (A–Z)</option>
              <option value="project_name_desc">Project name (Z–A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= STATES ================= */}
      {loading && <p style={{ color: 'var(--gray-500)' }}>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && visibleProjects.length === 0 && (
        <div className="empty-state">
          <p>No projects match your criteria.</p>
          <button className="btn-primary" onClick={openCreate}>Create your first project</button>
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!loading && !error && visibleProjects.length > 0 && (
        <div className="table-container">
          <table className="project-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Start</th>
                <th>Due</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((p) => (
                <tr key={p.id}>
                  <td>{p.client_name}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.project_name}</div>
                    {p.description && (
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                        {p.description.length > 60 ? p.description.slice(0, 60) + '…' : p.description}
                      </div>
                    )}
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><PriorityBadge priority={p.priority} /></td>
                  <td>{p.start_date}</td>
                  <td>{p.due_date}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="action-btn edit" onClick={() => openEdit(p)} style={{ marginRight: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button className="action-btn delete" onClick={() => setDeleteTarget(p)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      Delete
                    </button>
                  </td>
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
    </>
  );
}

/* ---------- presentational helpers ---------- */
function StatCard({ label, value, icon, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${icon}`}>{iconSvg(icon)}</span>
      </div>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}

function iconSvg(kind) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'teal':
      return <svg viewBox="0 0 24 24" {...common}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
    case 'gold':
      return <svg viewBox="0 0 24 24" {...common}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    case 'green':
      return <svg viewBox="0 0 24 24" {...common}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
    case 'red':
      return <svg viewBox="0 0 24 24" {...common}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    default: return null;
  }
}