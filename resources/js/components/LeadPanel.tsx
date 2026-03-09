import React, { useState, useEffect } from 'react';
import { Search, Filter, Flame, CheckCircle2, Clock, ChevronRight, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '../lib/supabase';
import type { CRMLead, LeadStatus } from '../types/crm';
import { cn } from '../lib/utils';

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: React.ReactNode }> = {
    novo: { label: 'Novo', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <Clock className="w-3 h-3" /> },
    em_atendimento: { label: 'Atendimento', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: <MessageSquare className="w-3 h-3" /> },
    aguardando_pagamento: { label: 'Pagamento', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: <Clock className="w-3 h-3" /> },
    convertido: { label: 'Convertido', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
    perdido: { label: 'Perdido', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <Clock className="w-3 h-3" /> },
};

interface LeadPanelProps {
    onSelectLead: (lead: CRMLead) => void;
    activeLeadId?: string;
}

export function LeadPanel({ onSelectLead, activeLeadId }: LeadPanelProps) {
    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchLeads = async () => {
            const { data } = await supabase
                .from('crm_leads')
                .select('*')
                .order('updated_at', { ascending: false });

            if (data) setLeads(data);
            setLoading(false);
        };

        fetchLeads();

        // Subscribe to changes
        const subscription = supabase
            .channel('crm_leads_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_leads' }, () => {
                fetchLeads();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const DEMO_LEADS: CRMLead[] = [
        {
            id: 'demo-1',
            name: 'Dra. Ana Beatriz Souza',
            phone: '11999998001',
            status: 'em_atendimento' as LeadStatus,
            specialty: 'Dermatologista',
            segment: 'Estética',
            ai_score_hot: true,
            ai_analysis_summary: 'Alta intenção de compra detectada. Perguntou sobre volume pricing para Fios PDO.',
            crm_license: 'CRM-SP-123456',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 'demo-2',
            name: 'Dr. Carlos Mendes',
            phone: '21988887001',
            status: 'novo' as LeadStatus,
            specialty: 'Cirurgião Plástico',
            segment: 'Cirurgia',
            ai_score_hot: false,
            ai_analysis_summary: 'Primeiro contato via Instagram. Solicitou catálogo de suturas.',
            crm_license: 'CRM-RJ-654321',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 'demo-3',
            name: 'Dra. Mariana Costa',
            phone: '31977776001',
            status: 'aguardando_pagamento' as LeadStatus,
            specialty: 'Biomédica Esteticista',
            segment: 'Biomedicina',
            ai_score_hot: true,
            ai_analysis_summary: 'Proposta enviada. Aguardando aprovação financeira para 20 boxes.',
            crm_license: 'CRBM-MG-789012',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];

    const displayLeads = leads.length > 0 ? leads : DEMO_LEADS;
    const filteredLeads = displayLeads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search)
    );

    return (
        <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Painel de Leads</h2>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 px-3 py-1">
                        {displayLeads.length} Contatos
                    </Badge>
                </div>

                {leads.length === 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">⚡ Modo Demo — dados simulados</span>
                    </div>
                )}

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nome ou telefone..."
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-indigo-500/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <Filter className="w-5 h-5 text-slate-300" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-3">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest">Carregando Leads...</p>
                    </div>
                ) : filteredLeads.map((lead) => (

                    <Card
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        className={cn(
                            "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group hover:border-indigo-500/30 overflow-hidden",
                            activeLeadId === lead.id && "bg-indigo-500/10 border-indigo-500/30"
                        )}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <Avatar className="w-12 h-12 border-2 border-white/10 group-hover:border-indigo-500/50 transition-all">
                                    <AvatarFallback className="bg-slate-800 text-slate-300 font-bold">
                                        {lead.name?.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors">{lead.name}</h3>
                                        <div className="flex items-center gap-2">
                                            {lead.ai_score_hot && (
                                                <div className="animate-pulse flex items-center gap-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    <Flame className="w-3 h-3" /> Hot
                                                </div>
                                            )}
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {new Date(lead.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <p className="line-clamp-1 flex-1">{lead.ai_analysis_summary || 'Sem análise recente.'}</p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <Badge variant="outline" className={cn("text-[10px] h-5 px-2 flex items-center gap-1", statusConfig[lead.status as LeadStatus].color)}>
                                            {statusConfig[lead.status as LeadStatus].icon}
                                            {statusConfig[lead.status as LeadStatus].label}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] h-5 px-2 border-white/5 bg-white/5 text-slate-400 font-bold uppercase">
                                            {lead.segment}
                                        </Badge>
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-500 transition-all self-center" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
