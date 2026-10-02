import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

export function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#e5e7eb', text: '#374151' };
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
    }}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const c = PRIORITY_COLORS[priority] || { bg: '#e5e7eb', text: '#374151' };
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
    }}>
      {priority}
    </span>
  );
}