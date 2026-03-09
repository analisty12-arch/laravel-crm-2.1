import React, { useState } from 'react';
import {
    Settings, Plus, Search, MapPin, Users, Hash, Palette,
    Save, Trash2, ArrowLeft, BarChart3, Activity, Briefcase, CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface User {
    id: number;
    name: string;
    role: string;
}

interface ChatQueue {
    id: number;
    name: string;
    region: string;
    color: string;
    max_concurrent: number;
    description: string;
    is_active: boolean;
    agentIds: number[];
}

// Simulando banco de usuários do RH
const MOCK_USERS: User[] = [
    { id: 1, name: 'Pedro Alves', role: 'Vendedor Sênior' },
    { id: 2, name: 'Camila Rocha', role: 'Especialista Estética' },
    { id: 3, name: 'Roberto Lima', role: 'Closer Equipamentos' },
    { id: 4, name: 'Mariana Silva', role: 'SDR' },
    { id: 5, name: 'João Martins', role: 'Pós-Vendas' },
];

interface ManageQueuesProps {
    onBack: () => void;
}

export function ManageQueues({ onBack }: ManageQueuesProps) {
    const [queues, setQueues] = useState<ChatQueue[]>([
        { id: 1, name: 'Fios PDO - SP', region: 'SP', color: '#8b5cf6', max_concurrent: 3, description: 'Foco exclusivo clínicas Zona Sul e Jardins', is_active: true, agentIds: [1, 2] },
        { id: 2, name: 'Suturas - Sul', region: 'RS/SC/PR', color: '#10b981', max_concurrent: 3, description: 'Expansão sul', is_active: true, agentIds: [2, 4] },
        { id: 3, name: 'Equipamentos (Nacional)', region: 'Brasil', color: '#f59e0b', max_concurrent: 2, description: 'Vendas complexas', is_active: false, agentIds: [3] },
    ]);

    const [selectedQueueId, setSelectedQueueId] = useState<number | null>(1);
    const [searchTerm, setSearchTerm] = useState('');

    const bgColors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];

    const handleCreateNew = () => {
        const newQ: ChatQueue = {
            id: Date.now(),
            name: 'Nova Fila',
            region: '',
            color: '#3b82f6',
            max_concurrent: 3,
            description: '',
            is_active: true,
            agentIds: []
        };
        setQueues([newQ, ...queues]);
        setSelectedQueueId(newQ.id);
    };

    const sQueue = queues.find(q => q.id === selectedQueueId);

    const updateCurrent = (updates: Partial<ChatQueue>) => {
        setQueues(prev => prev.map(q => q.id === selectedQueueId ? { ...q, ...updates } : q));
    };

    const toggleAgent = (userId: number) => {
        if (!sQueue) return;
        const has = sQueue.agentIds.includes(userId);
        updateCurrent({
            agentIds: has
                ? sQueue.agentIds.filter(id => id !== userId)
                : [...sQueue.agentIds, userId]
        });
    };

    return (
        <div className="flex w-full h-full gap-4 relative animate-in fade-in zoom-in-95 duration-500">
            {/* ── PAINEL ESQUERDO: Lista de Filas ───────────────────────── */}
            <div className="w-[360px] flex-shrink-0 flex flex-col gap-4 bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-3xl p-5 shadow-2xl overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 bg-[#1f2c34] -mx-5 -mt-5 px-5 py-4 border-b border-white/5 shadow-md">
                    <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition rounded-xl hover:bg-white/5">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                            <Settings className="w-4 h-4 text-emerald-400" /> Gestão de Filas
                        </h2>
                    </div>
                </div>

                <button
                    onClick={handleCreateNew}
                    className="w-full h-12 border border-dashed border-emerald-500/50 hover:bg-emerald-500/10 hover:border-emerald-500 rounded-xl flex items-center justify-center gap-2 text-emerald-400 font-bold tracking-widest uppercase text-[11px] transition-all"
                >
                    <Plus className="w-4 h-4" /> Nova Fila
                </button>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar filas..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1f2c34] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                </div>

                <div className="space-y-2 mt-2">
                    {queues
                        .filter(q => q.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(q => (
                            <div
                                key={q.id}
                                onClick={() => setSelectedQueueId(q.id)}
                                className={cn(
                                    "p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between",
                                    selectedQueueId === q.id
                                        ? "bg-indigo-500/10 border-indigo-500/30"
                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: q.color }} />
                                    <div>
                                        <h4 className={cn("text-xs font-bold", selectedQueueId === q.id ? "text-indigo-400" : "text-slate-300")}>{q.name}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{q.agentIds.length} Colaboradores</p>
                                    </div>
                                </div>
                                {!q.is_active && <Badge variant="outline" className="text-[9px] border-red-500/20 text-red-500">Inativa</Badge>}
                            </div>
                        ))}
                </div>
            </div>

            {/* ── PAINEL DIREITO: Configuração da Fila Selecionada ──────── */}
            <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                {sQueue ? (
                    <>
                        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#1f2c34]/50">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: sQueue.color }} />
                                    {sQueue.name || 'Fila sem nome'}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Configure os limites e os agentes designados para esta demanda.</p>
                            </div>
                            <button
                                onClick={() => { alert('Fila salva no banco de dados!'); }}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                            >
                                <Save className="w-4 h-4" /> Salvar Configuração
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">

                                {/* 1. Configurações Básicas */}
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-indigo-400" /> Detalhes da Fila
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Nome da Fila</label>
                                            <input
                                                type="text"
                                                value={sQueue.name}
                                                onChange={e => updateCurrent({ name: e.target.value })}
                                                className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition"
                                                placeholder="Ex: Triage Nacional"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Região/Estado</label>
                                                <input
                                                    type="text"
                                                    value={sQueue.region}
                                                    onChange={e => updateCurrent({ region: e.target.value })}
                                                    className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition"
                                                    placeholder="Ex: Sudeste"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Máx Chats/Agente</label>
                                                <input
                                                    type="number" min="1" max="10"
                                                    value={sQueue.max_concurrent}
                                                    onChange={e => updateCurrent({ max_concurrent: parseInt(e.target.value) || 1 })}
                                                    className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Descrição Opcional</label>
                                            <textarea
                                                value={sQueue.description}
                                                onChange={e => updateCurrent({ description: e.target.value })}
                                                className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition custom-scrollbar resize-none"
                                                rows={3}
                                                placeholder="Propósito desta fila na operação..."
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 flex items-center gap-1"><Palette className="w-3 h-3" /> Cor do Crachá</label>
                                            <div className="flex items-center gap-2 p-3 bg-[#111b21] border border-white/10 rounded-xl">
                                                {bgColors.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => updateCurrent({ color: c })}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full border-2 transition-transform",
                                                            sQueue.color === c ? "border-white scale-110 shadow-lg shadow-white/20" : "border-transparent hover:scale-105"
                                                        )}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                            <div>
                                                <p className="text-sm font-bold text-white">Fila Ativada</p>
                                                <p className="text-[10px] text-slate-400">Pausar envios de leads para esta fila.</p>
                                            </div>
                                            <button
                                                onClick={() => updateCurrent({ is_active: !sQueue.is_active })}
                                                className={cn(
                                                    "w-12 h-6 rounded-full relative transition-colors",
                                                    sQueue.is_active ? "bg-emerald-500" : "bg-slate-700"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
                                                    sQueue.is_active ? "right-1" : "left-1"
                                                )} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Equipe / Agentes */}
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-emerald-400" /> Designação de Equipe
                                    </h3>

                                    <div className="bg-[#111b21] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[500px]">
                                        <div className="p-4 border-b border-white/5 bg-[#1f2c34] flex items-center justify-between">
                                            <p className="text-xs font-bold text-white">{sQueue.agentIds.length} selecionados</p>
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] uppercase hover:bg-emerald-500/20">Distribuir Iguais</Badge>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                                            {MOCK_USERS.map(user => {
                                                const isSelected = sQueue.agentIds.includes(user.id);
                                                return (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => toggleAgent(user.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                                                            isSelected
                                                                ? "bg-emerald-500/10 border-emerald-500/30 shadow-sm"
                                                                : "bg-white/5 border-white/5 hover:border-white/20"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                                            isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-600 bg-slate-800"
                                                        )}>
                                                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <Avatar className="w-8 h-8 border border-white/10">
                                                            <AvatarFallback className="bg-slate-800 text-[9px] font-black">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{user.name}</p>
                                                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                                                <Briefcase className="w-3 h-3" /> {user.role}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-white/5 mt-auto">
                                        <button
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja DELETAR esta fila? Essa ação é irreversível.')) {
                                                    setQueues(prev => prev.filter(q => q.id !== sQueue.id));
                                                    setSelectedQueueId(queues[0]?.id || null);
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" /> Deletar Fila
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <BarChart3 className="w-16 h-16 opacity-20 mb-4" />
                        <h3 className="text-white font-bold text-lg">Selecione uma fila</h3>
                        <p className="text-sm mt-2 opacity-60">Crie ou edite as regras de distribuição para seus colaboradores.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
