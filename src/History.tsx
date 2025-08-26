import { memo } from 'react'
import type { GenerationResult } from './api'

interface Props {
  history: GenerationResult[]
  onSelect: (item: GenerationResult) => void
}

const History = memo(function History({ history, onSelect }: Props) {
  if (history.length === 0) {
    return <p className="text-gray-500">No history yet</p>
  }
  return (
    <div>
      <h2 className="font-semibold mb-2">History</h2>
      <ul className="space-y-2">
        {history.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
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
                <p className="text-[10px] text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
})

export default History
