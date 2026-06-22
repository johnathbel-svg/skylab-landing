import { Users, Bot, Zap, Calendar } from 'lucide-react'

export interface ActivityEvent {
  id: string
  type: 'tenant_joined' | 'bot_created' | 'integration_connected'
  label: string
  sublabel?: string
  created_at: string
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'ahora mismo'
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours} h`
  if (diffDays === 1) return 'ayer'
  return `hace ${diffDays} días`
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
      {events && events.length > 0 ? (
        events.map((event) => {
          let Icon = Users
          let iconBg = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          if (event.type === 'bot_created') {
            Icon = Bot
            iconBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          } else if (event.type === 'integration_connected') {
            Icon = Zap
            iconBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }

          return (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:bg-slate-900/60 transition-colors"
            >
              <div className={`p-2 rounded-lg border ${iconBg} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{event.label}</p>
                {event.sublabel && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{event.sublabel}</p>
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-medium shrink-0 flex items-center gap-1 self-start mt-0.5">
                <Calendar className="w-3 h-3" />
                {formatRelativeTime(event.created_at)}
              </div>
            </div>
          )
        })
      ) : (
        <div className="text-center py-8 text-slate-500 text-sm">
          No recent activity found.
        </div>
      )}
    </div>
  )
}