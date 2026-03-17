import { useCallback, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"

type FileUploaderProps = {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)

    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB in bytes

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        setError(null);
        
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0]?.code === 'file-too-large') {
                setError("File is larger than 20 MB");
            } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                setError("Only PDF files are allowed");
            } else {
                setError(rejection.errors[0]?.message || "Invalid file");
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0])
            onFileSelect?.(acceptedFiles[0])
        }
    }, [onFileSelect])
    
    const { getRootProps, getInputProps } = useDropzone({ 
        onDrop, 
        maxFiles: 1, 
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: MAX_SIZE 
    })

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            <div className={`w-full gradient-border ${error ? 'border-red-500' : ''}`}>
                <div {...getRootProps()} className="p-8 flex flex-col items-center justify-center min-h-[200px] outline-none text-center">
                    <input {...getInputProps()} />
                    
                    {file ? (
                        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4 w-full max-w-md border border-slate-200">
                            <div className="flex items-center gap-4">
                                <img src="/images/pdf.png" alt="pdf" className="w-12 h-12 object-contain" />
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800 line-clamp-1">{file.name}</p>
                                    <p className="text-sm text-slate-500">{formatSize(file.size)}</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    onFileSelect?.(null);
                                }}
                            >
                                <img src="/icons/cross.svg" alt="remove" className="w-5 h-5 object-contain" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 cursor-pointer">
                            <div className="mx-auto w-16 h-16 flex items-center justify-center">
                                <img src="/icons/info.svg" alt="upload" className="size-20" />
                            </div>
                            <div>
                                <p className="text-lg text-gray-500">
                                    <span className="font-semibold">
                                        Click to upload
                                    </span> or drag and drop
                                </p>
                                <p className="text-lg text-gray-500">PDF (max 20 MB)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {error && (
                <p className="text-red-500 text-sm mt-2 font-medium text-center">{error}</p>
            )}
        </div>
    )
}

export default FileUploader