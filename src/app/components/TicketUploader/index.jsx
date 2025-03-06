"use client";
import { useState, useRef, useEffect } from "react";
import { useImageHandling } from "./hooks/useImageHandling";
import { useTicketProcessing } from "./hooks/useTicketProcessing";
import { useDarkMode } from "./hooks/useDarkMode";
import { UploadArea } from "./components/UploadArea";
import { ProcessingPanel } from "./components/ProcessingPanel";
import { ExtractedDataPreview } from "./components/ExtractedDataPreview";
import { ImagePreviewModal } from "./components/ImagePreviewModal";
import { Header } from "./components/Header";

export default function TicketUploader({ onUploadComplete }) {
  const {
    imageFile,
    imagePreview,
    imageOrientation,
    handleFileChange,
    handleDrop,
    rotateImage,
    clearImage,
  } = useImageHandling();

  const {
    progress,
    processStatus,
    extractedData,
    uploadProgress,
    processingStep,
    errorDetails,
    handleCapture,
  } = useTicketProcessing({ imageFile, onUploadComplete });

  const { isDarkMode } = useDarkMode();
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [ticketType, setTicketType] = useState("individual");
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleSelectFile = () => fileInputRef.current?.click();
  const handleCapturePhoto = () => cameraInputRef.current?.click();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 sm:p-8 rounded-2xl shadow-xl space-y-6 sm:space-y-8 transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <Header ticketType={ticketType} setTicketType={setTicketType} />

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col gap-4">
          <UploadArea
            imageFile={imageFile}
            imagePreview={imagePreview}
            imageOrientation={imageOrientation}
            processStatus={processStatus}
            uploadProgress={uploadProgress}
            errorDetails={errorDetails}
            handleDrop={handleDrop}
            handleSelectFile={handleSelectFile}
            handleCapturePhoto={handleCapturePhoto}
            rotateImage={rotateImage}
            clearImage={clearImage}
            setShowFullPreview={setShowFullPreview}
          />

          <ExtractedDataPreview 
            processStatus={processStatus}
            extractedData={extractedData}
          />
        </div>

        <ProcessingPanel
          imageFile={imageFile}
          processStatus={processStatus}
          progress={progress}
          uploadProgress={uploadProgress}
          processingStep={processingStep}
          errorDetails={errorDetails}
          handleCapture={handleCapture}
          clearImage={clearImage}
        />
      </div>

      <ImagePreviewModal
        show={showFullPreview}
        imagePreview={imagePreview}
        imageOrientation={imageOrientation}
        onClose={() => setShowFullPreview(false)}
        onRotate={rotateImage}
        onDelete={() => {
          clearImage();
          setShowFullPreview(false);
        }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        aria-label="Seleccionar imagen"
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        ref={cameraInputRef}
        className="hidden"
        aria-label="Tomar foto con cámara"
      />
    </div>
  );
}
