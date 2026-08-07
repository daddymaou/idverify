interface CheckRowProps {
  label: string
  value: string
  status?: 'pass' | 'fail' | 'warn' | 'neutral'
}

export default function CheckRow({ label, value, status = 'neutral' }: CheckRowProps) {
  const indicator =
    status === 'pass' ? '✓' :
    status === 'fail' ? '✗' :
    status === 'warn' ? '⚠' : null

  const indicatorColor =
    status === 'pass' ? 'text-black' :
    status === 'fail' ? 'text-black' :
    status === 'warn' ? 'text-black' : ''

  return (
    <div className="flex items-center justify-between border-b border-gray-300 py-4 px-0">
      <span className="text-xs font-mono font-bold tracking-widest text-gray-500 uppercase w-1/3">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-right flex items-center gap-2">
        {indicator && (
          <span className={`text-lg font-bold ${indicatorColor}`}>{indicator}</span>
        )}
        {value}
      </span>
    </div>
  )
}
