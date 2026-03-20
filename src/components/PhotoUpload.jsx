import { useRef, useState } from 'react';
import './PhotoUpload.css';

function compressImage(file, maxSizeKb = 400) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Reduz dimensões se necessário
        const maxDim = 600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * maxDim / width);
            width = maxDim;
          } else {
            width = Math.round(width * maxDim / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Comprime progressivamente até atingir o tamanho alvo
        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);

        while (result.length > maxSizeKb * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoUpload({ currentPhoto, name, size = 72, onUpload, loading }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(currentPhoto || null);
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      onUpload(compressed);
    } catch {
      alert('Erro ao processar a imagem. Tente outra foto.');
    } finally {
      setCompressing(false);
    }
  };

  const isLoading = loading || compressing;

  return (
    <div className="photo-upload" style={{ width: size, height: size }}>
      <div className="photo-circle" style={{ width: size, height: size }}
        onClick={() => !isLoading && inputRef.current.click()}>
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
        {isLoading && <div className="photo-loading" />}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}