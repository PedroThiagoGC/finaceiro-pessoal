'use client';

import { OcrResult, useUploadFile } from '@/lib/attachments';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FileUploadProps {
  onUploadComplete?: (result: {
    attachmentId: string;
    ocrResult?: OcrResult;
  }) => void;
  transactionId?: string;
  processOcr?: boolean;
}

export function FileUpload({
  onUploadComplete,
  transactionId,
  processOcr = true,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadMutation = useUploadFile();

  // Define atributo 'capture' via JS para evitar aviso do linter em browsers desktop
  useEffect(() => {
    if (cameraInputRef.current) {
      cameraInputRef.current.setAttribute('capture', 'environment');
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    setSelectedFile(file);

    // Preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        transactionId,
        processOcr,
      });

      if (onUploadComplete) {
        onUploadComplete({
          attachmentId: result.attachmentId,
          ocrResult: result.ocrResult,
        });
      }

      // Reset
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div>
          {/* Botões rápidos para câmera e arquivos */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tirar foto (Câmera)
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Selecionar arquivo
            </button>
            {/* Inputs ocultos */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              aria-label="Abrir câmera para tirar foto"
              title="Abrir câmera para tirar foto"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleChange}
              className="hidden"
              aria-label="Selecionar arquivo de imagem ou PDF"
              title="Selecionar arquivo de imagem ou PDF"
            />
          </div>

          {/* Dropzone clicável (abre seletor de arquivo) */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <div className="space-y-2">
              <div className="text-4xl">�</div>
              <p className="text-gray-600">
                Arraste uma imagem ou PDF aqui, clique para selecionar, ou use a câmera
              </p>
              <p className="text-sm text-gray-400">
                Formatos suportados: JPG, PNG, PDF
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {preview && (
            <div className="border rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-contain bg-gray-100"
              />
            </div>
          )}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {selectedFile.type.startsWith('image/') ? '🖼️' : '📄'}
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={uploadMutation.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {uploadMutation.isPending ? 'Processando...' : 'Enviar'}
              </button>
            </div>
          </div>
          {uploadMutation.isPending && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="text-blue-700">
                  {processOcr
                    ? 'Enviando e processando OCR...'
                    : 'Enviando arquivo...'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
