import { useEffect, useRef, useState } from 'react'
import './App.css'
import { GenerationResult, mockGenerate } from './api'

const styleOptions = ['Editorial', 'Streetwear', 'Vintage']

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState(styleOptions[0])
  const [history, setHistory] = useState<GenerationResult[]>(() => {
    if (typeof window === 'undefined') return []
    const raw = window.localStorage.getItem('history')
    return raw ? (JSON.parse(raw) as GenerationResult[]) : []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    window.localStorage.setItem('history', JSON.stringify(history.slice(0, 5)))
  }, [history])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/png', 'image/jpeg'].includes(f.type)) {
      setError('Only PNG or JPG files are allowed')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      console.warn('File over 10MB, will downscale before sending')
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  const handleGenerate = () => {
    if (!file) return
    setLoading(true)
    setError(null)
    const controller = new AbortController()
    abortRef.current = controller
    attemptGenerate(controller, 0)
  }

  const attemptGenerate = async (controller: AbortController, attempt: number) => {
    try {
      const imageDataUrl = await resizeImage(file!)
      const result = await mockGenerate({
        imageDataUrl,
        prompt,
        style,
        signal: controller.signal,
      })
      setHistory((prev) => [result, ...prev].slice(0, 5))
      setPreview(result.imageUrl)
      setLoading(false)
      abortRef.current = null
    } catch (err) {
      if (controller.signal.aborted) {
        setError('Generation aborted')
        setLoading(false)
        abortRef.current = null
        return
      }
      if (attempt < 2) {
        const delay = 500 * 2 ** attempt
        setTimeout(() => attemptGenerate(controller, attempt + 1), delay)
      } else {
        setError((err as Error).message)
        setLoading(false)
        abortRef.current = null
      }
    }
  }

  const handleAbort = () => {
    abortRef.current?.abort()
  }

  const handleSelectHistory = (item: GenerationResult) => {
    setPrompt(item.prompt)
    setStyle(item.style)
    setPreview(item.imageUrl)
    setFile(null)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">AI Studio</h1>

      <div>
        <label htmlFor="image" className="block font-medium mb-1">
          Upload image
        </label>
        <input
          id="image"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleUpload}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {preview && (
        <img src={preview} alt="preview" className="max-h-60 object-contain" />
      )}

      <div>
        <label htmlFor="prompt" className="block font-medium mb-1">
          Prompt
        </label>
        <input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="style" className="block font-medium mb-1">
          Style
        </label>
        <select
          id="style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {styleOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Summary</h2>
        {preview && (
          <img
            src={preview}
            alt="summary preview"
            className="max-h-40 object-contain mb-2"
          />
        )}
        <p>
          <span className="font-medium">Prompt:</span> {prompt || '—'}
        </p>
        <p>
          <span className="font-medium">Style:</span> {style}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Generate
        </button>
        {loading && (
          <>
            <button
              type="button"
              onClick={handleAbort}
              className="px-4 py-2 bg-red-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Abort
            </button>
            <div role="status" aria-live="polite">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      {history.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">History</h2>
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelectHistory(item)}
                  className="flex items-center gap-2 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <img
                    src={item.imageUrl}
                    alt="history item"
                    className="w-16 h-16 object-cover"
                  />
                  <div>
                    <p className="text-sm">{item.prompt}</p>
                    <p className="text-xs text-gray-500">{item.style}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

async function resizeImage(file: File, maxSize = 1920): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg'))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default App
