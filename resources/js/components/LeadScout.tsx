import { useState } from 'react';
import {
    Search,
    Globe,
    Instagram,
    Linkedin,
    Plus,
    MapPin,
    Star,
    ExternalLink,
    Loader2,
    Filter,
    UserPlus,
    Users as UsersIcon,
    History,
    Bot, CheckCircle2, MessageSquare, Terminal, FastForward
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Prospect {
    id: string;
    name: string;
    specialty: string;
    location: string;
    source: 'google' | 'instagram' | 'linkedin';
    rating?: number;
    followers?: string;
    phone?: string;
    link: string;
}

export function LeadScout({ user }: { user: any }) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [activeSource, setActiveSource] = useState<'all' | 'google' | 'instagram' | 'linkedin'>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [importingId, setImportingId] = useState<string | null>(null);
    const [searchHistory, setSearchHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem('lead_scout_history');
        return saved ? JSON.parse(saved) : ['Dermatologistas SP', 'Clínicas RJ', 'Harmonização Facial'];
    });

    const [aiScoutMode, setAiScoutMode] = useState(false);
    const [aiTerminalLogs, setAiTerminalLogs] = useState<{ msg: string, role: string }[]>([]);

    const startAiScouting = () => {
        const searchQuery = query || searchHistory[0];
        setAiScoutMode(true);
        setIsSearching(false);
        setAiTerminalLogs([
            { msg: `[INICIANDO] Varredura automatizada G.I. Joe para Oportunidades: "${searchQuery}"`, role: 'system' }
        ]);

        const steps = [
            { t: 1500, m: '🔍 Analisando perfis no Instagram e Google Maps da região...', r: 'system' },
            { t: 2000, m: '🎯 1 Oportunidade Alta: Dra. Ana Beatriz Souza (Dermatologia, SP)', r: 'important' },
            { t: 1500, m: '📱 Disparando template dinâmico "Icebreaker Dermatologia" via WhatsApp Oficial...', r: 'action' },
            { t: 2500, m: '✅ Mensagem Entregue e Lida. Aguardando interação...', r: 'system' },
            { t: 3000, m: 'Dra. Ana: "Olá, boa tarde! Acabei de ver. Tenho interesse sim, estão locando Ultraformer MPT?"', r: 'lead' },
            { t: 2500, m: 'Assistente IA: "Olá, Dra Ana Beatriz! Sou a assistente de triagem da MedBeauty. Sim, trabalhamos com o Ultraformer MPT e nossa frota é novíssima. Para quando você precisaria da máquina?"', r: 'bot' },
            { t: 4000, m: 'Dra. Ana: "Mês que vem, 15 de abril."', r: 'lead' },
            { t: 2500, m: 'Assistente IA: "Perfeito! Como se trata do Ultraformer e envolve reserva de agenda, vou transferir seu atendimento agorinha mesmo para a Camila Rocha e sua equipe de Especialistas, que fecharão a proposta de valor."', r: 'bot' },
            { t: 2000, m: '🔄 Redirecionamento de Payload... Inserindo Lead Dra. Ana Beatriz na Fila de Especialistas.', r: 'action' },
            { t: 2000, m: '🌟 ATENDIMENTO AUTOMÁTICO ENCERRADO E PASSADO PARA INTERVENÇÃO HUMANA.', r: 'important' }
        ];

        let accumulatedTime = 0;
        steps.forEach(step => {
            accumulatedTime += step.t;
            setTimeout(() => {
                setAiTerminalLogs(prev => [...prev, { msg: step.m, role: step.r }]);
            }, accumulatedTime);
        });
    };

    const handleSearch = async (overrideQuery?: string) => {
        const searchQuery = overrideQuery || query;
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setProspects([]);
        setSelectedIds([]);

        // Save to history
        if (!searchHistory.includes(searchQuery)) {
            const newHistory = [searchQuery, ...searchHistory].slice(0, 5);
            setSearchHistory(newHistory);
            localStorage.setItem('lead_scout_history', JSON.stringify(newHistory));
        }

        // Simulate API delay
        await new Promise(r => setTimeout(r, 1500));

        const mockProspects: Prospect[] = [
            {
                id: '1',
                name: 'Dra. Ana Beatrix',
                specialty: 'Dermatologia Estética',
                location: 'São Paulo, SP',
                source: 'instagram',
                followers: '45k',
                link: 'https://instagram.com/dra.anabeatrix'
            },
            {
                id: '2',
                name: 'Clínica Renovari',
                specialty: 'Medicina Regenerativa',
                location: 'Rio de Janeiro, RJ',
                source: 'google',
                rating: 4.9,
                phone: '+55 21 98877-6655',
                link: 'https://google.com/maps/renovari'
            },
            {
                id: '3',
                name: 'Dr. Marcos Tulio',
                specialty: 'Cirurgia Plástica',
                location: 'Belo Horizonte, MG',
                source: 'linkedin',
                link: 'https://linkedin.com/in/drmarcostulio'
            }
        ];

        setProspects(mockProspects);
        setIsSearching(false);
    };

    const importToCRM = async (prospect: Prospect | Prospect[]) => {
        const batch = Array.isArray(prospect) ? prospect : [prospect];
        setImportingId(batch.length === 1 ? batch[0].id : 'batch');

        try {
            const inserts = batch.map(p => ({
                name: p.name,
                phone: p.phone || 'Pendente',
                segment: p.source === 'google' ? 'clinica' : 'medico',
                specialty: p.specialty,
                status: 'novo',
                assigned_to: user?.id,
                ai_analysis_summary: `Prospect extraído de ${p.source.toUpperCase()}. Locação: ${p.location}.`
            }));

            const { error } = await supabase.from('crm_leads').insert(inserts);

            if (error) throw error;

            const idsToRemove = batch.map(p => p.id);
            setProspects(prev => prev.filter(p => !idsToRemove.includes(p.id)));
            setSelectedIds([]);
            alert(`${batch.length} lead(s) adicionados à sua carteira com sucesso!`);
        } catch (err: any) {
            alert('Erro ao importar lead: ' + err.message);
        } finally {
            setImportingId(null);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="flex flex-col h-full bg-[#020617] p-8 space-y-8 overflow-hidden font-sans">
            {/* Search Header */}
            <div className="space-y-6">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Busca de <span className="text-indigo-500">Oportunidades</span></h2>
                        <p className="text-slate-500 text-sm font-medium italic">Encontre novos médicos e clínicas via Google Maps, Instagram e LinkedIn.</p>
                    </div>
                    {aiScoutMode && (
                        <button
                            onClick={() => { setAiScoutMode(false); setAiTerminalLogs([]); }}
                            className="text-xs px-4 py-2 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 transition-all font-bold uppercase"
                        >
                            Sair do Piloto Automático
                        </button>
                    )}
                    <div className={cn("flex gap-3", aiScoutMode && "hidden")}>
                        <div className="flex bg-slate-900 border border-white/5 rounded-2xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", viewMode === 'grid' ? "bg-indigo-600 text-white" : "text-slate-500")}
                            >
                                <Filter className="w-3 h-3 inline mr-1" /> Grade
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", viewMode === 'map' ? "bg-indigo-600 text-white" : "text-slate-500")}
                            >
                                <MapPin className="w-3 h-3 inline mr-1" /> Mapa
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <Input
                            placeholder="Ex: Dermatologistas em Belo Horizonte, Clínicas de Estética em Moema..."
                            className="h-16 pl-14 bg-white/5 border-white/5 text-white text-lg placeholder:text-slate-700 rounded-3xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-2xl"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={() => handleSearch()}
                        disabled={isSearching || aiScoutMode}
                        className="px-8 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Escanear'}
                    </button>
                    <button
                        onClick={startAiScouting}
                        disabled={aiScoutMode}
                        className="px-8 h-16 bg-gradient-to-r hover:to-indigo-500 hover:from-purple-500 from-indigo-600 to-purple-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                    >
                        <Bot className="w-5 h-5" /> Auto Prospect (IA)
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none items-center">
                    <History className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-2">Buscas Recentes:</span>
                    {searchHistory.map(h => (
                        <button
                            key={h}
                            onClick={() => { setQuery(h); handleSearch(h); }}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[10px] text-slate-400 whitespace-nowrap transition-all"
                        >
                            {h}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-3">
                        {[
                            { id: 'all', label: 'Todos os Canais', icon: Globe },
                            { id: 'google', label: 'Google Maps', icon: MapPin },
                            { id: 'instagram', label: 'Instagram Business', icon: Instagram },
                            { id: 'linkedin', label: 'LinkedIn Professional', icon: Linkedin },
                        ].map(source => (
                            <button
                                key={source.id}
                                onClick={() => setActiveSource(source.id as any)}
                                className={cn(
                                    "flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    activeSource === source.id
                                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                        : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                                )}
                            >
                                <source.icon className="w-3.5 h-3.5" />
                                {source.label}
                            </button>
                        ))}
                    </div>

                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => importToCRM(prospects.filter(p => selectedIds.includes(p.id)))}
                            className="flex items-center gap-3 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg animate-bounce"
                        >
                            <UserPlus className="w-4 h-4" /> Importar {selectedIds.length} Selecionados
                        </button>
                    )}
                </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                {aiScoutMode ? (
                    <div className="h-full bg-[#0B1120] border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
                        <div className="h-12 bg-[#12182B] border-b border-slate-800 flex items-center px-6 justify-between shrink-0 z-10">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">G.I. Joe Terminal /// Piloto Automático IA</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-700" />
                                <span className="w-3 h-3 rounded-full bg-slate-700" />
                                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                            </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-4 flex flex-col z-10 custom-scrollbar">
                            {aiTerminalLogs.map((log, i) => {
                                let colors = "text-slate-400";
                                if (log.role === 'system') colors = "text-slate-500 text-xs";
                                if (log.role === 'action') colors = "text-yellow-400";
                                if (log.role === 'important') colors = "text-emerald-400 font-black tracking-wide";
                                if (log.role === 'bot') colors = "text-indigo-300 bg-indigo-500/10 p-2 rounded-r-xl rounded-bl-xl inline-block border border-indigo-500/20";
                                if (log.role === 'lead') colors = "text-white bg-slate-800 p-2 rounded-l-xl rounded-br-xl self-end inline-block ml-auto border border-white/10";

                                return (
                                    <div key={i} className={cn("animate-in fade-in slide-in-from-bottom-2 w-full flex flex-col", log.role === 'lead' ? "items-end" : "items-start")}>
                                        <div className={cn("max-w-[70%]", colors)}>
                                            {log.msg}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {aiTerminalLogs.length < 10 && (
                            <div className="h-14 shrink-0 flex items-center px-6 gap-3 opacity-50 z-10 bg-black/20">
                                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                <span className="font-mono text-xs text-emerald-500 tracking-widest uppercase">IA Operando prospectos... aguarde</span>
                            </div>
                        )}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
                            <Bot className="w-96 h-96" />
                        </div>
                    </div>
                ) : isSearching ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Consultando Big Data & Redes Sociais...</p>
                    </div>
                ) : prospects.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-slate-600">
                            <Linkedin className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-bold text-white uppercase italic tracking-tighter">Nenhum Prospect Localizado</p>
                            <p className="text-sm text-slate-500 max-w-xs font-medium">Use a barra acima para buscar por região ou especialidade médica.</p>
                        </div>
                    </div>
                ) : viewMode === 'map' ? (
                    <div className="h-full bg-slate-900/60 rounded-[3rem] border border-white/5 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-23.5505,-46.6333&zoom=13&size=1200x800&key=MOCK')] bg-cover grayscale" />
                        <div className="relative text-center space-y-4">
                            <div className="flex gap-6 justify-center">
                                {prospects.map((p, i) => (
                                    <div key={p.id} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl relative animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                                        <MapPin className="w-6 h-6 mx-auto mb-1" />
                                        <p className="text-[10px] font-black uppercase tracking-tighter">{p.name.split(' ')[0]}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Visualização Geográfica de Leads Ativa</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                        {prospects.map((prospect) => (
                            <Card
                                key={prospect.id}
                                onClick={() => toggleSelect(prospect.id)}
                                className={cn(
                                    "bg-white/5 border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all group shadow-2xl backdrop-blur-3xl cursor-pointer relative",
                                    selectedIds.includes(prospect.id) && "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/5"
                                )}
                            >
                                <CardContent className="p-8 space-y-6 relative">
                                    {/* Selection Indicator */}
                                    <div className={cn(
                                        "absolute top-6 left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        selectedIds.includes(prospect.id) ? "bg-indigo-500 border-indigo-500" : "border-white/10"
                                    )}>
                                        {selectedIds.includes(prospect.id) && <Plus className="w-3 h-3 text-white" />}
                                    </div>

                                    {/* Source Badge */}
                                    <div className="absolute top-8 right-8">
                                        {prospect.source === 'instagram' && <Instagram className="w-6 h-6 text-pink-500 opacity-50" />}
                                        {prospect.source === 'google' && <MapPin className="w-6 h-6 text-red-500 opacity-50" />}
                                        {prospect.source === 'linkedin' && <Linkedin className="w-6 h-6 text-blue-500 opacity-50" />}
                                    </div>

                                    <div className="space-y-4 pl-4">
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-black text-white italic tracking-tight">{prospect.name}</h4>
                                            <Badge variant="outline" className="text-[9px] uppercase font-black bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                                {prospect.specialty}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-tighter italic">
                                            <MapPin className="w-3 h-3 text-indigo-500" />
                                            {prospect.location}
                                        </div>

                                        <div className="flex gap-4 pt-2">
                                            {prospect.rating && (
                                                <div className="flex items-center gap-1.5 text-orange-400">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    <span className="text-xs font-black">{prospect.rating}</span>
                                                </div>
                                            )}
                                            {prospect.followers && (
                                                <div className="flex items-center gap-1.5 text-pink-400">
                                                    <UsersIcon className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-black">{prospect.followers} seguidores</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-white/5" onClick={e => e.stopPropagation()}>
                                        <a
                                            href={prospect.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Ver Perfil
                                        </a>
                                        <button
                                            onClick={() => importToCRM(prospect)}
                                            disabled={importingId !== null}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                                        >
                                            {importingId === prospect.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                                                <><Plus className="w-3 h-3" /> Adicionar Lead</>
                                            )}
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
