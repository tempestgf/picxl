import { useState } from 'react';

export const useImageHandling = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageOrientation, setImageOrientation] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorDetails("El archivo seleccionado no es una imagen. Por favor selecciona un archivo JPEG, PNG o HEIC.");
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const rotateImage = () => {
    setImageOrientation((prev) => (prev + 90) % 360);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageOrientation(0);
  };

  return {
    imageFile,
    imagePreview,
    imageOrientation,
    handleFileChange,
    handleDrop,
    rotateImage,
    clearImage,
  };
};
