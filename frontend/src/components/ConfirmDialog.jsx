export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h3 style={{ marginBottom: 8 }}>{title}</h3>
        <p style={{ marginBottom: 20, color: '#4b5563' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  modal: {
    background: 'white', padding: 24, borderRadius: 10, width: 400, maxWidth: '90%',
  },
};