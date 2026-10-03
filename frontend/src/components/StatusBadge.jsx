import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

export function StatusBadge({ status }) {
  const cls = {
    'Planning': 'badge-status-planning',
    'In Progress': 'badge-status-in-progress',
    'On Hold': 'badge-status-on-hold',
    'Completed': 'badge-status-completed',
  }[status] || 'badge-status-planning';

  return <span className={`badge ${cls}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  const cls = {
    'Low': 'badge-priority-low',
    'Medium': 'badge-priority-medium',
    'High': 'badge-priority-high',
  }[priority] || 'badge-priority-low';

  return <span className={`badge ${cls}`}>{priority}</span>;
}