import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Send, Search, Smile, Paperclip, Loader2, MessageSquare,
    History, User, BookOpen, Copy, Zap, ShieldCheck, Stethoscope,
    Star, Package, Target, Clock, Mic, FileText, PenTool, Calendar,
    CreditCard, Phone, Video, MoreVertical, CheckCheck,
    ExternalLink, Wifi, X, ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import type { CRMLead, CRMInteraction } from '@/types/crm';
import { cn } from '@/lib/utils';
import { ActivityTimeline } from './ActivityTimeline';
import { Badge } from '@/components/ui/badge';
import { salesScripts } from '@/data/salesScripts';
import { Progress } from '@/components/ui/progress';

interface ChatPanelProps {
    lead: CRMLead;
}

// ── Types ─────────────────────────────────────────────────────────────────────
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

interface LocalMessage {
    id: string;
    sender_type: 'vendedor' | 'lead' | 'bot';
    message: string;
    created_at: string;
    status?: MessageStatus;
    attachment_type?: 'image' | 'audio' | 'document';
    attachment_url?: string;
    audio_duration?: number;
}

// ── Demo conversation seeds ───────────────────────────────────────────────────
const DEMO_CONVERSATIONS: Record<string, LocalMessage[]> = {
    'demo-1': [
        { id: 'd1-1', sender_type: 'lead', message: 'Boa tarde! Vocês têm fios PDO para técnica Fox Eyes?', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: 'd1-2', sender_type: 'vendedor', message: 'Boa tarde, Dra. Ana! Temos sim 🎯\nTrabalhamos com a linha completa de Fios PDO Espiculados, incluindo os mais indicados para Fox Eyes: 19G e 21G.\nPosso te enviar o catálogo?', created_at: new Date(Date.now() - 3600000 * 1.9).toISOString(), status: 'read' },
        { id: 'd1-3', sender_type: 'lead', message: 'Ótimo! Quanto fica um box de 10 unidades do 19G?', created_at: new Date(Date.now() - 3600000 * 1.8).toISOString() },
        { id: 'd1-4', sender_type: 'bot', message: '📊 *Análise de Intenção de Compra detectada pela IA*\nScore: 🔥 9.2/10 — Lead altamente qualificado', created_at: new Date(Date.now() - 3600000 * 1.75).toISOString() },
        { id: 'd1-5', sender_type: 'vendedor', message: 'O box com 10 unidades do 19G sai por R$ 1.890,00.\nSe fechar 3 boxes hoje, consigo R$ 1.700,00 cada 🤝', created_at: new Date(Date.now() - 3600000 * 1.7).toISOString(), status: 'read' },
        { id: 'd1-6', sender_type: 'lead', message: 'Interessante! Deixa eu verificar com a equipe e já te retorno', created_at: new Date(Date.now() - 3600000 * 0.5).toISOString() },
    ],
    'demo-2': [
        { id: 'd2-1', sender_type: 'lead', message: 'Olá! Vi o perfil de vocês no Instagram. Trabalham com sutura Silhouette?', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
        { id: 'd2-2', sender_type: 'vendedor', message: 'Olá Dr. Carlos! Sim, temos a linha Silhouette completa ✅\nSou o especialista em produtos para cirurgia plástica aqui da Ecomed.\nPoderia me enviar seu CRM para validarmos o cadastro?', created_at: new Date(Date.now() - 3600000 * 4.9).toISOString(), status: 'delivered' },
    ],
    'demo-3': [
        { id: 'd3-1', sender_type: 'lead', message: 'Bom dia! A proposta que vocês enviaram está aprovada 🎉', created_at: new Date(Date.now() - 3600000 * 1).toISOString() },
        { id: 'd3-2', sender_type: 'vendedor', message: 'Que ótimo, Dra. Mariana!! 🚀\nVou gerar o link de pagamento agora mesmo. São 20 boxes do lote LOT-FIO-2024, correto?', created_at: new Date(Date.now() - 3600000 * 0.9).toISOString(), status: 'read' },
        { id: 'd3-3', sender_type: 'lead', message: 'Isso mesmo. Prefiro boleto ou PIX se possível', created_at: new Date(Date.now() - 3600000 * 0.8).toISOString() },
        { id: 'd3-4', sender_type: 'vendedor', message: 'Fechado! PIX com 5% de desconto = R$ 28.500,00\nConta-me se precisar de NF-e fracionada 📄', created_at: new Date(Date.now() - 3600000 * 0.75).toISOString(), status: 'read' },
        { id: 'd3-5', sender_type: 'lead', message: 'Precisa sim, duas NFs por favor. Pode gerar?', created_at: new Date(Date.now() - 1200000).toISOString() },
    ],
    'demo-101': [
        { id: 'd101-1', sender_type: 'bot', message: 'Olá, Dra. Ana Beatriz! Verifiquei sua clínica de Dermatologia em SP e percebi que trabalham com estética avançada de ALTO PADRÃO. Gostaria de receber nosso portfólio de equipamentos e fios para procedimentos 2026? 🚀', created_at: new Date(Date.now() - 3600000 * 0.8).toISOString() },
        { id: 'd101-2', sender_type: 'lead', message: 'Olá, boa tarde! Acabei de ver. Tenho interesse sim, estão locando Ultraformer MPT?', created_at: new Date(Date.now() - 3600000 * 0.7).toISOString() },
        { id: 'd101-audio-rx', sender_type: 'lead', message: '', created_at: new Date(Date.now() - 3600000 * 0.65).toISOString(), attachment_type: 'audio', audio_duration: 12 },
        { id: 'd101-3', sender_type: 'bot', message: 'Olá, Dra Ana Beatriz! Sou a assistente virtual de triagem da MedBeauty. Sim, trabalhamos com o Ultraformer MPT e nossa frota é novíssima. Para quando você precisaria da máquina?', created_at: new Date(Date.now() - 3600000 * 0.6).toISOString() },
        { id: 'd101-img', sender_type: 'bot', message: 'Temos unidades a pronta-entrega para agendamento! 👇', created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(), attachment_type: 'image', attachment_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400' },
        { id: 'd101-4', sender_type: 'lead', message: 'Mês que vem, 15 de abril.', created_at: new Date(Date.now() - 3600000 * 0.3).toISOString() },
        { id: 'd101-5', sender_type: 'bot', message: 'Perfeito! Como se trata do Ultraformer e envolve reserva de agenda, vou transferir seu atendimento agorinha mesmo para nossa equipe de Especialistas, que fecharão a proposta de valor. Aguarde um instante! ⏳', created_at: new Date(Date.now() - 3600000 * 0.1).toISOString() },
        { id: 'd101-system-1', sender_type: 'bot', message: '🔄 TRANSFERÊNCIA DE ATENDIMENTO >> FILA HUMANIZADA (FIOS PDO - SP)', created_at: new Date(Date.now() - 60000).toISOString() },
    ],
};

// ── AI auto-replies ───────────────────────────────────────────────────────────
const AI_REPLIES = [
    'Entendi! Deixa eu verificar a disponibilidade do estoque e já te confirmo 📦',
    'Ótima pergunta! Nosso lote atual tem certificação ANVISA vigente. Posso enviar o documento?',
    'Claro! Estou preparando uma proposta personalizada para o seu perfil. 2 minutinhos ⏳',
    'Perfeito! Vou acionar nossa equipe de logística para confirmar o prazo de entrega para sua região 🚚',
    'Anotado ✅ Vou incluir isso na proposta. Mais alguma preferência?',
];

// ── WhatsApp SVG Icon ─────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ name }: { name: string }) {
    return (
        <div className="flex items-end gap-2 justify-start">
            <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarFallback className="bg-slate-700 text-white text-[9px] font-black">{name[0]}</AvatarFallback>
            </Avatar>
            <div className="bg-[#202c33] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1 shadow-md">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    );
}

// ── Message status icon ───────────────────────────────────────────────────────
function MsgStatus({ status }: { status?: MessageStatus }) {
    if (!status || status === 'sending') return <Loader2 className="w-3 h-3 animate-spin opacity-50" />;
    if (status === 'sent') return <CheckCheck className="w-3.5 h-3.5 opacity-50" />;
    if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-slate-300 opacity-80" />;
    return <CheckCheck className="w-3.5 h-3.5 text-sky-400" />;
}

// ── Format time ───────────────────────────────────────────────────────────────
function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateGroup(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'HOJE';
    if (d.toDateString() === yesterday.toDateString()) return 'ONTEM';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

// ── WA background pattern ─────────────────────────────────────────────────────
const WA_BG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

// ── Main component ────────────────────────────────────────────────────────────
export function ChatPanel({ lead }: ChatPanelProps) {
    const isDemo = lead.id.startsWith('demo-');

    const [localMessages, setLocalMessages] = useState<LocalMessage[]>(
        isDemo ? (DEMO_CONVERSATIONS[lead.id] || []) : []
    );
    const [supaMessages, setSupaMessages] = useState<CRMInteraction[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(!isDemo);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isGeneratingCheckout, setIsGeneratingCheckout] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'activities' | 'details' | 'scripts'>('chat');
    const [searchScript, setSearchScript] = useState('');
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Recording States
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef<any>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Combined messages view
    const messages: LocalMessage[] = isDemo
        ? localMessages
        : supaMessages.map(m => ({ ...m, id: m.id, status: 'read' as MessageStatus }));

    // ── Fetch Supabase messages (non-demo) ──────────────────────────────────
    useEffect(() => {
        if (isDemo) return;
        const fetch = async () => {
            const { data } = await supabase
                .from('crm_interactions').select('*')
                .eq('lead_id', lead.id).order('created_at', { ascending: true });
            if (data) setSupaMessages(data);
            setLoading(false);
        };
        fetch();
        const sub = supabase.channel(`chat_${lead.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'crm_interactions', filter: `lead_id=eq.${lead.id}` },
                (p) => setSupaMessages(prev => [...prev, p.new as CRMInteraction]))
            .subscribe();
        return () => { sub.unsubscribe(); };
    }, [lead.id, isDemo]);

    // ── Auto-scroll ─────────────────────────────────────────────────────────
    const scrollToBottom = useCallback((smooth = true) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
        setUnreadCount(0);
        setShowScrollBtn(false);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        if (atBottom) {
            scrollToBottom();
        } else {
            setUnreadCount(n => n + 1);
            setShowScrollBtn(true);
        }
    }, [messages.length]);

    useEffect(() => {
        if (activeTab === 'chat') setTimeout(() => scrollToBottom(false), 50);
    }, [activeTab]);

    // ── Handle scroll visibility ─────────────────────────────────────────────
    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        if (atBottom) { setShowScrollBtn(false); setUnreadCount(0); }
        else setShowScrollBtn(true);
    };

    // ── Keyboard shortcut ────────────────────────────────────────────────────
    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) return;
            if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
            const map: Record<string, typeof activeTab> = { c: 'chat', a: 'activities', p: 'details', s: 'scripts' };
            if (map[e.key]) setActiveTab(map[e.key]);
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, []);

    // ── AI auto-reply simulation ──────────────────────────────────────────────
    const simulateAIReply = useCallback((delay = 2500) => {
        setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                const reply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
                const botMsg: LocalMessage = {
                    id: `bot-${Date.now()}`,
                    sender_type: 'bot',
                    message: reply,
                    created_at: new Date().toISOString(),
                };
                setLocalMessages(prev => [...prev, botMsg]);
            }, 1800);
        }, delay);
    }, []);

    // ── Send message ─────────────────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        if (!inputValue.trim()) return;
        const text = inputValue.trim();
        setInputValue('');
        inputRef.current?.focus();

        if (isDemo) {
            const tempId = `temp-${Date.now()}`;
            const msg: LocalMessage = {
                id: tempId,
                sender_type: 'vendedor',
                message: text,
                created_at: new Date().toISOString(),
                status: 'sending',
            };
            setLocalMessages(prev => [...prev, msg]);
            // Sending → sent → delivered → read animation
            setTimeout(() => setLocalMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m)), 500);
            setTimeout(() => setLocalMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'delivered' } : m)), 1200);
            setTimeout(() => setLocalMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'read' } : m)), 2000);
            simulateAIReply(2200);
        } else {
            const { data } = await supabase.from('crm_interactions')
                .insert([{ lead_id: lead.id, sender_type: 'vendedor', message: text }])
                .select().single();
            if (data) {
                try {
                    await supabase.functions.invoke('analyze-lead', { body: { lead_id: lead.id, messages: [...supaMessages, data] } });
                } catch (_) { /* ignore */ }
            }
        }
    }, [inputValue, isDemo, lead.id, simulateAIReply, supaMessages]);

    // ── Simulate lead message ─────────────────────────────────────────────────
    const simulateLeadMsg = useCallback((text: string) => {
        if (isDemo) {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                const msg: LocalMessage = {
                    id: `lead-${Date.now()}`,
                    sender_type: 'lead',
                    message: text,
                    created_at: new Date().toISOString(),
                };
                setLocalMessages(prev => [...prev, msg]);
                simulateAIReply(1500);
            }, 1500);
        } else {
            supabase.from('crm_interactions').insert([{ lead_id: lead.id, sender_type: 'lead', message: text }]);
        }
    }, [isDemo, lead.id, simulateAIReply]);

    // ── Open WhatsApp ─────────────────────────────────────────────────────────
    const openWhatsApp = () => {
        const phone = lead.phone?.replace(/\D/g, '');
        if (!phone) return alert('Número não disponível.');
        window.open(`https://wa.me/55${phone}`, '_blank');
    };

    // ── Checkout ──────────────────────────────────────────────────────────────
    const handleGenerateCheckout = async () => {
        setIsGeneratingCheckout(true);
        try {
            const items = [{ name: 'Fios PDO - Técnica Fox Eyes', lot_number: 'LOT-FIO-2024', price_cents: 250000, quantity: 1 }];
            const { data, error } = await supabase.functions.invoke('stripe-checkout', { body: { lead_id: lead.id, items } });
            if (error) throw error;
            if (data?.url) {
                setInputValue(`🔗 Link de pagamento seguro:\n${data.url}`);
                inputRef.current?.focus();
            }
        } catch {
            if (isDemo) {
                setInputValue('🔗 Link de pagamento: https://checkout.stripe.com/demo/pay_xxxxx\nFios PDO Fox Eyes × 1 — R$ 2.500,00');
                inputRef.current?.focus();
            } else {
                alert('Erro ao gerar checkout Stripe.');
            }
        } finally {
            setIsGeneratingCheckout(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full overflow-hidden shadow-2xl rounded-3xl border border-white/5">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="bg-[#1f2c34] flex items-center justify-between px-4 py-2.5 gap-3 flex-shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                        <Avatar className="w-10 h-10 border-2 border-white/10">
                            <AvatarFallback className="bg-emerald-800 text-white font-black text-sm">
                                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#1f2c34] rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-white font-bold text-sm truncate">{lead.name}</p>
                            {lead.ai_score_hot && (
                                <span className="text-[9px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse flex-shrink-0">🔥 Hot</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                            {isTyping ? (
                                <span className="text-emerald-400 font-bold animate-pulse">digitando...</span>
                            ) : (
                                <>
                                    <Wifi className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">WhatsApp conectado</span>
                                    <span className="text-slate-600">·</span>
                                    <span className="text-slate-400 font-mono">{lead.phone}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={openWhatsApp}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366] hover:bg-[#20ba58] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                        <WhatsAppIcon size={12} /> Abrir WA <ExternalLink className="w-3 h-3" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                        <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                        <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Tabs ────────────────────────────────────────────────────── */}
            <div className="flex items-center bg-[#111b21] border-b border-white/5 px-2 gap-1 flex-shrink-0">
                {([
                    { id: 'chat', label: 'Chat', icon: MessageSquare },
                    { id: 'scripts', label: 'Scripts', icon: BookOpen },
                    { id: 'activities', label: 'Atividades', icon: History },
                    { id: 'details', label: 'Perfil', icon: User },
                ] as const).map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 -mb-px",
                            activeTab === tab.id
                                ? tab.id === 'scripts'
                                    ? "border-amber-500 text-amber-400"
                                    : "border-emerald-500 text-emerald-400"
                                : "border-transparent text-slate-600 hover:text-slate-300"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                ))}
                {isDemo && (
                    <div className="ml-auto flex items-center gap-1.5 pr-3">
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-black uppercase">⚡ Demo</span>
                    </div>
                )}
            </div>

            {/* ── Content ─────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden">

                {/* CHAT TAB */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar"
                            style={{ background: '#0b141a', backgroundImage: WA_BG }}
                        >
                            {loading ? (
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <WhatsAppIcon size={40} className="text-emerald-400" />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">Nenhuma mensagem ainda</p>
                                    <p className="text-slate-600 text-xs text-center max-w-xs">Use os botões abaixo para simular uma mensagem do lead ou inicie uma conversa</p>
                                </div>
                            ) : (() => {
                                // Group messages by date
                                const groups: { date: string; msgs: LocalMessage[] }[] = [];
                                messages.forEach(msg => {
                                    const d = formatDateGroup(msg.created_at);
                                    if (!groups.length || groups[groups.length - 1].date !== d) {
                                        groups.push({ date: d, msgs: [msg] });
                                    } else {
                                        groups[groups.length - 1].msgs.push(msg);
                                    }
                                });
                                return groups.map(group => (
                                    <div key={group.date}>
                                        {/* Date separator */}
                                        <div className="flex justify-center my-4">
                                            <span className="bg-[#182229] text-slate-400 text-[10px] font-medium px-3 py-1 rounded-full shadow">
                                                {group.date}
                                            </span>
                                        </div>
                                        {group.msgs.map((msg, i) => {
                                            const isSeller = msg.sender_type === 'vendedor';
                                            const isBot = msg.sender_type === 'bot';
                                            const prevType = i > 0 ? group.msgs[i - 1].sender_type : null;
                                            const showAvatar = !isSeller && prevType !== msg.sender_type;
                                            const isLastInGroup = i === group.msgs.length - 1 || group.msgs[i + 1].sender_type !== msg.sender_type;

                                            return (
                                                <div key={msg.id}
                                                    className={cn("flex w-full mb-0.5", isSeller ? "justify-end" : "justify-start")}
                                                >
                                                    {!isSeller && (
                                                        <div className="w-8 mr-1.5 flex-shrink-0 flex items-end mb-1">
                                                            {showAvatar && (
                                                                <Avatar className="w-7 h-7">
                                                                    <AvatarFallback className={cn("text-white text-[9px] font-black", isBot ? "bg-indigo-700" : "bg-slate-700")}>
                                                                        {isBot ? 'IA' : lead.name[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="max-w-[68%]">
                                                        {isBot && showAvatar && (
                                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1 mb-0.5">
                                                                IA Assistente
                                                            </p>
                                                        )}
                                                        <div className={cn(
                                                            "relative shadow-md max-w-full overflow-hidden",
                                                            (msg.attachment_type === 'image' && !msg.message) ? "bg-transparent shadow-none" : "px-3 py-2",
                                                            isSeller && (msg.attachment_type === 'image' && !msg.message ? "p-0" : "bg-[#005C4B] text-white rounded-2xl rounded-tr-none"),
                                                            isBot && "bg-[#1f2c34]/80 border border-white/5 text-slate-200 rounded-2xl rounded-tl-none",
                                                            !isSeller && !isBot && (msg.attachment_type === 'image' && !msg.message ? "p-0" : "bg-[#202c33] text-slate-100 rounded-2xl rounded-tl-none"),
                                                            !isLastInGroup && (isSeller ? "rounded-tr-2xl" : "rounded-tl-2xl")
                                                        )}>

                                                            {msg.attachment_type === 'image' && (
                                                                <img src={msg.attachment_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400'} alt="Anexo Visual" className="rounded-xl w-60 h-auto object-cover mb-1 bg-[#111b21] border border-white/10" />
                                                            )}

                                                            {msg.attachment_type === 'audio' && (
                                                                <div className="flex items-center gap-3 w-56 h-8">
                                                                    <button className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 hover:bg-emerald-500/30 transition">
                                                                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-current border-b-[5px] border-b-transparent ml-1" />
                                                                    </button>
                                                                    <div className="flex-1 flex items-center gap-0.5 opacity-60 overflow-hidden h-6 mask-image-[linear-gradient(to_right,white,white_80%,transparent)]">
                                                                        {[...Array(20)].map((_, wav_i) => (
                                                                            <div key={wav_i} className={cn("w-1 bg-slate-400 rounded-full", isSeller ? "bg-white/70" : "")} style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-[10px] font-bold tracking-tighter opacity-70 shrink-0">0:{String(msg.audio_duration || 12).padStart(2, '0')}</span>
                                                                </div>
                                                            )}

                                                            {msg.message && (
                                                                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                            )}

                                                            <div className={cn("flex items-center gap-1 mt-1", isSeller ? "justify-end" : "justify-start")}>
                                                                <span className="text-[9.5px] opacity-45">{formatTime(msg.created_at)}</span>
                                                                {isSeller && <MsgStatus status={msg.status} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ));
                            })()}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="mt-2">
                                    <TypingIndicator name={lead.name} />
                                </div>
                            )}
                        </div>

                        {/* Scroll-to-bottom button */}
                        {showScrollBtn && (
                            <div className="absolute bottom-36 right-8 z-20">
                                <button
                                    onClick={() => scrollToBottom()}
                                    className="w-10 h-10 bg-[#202c33] hover:bg-[#2a3942] border border-white/10 rounded-full flex items-center justify-center shadow-lg transition-all"
                                >
                                    <ChevronDown className="w-5 h-5 text-slate-300" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Quick-action chips */}
                        <div className="flex gap-2 overflow-x-auto px-3 pt-2 pb-0 no-scrollbar bg-[#0b141a] border-t border-white/5 flex-shrink-0">
                            <button onClick={() => simulateLeadMsg("Qual o valor desse fio espiculado? Quero comprar 10 boxes.")}
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 whitespace-nowrap transition-all font-bold flex-shrink-0">
                                🔥 Intenção de Compra
                            </button>
                            <button onClick={() => simulateLeadMsg("Quero saber sobre o registro ANVISA do lote.")}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-slate-400 whitespace-nowrap transition-all flex-shrink-0">
                                📦 Dúvida ANVISA
                            </button>
                            <button onClick={() => alert('Gerando Orçamento PDF premium...')}
                                className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full text-[10px] text-indigo-400 whitespace-nowrap font-bold items-center gap-1.5 flex flex-shrink-0">
                                <FileText className="w-3 h-3" /> Proposta PDF
                            </button>
                            <button onClick={() => alert(`${lead.name} convidado para assinatura digital.`)}
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 whitespace-nowrap font-bold flex items-center gap-1.5 flex-shrink-0">
                                <PenTool className="w-3 h-3" /> Assinatura
                            </button>
                            <button onClick={() => alert(`Follow-up agendado para ${lead.name} em 3 dias.`)}
                                className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-full text-[10px] text-orange-400 whitespace-nowrap font-bold flex items-center gap-1.5 flex-shrink-0">
                                <Calendar className="w-3 h-3" /> Follow-up
                            </button>
                            <button onClick={handleGenerateCheckout} disabled={isGeneratingCheckout}
                                className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-full text-[10px] text-green-400 whitespace-nowrap font-bold flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50">
                                {isGeneratingCheckout ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                                Link Pagamento
                            </button>
                        </div>

                        {/* Input area */}
                        <div className="flex items-end gap-2 px-3 py-2.5 bg-[#202c33] flex-shrink-0">
                            {isRecording ? (
                                <div className="flex-1 bg-[#2a3942] rounded-full h-[46px] px-5 flex items-center justify-between border border-emerald-500/20 shadow-inner">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                                        <span className="text-emerald-400 font-mono font-bold text-[14px] tracking-widest">
                                            0:{String(recordingTime).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            clearInterval(recordingTimerRef.current);
                                            setIsRecording(false);
                                            setRecordingTime(0);
                                        }}
                                        className="text-slate-400 hover:text-red-400 transition-colors uppercase font-black text-[10px] tracking-widest px-2"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                            <Smile className="w-5 h-5" />
                                        </button>
                                        <button
                                            title="Anexar Imagem"
                                            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                            onClick={() => {
                                                const fileInput = document.createElement('input');
                                                fileInput.type = 'file';
                                                fileInput.accept = 'image/*';
                                                fileInput.onchange = (e: any) => {
                                                    if (e.target.files?.[0]) {
                                                        const url = URL.createObjectURL(e.target.files[0]);
                                                        const newMsg: LocalMessage = {
                                                            id: `temp-${Date.now()}`,
                                                            sender_type: 'vendedor',
                                                            message: '',
                                                            created_at: new Date().toISOString(),
                                                            status: 'sent',
                                                            attachment_type: 'image',
                                                            attachment_url: url
                                                        };
                                                        setLocalMessages(prev => [...prev, newMsg]);
                                                        setTimeout(() => {
                                                            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                                                        }, 100);
                                                    }
                                                };
                                                fileInput.click();
                                            }}
                                        >
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 bg-[#2a3942] rounded-3xl px-4 py-2 flex items-end gap-2 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all border border-transparent focus-within:border-emerald-500/10">
                                        <textarea
                                            ref={inputRef}
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 py-[3px] text-[14px] resize-none custom-scrollbar min-h-[22px] max-h-[100px] leading-relaxed"
                                            placeholder="Digite uma mensagem..."
                                            rows={1}
                                            value={inputValue}
                                            onChange={e => {
                                                setInputValue(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                                            }}
                                        />
                                        {inputValue && (
                                            <button onClick={() => setInputValue('')} className="p-1 mb-0.5 text-slate-500 hover:text-slate-300 flex-shrink-0">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {!inputValue ? (
                                <button
                                    onClick={() => {
                                        if (isRecording) {
                                            clearInterval(recordingTimerRef.current);
                                            const newMsg: LocalMessage = {
                                                id: `temp-${Date.now()}`,
                                                sender_type: 'vendedor',
                                                message: '',
                                                created_at: new Date().toISOString(),
                                                status: 'sent',
                                                attachment_type: 'audio',
                                                audio_duration: recordingTime
                                            };
                                            setLocalMessages(prev => [...prev, newMsg]);
                                            setIsRecording(false);
                                            setRecordingTime(0);
                                            setTimeout(() => {
                                                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                                            }, 100);
                                        } else {
                                            setIsRecording(true);
                                            setRecordingTime(0);
                                            recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
                                        }
                                    }}
                                    className={cn(
                                        "w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-lg active:scale-90",
                                        isRecording
                                            ? "bg-emerald-500 text-white animate-pulse shadow-emerald-500/40"
                                            : "bg-[#25d366] hover:bg-[#20ba58]"
                                    )}
                                >
                                    {isRecording ? <Send className="w-5 h-5 ml-1 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                                </button>
                            ) : (
                                <button
                                    onClick={handleSend}
                                    className="w-11 h-11 bg-[#25d366] hover:bg-[#20ba58] text-white rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-emerald-500/20 flex-shrink-0"
                                >
                                    <Send className="w-5 h-5 ml-1 text-white" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* SCRIPTS TAB */}
                {activeTab === 'scripts' && (
                    <div className="flex flex-col h-full bg-[#111b21] p-5 space-y-4 overflow-y-auto custom-scrollbar">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" placeholder="Buscar script por canal ou palavra-chave..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none"
                                value={searchScript} onChange={e => setSearchScript(e.target.value)} />
                        </div>
                        <div className="space-y-3">
                            {salesScripts
                                .filter(s => s.title.toLowerCase().includes(searchScript.toLowerCase()) || s.content.toLowerCase().includes(searchScript.toLowerCase()))
                                .map(script => (
                                    <div key={script.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 hover:border-emerald-500/30 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-500" />
                                                <h4 className="text-sm font-bold text-white">{script.title}</h4>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] uppercase border-emerald-500/20 text-emerald-400">{script.channel}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 italic">"{script.content}"</p>
                                        <button
                                            onClick={() => {
                                                setInputValue(script.content.replace('[NOME]', lead.name.split(' ')[0]));
                                                setActiveTab('chat');
                                                setTimeout(() => inputRef.current?.focus(), 100);
                                            }}
                                            className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                            <Copy className="w-3 h-3" /> Usar no Chat
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* ACTIVITIES TAB */}
                {activeTab === 'activities' && <ActivityTimeline lead={lead} />}

                {/* DETAILS TAB */}
                {activeTab === 'details' && (
                    <div className="p-6 space-y-6 h-full overflow-y-auto custom-scrollbar bg-[#111b21]">
                        {/* Basic info */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Stethoscope, label: 'Especialidade', value: lead.specialty || 'Não informado' },
                                { icon: ShieldCheck, label: 'CRM/CRBM', value: lead.crm_license || 'Pendente' },
                            ].map(item => (
                                <div key={item.label} className="p-4 bg-[#1f2c34] rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                                    <div className="flex items-center gap-2 mb-1">
                                        <item.icon className="w-3.5 h-3.5 text-emerald-400" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                                    </div>
                                    <p className="text-white font-bold text-base">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* AI Score */}
                        <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-emerald-500" />
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Score de Intenção (IA)</h4>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <Clock className="w-3 h-3" /> Atualizado há 2 min
                                </div>
                            </div>
                            <Badge className={cn("px-4 py-1 font-black text-[10px] uppercase rounded-full", lead.ai_score_hot ? "bg-orange-500 text-white border-none shadow-lg shadow-orange-500/20" : "bg-slate-800 text-slate-400")}>
                                {lead.ai_score_hot ? '🔥 Lead Quente — Alta Intenção' : '❄️ Lead Frio'}
                            </Badge>
                            <p className="text-slate-300 text-sm leading-relaxed italic">
                                "{lead.ai_analysis_summary || 'Nenhuma interação registrada ainda.'}"
                            </p>
                        </div>

                        {/* Stock intel */}
                        <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Package className="w-4 h-4 text-amber-500" />
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Inteligência de Estoque</h4>
                                </div>
                                <Badge className="bg-amber-500/20 text-amber-500 border-none text-[9px]">Previsão IA</Badge>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                    <span>Fios PDO — Técnica Fox Eyes</span>
                                    <span className="text-amber-500">Esgota em ~12 dias</span>
                                </div>
                                <Progress value={85} className="h-1.5 bg-white/5" indicatorClassName="bg-amber-500" />
                            </div>
                        </div>

                        {/* Order history */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">Histórico & NPS</h4>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] px-3 py-1">Stripe Sync</Badge>
                            </div>
                            <div className="p-4 bg-[#1f2c34] rounded-2xl border border-white/5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                            <Star className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">NPS Médio</p>
                                            <p className="text-xl font-black text-white">4.9<span className="text-slate-600 text-sm">/5.0</span></p>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-green-400 font-black uppercase">Promotor</p>
                                </div>
                                {[
                                    { id: '#ORD-2024-001', prod: '10x Fios PDO Fox Eyes', val: 'R$ 2.500,00', ok: true },
                                    { id: '#ORD-2024-002', prod: '5x Sutura Silhouette', val: 'R$ 1.800,00', ok: false },
                                ].map(o => (
                                    <div key={o.id} className={cn("flex justify-between p-3 bg-white/5 rounded-xl text-[11px]", !o.ok && "opacity-50")}>
                                        <div>
                                            <p className="font-bold text-white">{o.id}</p>
                                            <p className="text-slate-400">{o.prod}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("font-bold", o.ok ? "text-emerald-400" : "text-slate-400")}>{o.val}</p>
                                            <Badge className={cn("border-none text-[8px]", o.ok ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400")}>
                                                {o.ok ? 'Pago' : 'Cancelado'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Open WA button */}
                        <button onClick={openWhatsApp}
                            className="w-full h-12 bg-[#25d366] hover:bg-[#20ba58] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                            <WhatsAppIcon size={18} /> Abrir no WhatsApp <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
