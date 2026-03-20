import { useRef, useState } from 'react';
import './PhotoUpload.css';

export default function PhotoUpload({ currentPhoto, name, size = 72, onUpload, loading }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(currentPhoto || null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) {
      alert('Imagem muito grande. Use uma foto menor que 500kb.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onUpload(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="photo-upload" style={{ width: size, height: size }}>
      <div className="photo-circle" style={{ width: size, height: size }}
        onClick={() => !loading && inputRef.current.click()}>
        {preview ? (
          <img src={preview} alt="Foto de perfil" className="photo-img" />
        ) : (
          <span className="photo-initial" style={{ fontSize: size * 0.38 }}>
            {name?.charAt(0)?.toUpperCase()}
          </span>
        )}
        <div className="photo-overlay">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        {loading && <div className="photo-loading" />}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}