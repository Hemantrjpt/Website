import { useRef, useState } from 'react';
import { api, resolveAssetUrl } from '../../api/client';
import { useToast } from '../../hooks/useToast';

export default function ImageUploadField({ label, value, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const showToast = useToast();

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      onChange(url);
      showToast('Image uploaded');
    } catch (err) {
      showToast(err.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file later
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        {value ? (
          <img
            src={resolveAssetUrl(value)}
            alt=""
            style={{ width: 56, height: 56, objectFit: 'cover', border: '1px solid var(--border)', background: 'var(--bg-void)' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div style={{ width: 56, height: 56, border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)', fontSize: '0.7rem' }}>
            none
          </div>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>
      <input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste an image URL directly"
      />
    </div>
  );
}
