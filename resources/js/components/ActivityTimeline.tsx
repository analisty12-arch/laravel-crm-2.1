import { useState, useEffect } from 'react';
import {
    PhoneCall,
    Users,
    Mail,
    MessageSquare,
    FileText,
    Clock,
    Send,
    Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { CRMLead, CRMActivity, ActivityType } from '@/types/crm';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const activityIconMap: Record<ActivityType, { icon: any, color: string, label: string }> = {
    call: { icon: PhoneCall, color: 'text-blue-400 bg-blue-500/10', label: 'Ligação' },
    meeting: { icon: Users, color: 'text-purple-400 bg-purple-500/10', label: 'Reunião' },
    email: { icon: Mail, color: 'text-orange-400 bg-orange-500/10', label: 'Email' },
    whatsapp: { icon: MessageSquare, color: 'text-green-400 bg-green-500/10', label: 'WhatsApp' },
    note: { icon: FileText, color: 'text-slate-400 bg-slate-500/10', label: 'Nota Interna' },
    visit: { icon: Users, color: 'text-indigo-400 bg-indigo-500/10', label: 'Visita' },
};

export function ActivityTimeline({ lead }: { lead: CRMLead }) {
    const [activities, setActivities] = useState<CRMActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [newActivity, setNewActivity] = useState('');
    const [activityType, setActivityType] = useState<ActivityType>('note');
    const [saving, setSaving] = useState(false);

    const fetchActivities = async () => {
        const { data } = await supabase
            .from('crm_activities')
            .select('*')
            .eq('lead_id', lead.id)
            .order('created_at', { ascending: false });

        if (data) setActivities(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchActivities();
    }, [lead.id]);

    const handleAddActivity = async () => {
        if (!newActivity.trim()) return;
        setSaving(true);

        const { error } = await supabase
            .from('crm_activities')
            .insert({
                lead_id: lead.id,
                type: activityType,
                description: newActivity
            });

        if (!error) {
            setNewActivity('');
            fetchActivities();
        }
        setSaving(false);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden p-6 space-y-6">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 shadow-inner">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registrar Atividade de Venda</label>

                <div className="flex flex-wrap gap-2">
                    {(Object.keys(activityIconMap) as ActivityType[]).map((type) => {
                        const Icon = activityIconMap[type].icon;
                        return (
                            <button
                                key={type}
                                onClick={() => setActivityType(type)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                                    activityType === type
                                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                )}
                            >
                                <Icon className={cn("w-3 h-3", activityType === type ? "text-white" : activityIconMap[type].color.split(' ')[0])} />
                                {activityIconMap[type].label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-2">
                    <textarea
                        className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 p-3 text-sm focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none min-h-[80px]"
                        placeholder={`Detalhes da ${activityIconMap[activityType].label.toLowerCase()}...`}
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                    />
                    <button
                        onClick={handleAddActivity}
                        disabled={saving || !newActivity.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:opacity-50 text-white p-4 rounded-xl shadow-lg transition-all active:scale-95 self-end"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/5 text-slate-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-slate-500 italic">Nenhuma atividade registrada ainda.</p>
                    </div>
                ) : (
                    <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-px before:bg-white/5">
                        {activities.map((activity) => {
                            const Icon = activityIconMap[activity.type].icon;
                            return (
                                <div key={activity.id} className="relative group">
                                    <div className={cn(
                                        "absolute -left-[1.65rem] top-1 p-1.5 rounded-full border border-slate-900 z-10",
                                        activityIconMap[activity.type].color
                                    )}>
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-sm group-hover:bg-white/[0.04] transition-all group-hover:border-white/10 group-hover:translate-x-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-widest", activityIconMap[activity.type].color)}>
                                                {activityIconMap[activity.type].label}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                                {new Date(activity.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{activity.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
