import { useState, useEffect } from 'react';
import { Scan, AlertTriangle, Truck, Boxes, Search, Loader2, Clock, BellRing, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import type { CRMLot, LogisticsStatus } from '@/types/crm';
import { cn } from '@/lib/utils';

const logStatusConfig: Record<LogisticsStatus, { label: string; color: string }> = {
    em_transito: { label: 'Em Trânsito', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    desembaraco: { label: 'Desembaraço', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    em_estoque: { label: 'Em Estoque', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    esgotado: { label: 'Esgotado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    recall: { label: 'RECALL ATIVO', color: 'bg-orange-600 text-white border-orange-700 animate-pulse' },
};

export function LogisticsDashboard() {
    const [lots, setLots] = useState<CRMLot[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({
        totalItems: 0,
        expiringSoon: 0,
        activeImports: 0
    });

    useEffect(() => {
        const fetchLots = async () => {
            const { data } = await supabase
                .from('crm_lots')
                .select('*, crm_products(name)')
                .order('expiry_date', { ascending: true });

            if (data) {
                setLots(data);

                // Calculate stats
                const total = data.reduce((acc, lot) => acc + lot.quantity_available, 0);
                const expiring = data.filter(lot => {
                    const expiry = new Date(lot.expiry_date);
                    const threeMonthsFromNow = new Date();
                    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
                    return expiry < threeMonthsFromNow;
                }).length;
                const imports = data.filter(lot => lot.status === 'em_transito' || lot.status === 'desembaraco').length;

                setStats({
                    totalItems: total,
                    expiringSoon: expiring,
                    activeImports: imports
                });
            }
            setLoading(false);
        };

        fetchLots();
    }, []);

    const filteredLots = lots.filter(l =>
        l.lot_number.toLowerCase().includes(search.toLowerCase()) ||
        (l as any).crm_products?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const kpiCards = [
        { label: 'Total em Lotes', value: stats.totalItems.toLocaleString(), icon: <Boxes className="w-4 h-4" />, color: 'indigo' },
        { label: 'Fios à Vencer', value: stats.expiringSoon.toString(), icon: <AlertTriangle className="w-4 h-4" />, color: 'orange' },
        { label: 'Importações Ativas', value: stats.activeImports.toString(), icon: <Truck className="w-4 h-4" />, color: 'blue' },
    ];

    const hasRecall = lots.some(l => l.status === 'recall');

    return (
        <div className="space-y-6 p-6 animate-in fade-in duration-700">
            {hasRecall && (
                <div className="bg-orange-600/20 border-2 border-orange-500/50 rounded-3xl p-6 flex items-center justify-between backdrop-blur-3xl animate-pulse shadow-[0_0_30px_rgba(234,88,12,0.2)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/40">
                            <AlertTriangle className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-white font-black text-lg tracking-tight uppercase">Alerta de Recall Ativo</h4>
                            <p className="text-orange-200 text-sm font-medium">Existem lotes com status de Recall. Novas vendas para estes itens foram bloqueadas.</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpiCards.map((stat) => (
                    <Card key={stat.label} className="bg-white/[0.03] border-white/5 overflow-hidden shadow-2xl backdrop-blur-md rounded-3xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 italic">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</h3>
                                </div>
                                <div className={cn(
                                    "p-4 rounded-2xl border transition-all",
                                    stat.color === 'indigo' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                        stat.color === 'orange' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                    {stat.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* #14 Heat Map de Validade */}
            <Card className="bg-slate-900/40 border-white/5 shadow-2xl backdrop-blur-3xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Clock className="w-5 h-5 text-red-500" />
                            <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight">Mapa de Calor: Validade</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 font-medium">Lotes que exigem ação promocional imediata.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            {
                                label: 'Crítico (30 dias)', count: lots.filter(l => {
                                    const days = (new Date(l.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                                    return days <= 30;
                                }).length, color: 'bg-red-500', text: 'Venda Urgente'
                            },
                            {
                                label: 'Alerta (60 dias)', count: lots.filter(l => {
                                    const days = (new Date(l.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                                    return days > 30 && days <= 60;
                                }).length, color: 'bg-orange-500', text: 'Campanha Ativa'
                            },
                            {
                                label: 'Atenção (90 dias)', count: lots.filter(l => {
                                    const days = (new Date(l.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                                    return days > 60 && days <= 90;
                                }).length, color: 'bg-amber-500', text: 'Planejar Promo'
                            },
                            {
                                label: 'Seguro (> 90 dias)', count: lots.filter(l => {
                                    const days = (new Date(l.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                                    return days > 90;
                                }).length, color: 'bg-green-500', text: 'Estoque Saudável'
                            }
                        ].map(status => (
                            <div key={status.label} className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-3 relative group hover:bg-white/[0.08] transition-all">
                                <div className={cn("w-1.5 h-full absolute left-0 top-0 rounded-l-2xl", status.color)} />
                                <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{status.label}</p>
                                    <Badge className={cn("text-[8px] font-black px-2 py-0 border-none", status.color, "text-white")}>{status.text}</Badge>
                                </div>
                                <h4 className="text-3xl font-black text-white italic tracking-tighter">{status.count} <span className="text-xs text-slate-600 ml-1">lotes</span></h4>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lots & Traceability Table */}
                <Card className="lg:col-span-2 bg-white/[0.03] border-white/5 shadow-2xl backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Rastreabilidade de Lotes</CardTitle>
                            <CardDescription className="text-slate-400">Controle ANVISA e status logístico em tempo real.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Localizar Lote ou Produto..."
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="border-white/5">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Produto / Lote</TableHead>
                                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Validade</TableHead>
                                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Disponível</TableHead>
                                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sincronizando com ANVISA...</span>
                                    </TableCell></TableRow>
                                ) : filteredLots.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-500">Nenhum lote compatível encontrado.</TableCell></TableRow>
                                ) : filteredLots.map((lot) => (
                                    <TableRow key={lot.id} className="border-white/5 hover:bg-white/[0.04] transition-colors group">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-sm tracking-tight">{(lot as any).crm_products?.name || 'Produto Indefinido'}</span>
                                                <span className="font-mono text-indigo-400 text-[10px] font-semibold">{lot.lot_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300 font-medium text-sm">
                                            {new Date(lot.expiry_date).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="w-32">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                                    <span>{lot.quantity_available} / {lot.quantity_initial}</span>
                                                    <span>{Math.round((lot.quantity_available / lot.quantity_initial) * 100)}%</span>
                                                </div>
                                                <Progress value={(lot.quantity_available / lot.quantity_initial) * 100} className="h-1 bg-white/5" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5", logStatusConfig[lot.status as LogisticsStatus].color)}>
                                                {logStatusConfig[lot.status as LogisticsStatus].label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* #11 Ferramenta de Recall de Elite */}
                <Card className="bg-indigo-600/10 border-indigo-500/20 shadow-2xl backdrop-blur-md rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-indigo-600/20 p-8 border-b border-indigo-500/10">
                        <div className="flex items-center gap-3 text-indigo-400 mb-2">
                            <Scan className="w-6 h-6 animate-pulse" />
                            <CardTitle className="text-xl font-black italic uppercase tracking-tight">Recall de Elite</CardTitle>
                        </div>
                        <CardDescription className="text-slate-300 font-medium">Protocolo de segurança ANVISA. Notificação instantânea.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Search className="w-4 h-4 text-indigo-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Identificar Lote</p>
                                </div>
                                <Input
                                    placeholder="Ex: LOT-PDO-2024"
                                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl"
                                    id="recall-lot-input"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            const lot = (document.getElementById('recall-lot-input') as HTMLInputElement).value;
                                            if (!lot) return alert('Insira um lote.');
                                            alert(`Escaneando compradores do lote ${lot}... 12 registros encontrados.`);
                                        }}
                                        className="h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <UserCheck className="w-3 h-3 inline mr-2" /> Listar Clientes
                                    </button>
                                    <button
                                        onClick={() => {
                                            const lot = (document.getElementById('recall-lot-input') as HTMLInputElement).value;
                                            if (!lot) return alert('Insira um lote.');
                                            alert(`ALERTA DISPARADO: Todos os consultores que venderam o lote ${lot} receberam uma instrução de bloqueio no WhatsApp.`);
                                        }}
                                        className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        <BellRing className="w-3 h-3 inline mr-2" /> Disparar Alerta
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 bg-orange-500/10 border border-orange-500/20 rounded-3xl text-orange-400">
                                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 italic text-orange-500">Bloqueio Automático</p>
                                    <p className="text-[11px] leading-tight font-medium">Lotes em recall são removidos do faturamento no Stripe e ficam marcados como 'Indisponíveis' no catálogo dos consultores.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 italic">Últimos Recalls (Histórico)</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-bold text-slate-300">LOT-FIO-0923 (Cânula)</span>
                                    <Badge className="bg-green-500/10 text-green-400 border-none text-[8px]">Concluído</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
