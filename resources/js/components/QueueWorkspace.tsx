import React, { useState, useEffect } from 'react';
import {
    Users, MessageSquare, Headphones, LogOut, CheckCircle2,
    Settings, Play, Pause, Loader2, AlertCircle, Phone
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatPanel } from './ChatPanel';
import { ManageQueues } from './ManageQueues';
import { LeadPanel } from './LeadPanel';
import type { CRMLead } from '@/types/crm';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// Tipos baseados no backend Laravel
interface ChatQueue {
    id: number;
    name: string;
    region: string | null;
    color: string;
    max_concurrent: number;
}

interface ChatSession {
    id: number;
    queue_id: number;
    contact_name: string;
    contact_phone: string;
    contact_segment: string | null;
    messages: any;
    status: 'waiting' | 'in_progress' | 'finished';
}

export function QueueWorkspace() {
    const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
    const [queues, setQueues] = useState<ChatQueue[]>([]);
    const [isOnline, setIsOnline] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);
    const [platforms, setPlatforms] = useState({
        whatsapp: false,
        instagram: false,
        facebook: false
    });

    const [viewMode, setViewMode] = useState<'queue' | 'all_leads' | 'manage'>('queue');
    const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);

    // Carregar dados iniciais da API
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Em produção, listaria sessões do Laravel: const s = await api.get('/chat/sessions/active');
                // Simulando carga local para a demonstração visual inicial:
                setQueues([
                    { id: 1, name: 'Fios PDO - SP', region: 'SP', color: '#8b5cf6', max_concurrent: 3 },
                    { id: 2, name: 'Suturas - Sul', region: 'Sul', color: '#10b981', max_concurrent: 3 },
                    { id: 3, name: 'Equipamentos (Nacional)', region: 'BR', color: '#f59e0b', max_concurrent: 2 },
                ]);

                // Simular que recuperamos sessões ativas do banco
                setActiveSessions([
                    {
                        id: 101,
                        queue_id: 1,
                        contact_name: 'Dra. Ana Beatriz Souza',
                        contact_phone: '11999998001',
                        contact_segment: 'Estética',
                        status: 'in_progress',
                        messages: []
                    },
                    {
                        id: 102,
                        queue_id: 2,
                        contact_name: 'Dr. Carlos Mendes',
                        contact_phone: '21988887001',
                        contact_segment: 'Cirurgia',
                        status: 'in_progress',
                        messages: []
                    }
                ]);
            } catch (error) {
                console.error('Erro ao carregar filas', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleToggleOnline = async () => {
        setIsOnline(!isOnline);
        if (!isOnline && activeSessions.length < 3) {
            // Simular entrada de um novo chat após 3 segundos
            setTimeout(() => {
                const newSession: ChatSession = {
                    id: 103,
                    queue_id: 1,
                    contact_name: 'Dra. Mariana Costa',
                    contact_phone: '31977776001',
                    contact_segment: 'Biomedicina',
                    status: 'in_progress',
                    messages: []
                };
                setActiveSessions(prev => [...prev, newSession]);
                // Toca som de notificação (simulado)
            }, 3000);
        }
    };

    const handleFinishSession = (id: number) => {
        setConfirmingId(id);
    };

    const confirmFinishSession = async (id: number) => {
        setActiveSessions(prev => prev.filter(s => s.id !== id));
        setActiveSessionId(currentId => currentId === id ? null : currentId);
        setConfirmingId(null);
        try {
            // Em produção reativar: await api.post(`/chat/sessions/${id}/finish`);
        } catch (e) {
            console.warn('Erro ao encerrar na API');
        }
    };

    // Converter ChatSession para o formato CRMLead exigido pelo ChatPanel
    const sessionToLead = (session: ChatSession): CRMLead => ({
        id: `demo-${session.id}`, // prefixo para carregar scripts demo localmente
        name: session.contact_name,
        phone: session.contact_phone,
        status: 'em_atendimento',
        segment: 'medico', // Fix do typescript
        ai_score_hot: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    if (viewMode === 'manage') {
        return <ManageQueues onBack={() => setViewMode('queue')} />;
    }

    if (viewMode === 'all_leads') {
        return (
            <div className="flex w-full h-full gap-4">
                <div className="w-[400px] flex-shrink-0 flex flex-col gap-4">
                    <button
                        onClick={() => setViewMode('queue')}
                        className="p-3 bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-slate-700 transition"
                    >
                        <Headphones className="w-4 h-4" /> Voltar para Meus Atendimentos
                    </button>
                    <div className="flex-1">
                        <LeadPanel onSelectLead={setSelectedLead} activeLeadId={selectedLead?.id} />
                    </div>
                </div>
                <div className="flex-1">
                    {selectedLead ? (
                        <ChatPanel key={selectedLead.id} lead={selectedLead} />
                    ) : (
                        <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-3xl items-center justify-center text-slate-500">
                            <Users className="w-16 h-16 opacity-20 mb-4" />
                            <p className="font-medium text-lg">Selecione um lead no painel para ver detalhes.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const activeSession = activeSessions.find(s => s.id === activeSessionId);

    return (
        <div className="flex w-full h-full gap-4">
            {/* ── Painel Esquerdo: Fila do Agente ────────────────────────── */}
            <div className="w-[360px] flex-shrink-0 flex flex-col gap-4 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-5 overflow-y-auto custom-scrollbar">

                <div className="flex justify-between items-center bg-[#1f2c34] -mx-5 -mt-5 px-5 py-4 border-b border-white/5 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                            <Headphones className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-sm uppercase tracking-widest">Painel de Fila</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-600")} />
                                <span className={cn("text-[10px] uppercase font-bold", isOnline ? "text-emerald-400" : "text-slate-500")}>
                                    {isOnline ? 'Recebendo Chats' : 'Pausado'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setViewMode('manage')}
                        className="p-2 text-slate-400 hover:text-white transition rounded-xl hover:bg-white/5"
                        title="Gestão de Filas"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                {/* Conexão com Plataformas */}
                <div className="space-y-2">
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-500 px-1">Conectar Plataformas</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setPlatforms(p => ({ ...p, whatsapp: !p.whatsapp }))}
                            className={cn(
                                "py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all",
                                platforms.whatsapp ? "bg-[#25D366]/20 border-[#25D366]/50 shadow-[0_0_10px_rgba(37,211,102,0.2)]" : "bg-white/5 border-white/5 hover:bg-white/10 opacity-60 grayscale hover:grayscale-0"
                            )}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" />
                            <span className={cn("text-[9px] font-bold uppercase", platforms.whatsapp ? "text-[#25D366]" : "text-slate-400")}>WhatsApp</span>
                        </button>
                        <button
                            onClick={() => setPlatforms(p => ({ ...p, instagram: !p.instagram }))}
                            className={cn(
                                "py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all overflow-hidden relative",
                                platforms.instagram ? "border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.2)]" : "bg-white/5 border-white/5 hover:bg-white/10 opacity-60 grayscale hover:grayscale-0"
                            )}>
                            {platforms.instagram && <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 via-pink-500/20 to-purple-500/20" />}
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" className="w-5 h-5 relative z-10" />
                            <span className={cn("text-[9px] font-bold uppercase relative z-10", platforms.instagram ? "text-pink-400" : "text-slate-400")}>Instagram</span>
                        </button>
                        <button
                            onClick={() => setPlatforms(p => ({ ...p, facebook: !p.facebook }))}
                            className={cn(
                                "py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all",
                                platforms.facebook ? "bg-[#1877F2]/20 border-[#1877F2]/50 shadow-[0_0_10px_rgba(24,119,242,0.2)]" : "bg-white/5 border-white/5 hover:bg-white/10 opacity-60 grayscale hover:grayscale-0"
                            )}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" className="w-5 h-5" />
                            <span className={cn("text-[9px] font-bold uppercase", platforms.facebook ? "text-[#1877F2]" : "text-slate-400")}>Facebook</span>
                        </button>
                    </div>
                </div>

                {/* Status de Atendimento */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-end">
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Capacidade</p>
                        <p className="text-2xl font-black text-white">{activeSessions.length}<span className="text-sm text-slate-500">/3</span></p>
                    </div>

                    <button
                        onClick={handleToggleOnline}
                        className={cn(
                            "w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                            isOnline
                                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                        )}
                    >
                        {isOnline ? (
                            <><Pause className="w-4 h-4" /> Pausar Recebimento</>
                        ) : (
                            <><Play className="w-4 h-4" /> Iniciar Atendimentos</>
                        )}
                    </button>
                    {isOnline && activeSessions.length < 3 && (
                        <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" /> Aguardando novo chat...
                        </div>
                    )}
                </div>

                {/* Minhas Filas Restritas (Apenas Visual) */}
                <div className="space-y-2">
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-500 px-1">Filas Designadas</h3>
                    {queues.map(q => (
                        <div key={q.id} className="flex items-center justify-between p-3 bg-slate-950/30 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: q.color }} />
                                <span className="text-xs font-bold text-slate-300">{q.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">Max: {q.max_concurrent}</span>
                        </div>
                    ))}
                </div>

                {/* Conversas Ativas */}
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[10px] uppercase tracking-widest font-black text-indigo-400">Atendimentos Ativos</h3>
                    </div>

                    {activeSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                            <MessageSquare className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-[10px] uppercase font-bold tracking-widest">Nenhum chat ativo</p>
                        </div>
                    ) : (
                        activeSessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => setActiveSessionId(session.id)}
                                className={cn(
                                    "p-3 rounded-2xl border cursor-pointer transition-all group",
                                    activeSessionId === session.id
                                        ? "bg-[#1f2c34] border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                                        : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border border-white/10">
                                        <AvatarFallback className="bg-slate-800 text-white font-black text-[10px]">
                                            {session.contact_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold text-xs truncate group-hover:text-emerald-400 transition-colors">{session.contact_name}</h4>
                                        <p className="text-[10px] text-slate-400 font-mono truncate">{session.contact_phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <Badge variant="outline" className="text-[8px] border-indigo-500/20 text-indigo-400 uppercase tracking-widest">
                                        {queues.find(q => q.id === session.queue_id)?.name || 'Fila'}
                                    </Badge>

                                    {activeSessionId === session.id && (
                                        confirmingId === session.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmingId(null); }}
                                                    className="px-2 py-1 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded text-[9px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); confirmFinishSession(session.id); }}
                                                    className="px-2 py-1 bg-red-500 hover:bg-red-400 text-white rounded text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                                                >
                                                    Confirmar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleFinishSession(session.id); }}
                                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-[9px] font-black uppercase tracking-widest transition-all"
                                            >
                                                Encerrar
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                    <button
                        onClick={() => setViewMode('all_leads')}
                        className="w-full p-3 bg-slate-950/50 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex justify-center items-center gap-2"
                    >
                        <Users className="w-4 h-4" /> Buscar Todos os Leads
                    </button>
                </div>

            </div>

            {/* ── Painel Direito: Chat do Lead Selecionado ───────────────── */}
            <div className="flex-1 overflow-hidden relative">
                {activeSession ? (
                    // Convertemos o formato do ChatSession para CRMLead para reaproveitar seu lindo ChatPanel
                    <ChatPanel key={activeSession.id} lead={sessionToLead(activeSession)} />
                ) : (
                    <div className="flex flex-col h-full bg-[#111b21] border border-white/5 rounded-3xl items-center justify-center text-slate-500 border-dashed">
                        {isOnline ? (
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] animate-ping" />
                                </div>
                                <h3 className="text-white font-bold text-lg">Aguardando novos chats</h3>
                                <p className="text-sm mt-2 opacity-60">Seus próximos atendimentos da fila aparecerão aqui automaticamente.</p>
                            </div>
                        ) : (
                            <>
                                <Headphones className="w-16 h-16 opacity-20 mb-4" />
                                <h3 className="text-white font-bold text-lg">Central de Atendimento</h3>
                                <p className="text-sm mt-2 opacity-60">Selecione um atendimento ativo ao lado ou clique iniciar para receber a fila.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
