interface ActionCardProps {
    icon: React.ReactNode
    title: string
    description: string
    onAction: () => void
}

export default function ActionCard({ icon, title, description, onAction }: ActionCardProps) {
    return (
        <div className="glass-panel p-6 flex gap-4 items-start hover:scale-[1.02] transition-transform cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/10 transition-all">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-white mb-2">{title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
            </div>
            <button
                onClick={onAction}
                className="cyber-button px-4 py-2 text-sm flex-shrink-0"
            >
                Ver
            </button>
        </div>
    )
}
