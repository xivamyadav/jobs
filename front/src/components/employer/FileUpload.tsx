'use client'

import { FC, useState, useCallback } from 'react'
import { Upload } from 'lucide-react'

interface FileUploadProps {
    onFileSelect?: (file: File) => void
    accept?: string
    multiple?: boolean
}

const FileUpload: FC<FileUploadProps> = ({ onFileSelect, accept = '*', multiple = false }) => {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback(() => {
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files.length > 0 && onFileSelect) {
            onFileSelect(files[0])
        }
    }, [onFileSelect])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files
        if (files && files.length > 0 && onFileSelect) {
            onFileSelect(files[0])
        }
    }, [onFileSelect])

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
        >
            <input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Drag and drop files here or click to select</span>
            </label>
        </div>
    )
}

export default FileUpload