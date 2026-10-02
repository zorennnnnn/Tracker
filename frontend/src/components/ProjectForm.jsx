import { useEffect, useState } from 'react';
import { STATUSES, PRIORITIES } from '../utils/constants';

const EMPTY = {
  client_name: '',
  project_name: '',
  status: 'Planning',
  priority: 'Medium',
  start_date: '',
  due_date: '',
};

export default function ProjectForm({ open, initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState([]);
  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
      setErrors([]);
      setClientErrors({});
    }
  }, [open, initial]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Client-side validation matching backend rules
  const validate = () => {
    const errs = {};
    if (!form.client_name.trim()) errs.client_name = 'Client name is required';
    if (!form.project_name.trim()) errs.project_name = 'Project name is required';
    if (!form.start_date) errs.start_date = 'Start date is required';
    if (!form.due_date) errs.due_date = 'Due date is required';
    if (form.start_date && form.due_date && form.due_date < form.start_date) {
      errs.due_date = 'Due date cannot be earlier than start date';
    }
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit(form);
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      } else {
        setErrors(['Something went wrong. Please try again.']);
      }
    }
  };

  return (
    <div style={styles.backdrop}>
      <form onSubmit={handleSubmit} style={styles.modal}>
        <h2 style={{ marginBottom: 20 }}>
          {initial ? 'Edit Project' : 'New Project'}
        </h2>

        {errors.length > 0 && (
          <div style={styles.errorBox}>
            {errors.map((msg, i) => <div key={i}>• {msg}</div>)}
          </div>
        )}

        <div style={styles.grid}>
          <Field label="Client Name" error={clientErrors.client_name}>
            <input
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              placeholder="Acme Corp"
            />
          </Field>

          <Field label="Project Name" error={clientErrors.project_name}>
            <input
              name="project_name"
              value={form.project_name}
              onChange={handleChange}
              placeholder="Website Redesign"
            />
          </Field>

          <Field label="Status">
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Priority">
            <select name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="Start Date" error={clientErrors.start_date}>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
          </Field>

          <Field label="Due Date" error={clientErrors.due_date}>
            <input type="date" name="due_date" value={form.due_date} onChange={handleChange} />
          </Field>
        </div>

        <div style={styles.actions}>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : initial ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, full, children }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      {children}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: 16, overflowY: 'auto',
  },
  modal: {
    background: 'white', padding: 24, borderRadius: 10,
    width: 600, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20,
  },
  actions: {
    display: 'flex', justifyContent: 'flex-end', gap: 8,
  },
  errorBox: {
    background: '#fee2e2', color: '#991b1b', padding: 12,
    borderRadius: 6, marginBottom: 16, fontSize: 13,
  },
};