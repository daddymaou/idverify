import { useRef, useState, DragEvent, ChangeEvent } from 'react'

interface UploadZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function UploadZone({ onFile, disabled }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Unsupported format. Use PNG, JPG, or WebP.'
    }
    if (file.size > MAX_SIZE) {
      return 'File too large. Maximum size is 10MB.'
    }
    return null
  }

  function handleFile(file: File) {
    setError(null)
    const err = validate(file)
    if (err) {
      setError(err)
      return
    }
    onFile(file)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="w-full">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          w-full border-2 border-dashed border-black
          flex flex-col items-center justify-center
          py-16 px-8 cursor-pointer select-none
          transition-colors duration-100
          ${dragging ? 'bg-black' : 'bg-white hover:bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onChange}
          disabled={disabled}
          className="hidden"
        />

        <div className={`text-center ${dragging ? 'text-white' : 'text-black'}`}>
          <div className="text-4xl mb-4 font-mono font-bold">
            {dragging ? '[ DROP NOW ]' : '[ + ]'}
          </div>
          <p className="text-lg font-semibold mb-2">
            {dragging ? 'Release to upload' : 'Drop image or click to upload'}
          </p>
          <p className="text-sm font-mono text-gray-500">
            PNG · JPG · WebP · Max 10MB
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm font-mono text-black border border-black px-3 py-2 bg-gray-100">
          ERROR: {error}
        </p>
      )}
    </div>
  )
}
