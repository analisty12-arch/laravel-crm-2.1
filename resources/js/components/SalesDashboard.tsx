import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Trophy,
    ArrowUpRight,
    DollarSign,
    ShoppingCart,
    Filter,
    Medal,
    Target,
    Users,
    Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import type { CRMOrder } from '@/types/crm';
import { cn } from '@/lib/utils';

export function SalesDashboard() {
    const [orders, setOrders] = useState<CRMOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState<any[]>([]);
    const [statsSummary, setStatsSummary] = useState({
        revenue: 0,
        orderCount: 0,
        conversionRate: 0
    });

    useEffect(() => {
        const fetchSalesStats = async () => {
            // 1. Fetch Orders with Lead/Consultant info
            const { data: ordersData } = await supabase
                .from('crm_orders')
                .select(`
                    *,
                    crm_leads (
                        name,
                        assigned_to
                    )
                `)
                .order('created_at', { ascending: false });

            // 2. Fetch Profiles for names
            const { data: profiles } = await supabase
                .from('crm_profiles')
                .select('*');

            // 3. Fetch Total Leads for conversion
            const { count: totalLeads } = await supabase
                .from('crm_leads')
                .select('*', { count: 'exact', head: true });

            if (ordersData) {
                setOrders(ordersData);

                const totalRevenue = ordersData.reduce((acc, order) => acc + (order.total_amount_cents || 0), 0);
                const conversion = totalLeads ? (ordersData.length / totalLeads) * 100 : 0;

                setStatsSummary({
                    revenue: totalRevenue / 100,
                    orderCount: ordersData.length,
                    conversionRate: conversion
                });

                // 4. Calculate Dynamic Ranking (#5 Gamificação)
                const salesByConsultant = ordersData.reduce((acc: any, order) => {
                    const lead = (order as any).crm_leads;
                    const consultantId = lead?.assigned_to;

                    if (consultantId) {
                        if (!acc[consultantId]) {
                            const profile = profiles?.find(p => p.id === consultantId);
                            acc[consultantId] = {
                                name: profile?.full_name || 'Consultor',
                                total: 0,
                                count: 0,
                                avatar: profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'C'
                            };
                        }
                        acc[consultantId].total += (order.total_amount_cents || 0);
                        acc[consultantId].count += 1;
                    }
                    return acc;
                }, {});

                const rankedData = Object.entries(salesByConsultant)
                    .map(([id, stats]: [string, any]) => ({ id, ...stats }))
                    .sort((a, b) => b.total - a.total);

                setRanking(rankedData);
            }
            setLoading(false);
        };
        fetchSalesStats();
    }, []);

    const kpis = [
        {
            label: 'Receita Total CRM',
            value: `R$ ${statsSummary.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            change: 'Tempo Real',
            trend: 'up',
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-green-400',
            bg: 'bg-green-500/10'
        },
        {
            label: 'Taxa de Conversão',
            value: `${statsSummary.conversionRate.toFixed(1)}%`,
            change: 'Base: Leads',
            trend: 'up',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10'
        },
        {
            label: 'Total de Pedidos',
            value: statsSummary.orderCount.toString(),
            change: 'Sinc. Stripe',
            trend: 'up',
            icon: <ShoppingCart className="w-5 h-5" />,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10'
        }
    ];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Painel de <span className="text-indigo-500">Performance</span></h2>
                    <p className="text-slate-500 text-sm font-medium italic">Monitoramento dinâmico de conversões e ranking da elite.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Meta Mensal de Grupo</p>
                        <p className="text-white font-black italic">R$ 500.000,00</p>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 overflow-hidden group hover:border-white/10 transition-all rounded-[2rem]">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={cn("p-4 rounded-2xl", kpi.bg, kpi.color)}>
                                        {kpi.icon}
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5",
                                        kpi.trend === 'up' ? "text-green-400" : "text-orange-400"
                                    )}>
                                        {kpi.change}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter mb-1">{kpi.value}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{kpi.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                {/* Orders Table */}
                <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight">Transações Recentes</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Fluxo de caixa sincronizado em tempo real.</CardDescription>
                        </div>
                        <Filter className="w-5 h-5 text-slate-500 cursor-pointer hover:text-white transition-colors" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="border-white/5">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Médico / Clínica</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Valor</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Data</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Carregando...</TableCell></TableRow>
                                ) : orders.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-500 font-black uppercase tracking-widest opacity-30">Nenhum pedido processado</TableCell></TableRow>
                                ) : orders.map((order) => (
                                    <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400">
                                                    {(order as any).crm_leads?.name[0]}
                                                </div>
                                                <span className="text-sm font-black text-slate-200">{(order as any).crm_leads?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-green-400 italic">R$ {(order.total_amount_cents / 100).toLocaleString('pt-BR')}</span>
                                        </td>
                                        <td className="px-8 py-5 text-slate-500 text-[10px] font-bold uppercase">
                                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Badge className={cn(
                                                "text-[9px] font-black px-3 py-1 border uppercase tracking-widest",
                                                order.payment_status === 'paid' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    order.payment_status === 'pending' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>
                                                {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                                            </Badge>
                                        </td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Seller Ranking (#5 Gamificação) */}
                <Card className="bg-white/5 border-white/5 shadow-2xl backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-32 h-32 text-indigo-400" />
                    </div>
                    <CardHeader className="p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                <Medal className="w-6 h-6 text-amber-500" />
                            </div>
                            <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight">Elite Performance</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 font-medium">Os melhores consultores do mês.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        {ranking.length === 0 ? (
                            <div className="text-center py-20 opacity-30 space-y-4">
                                <Users className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aguardando dados de performance...</p>
                            </div>
                        ) : ranking.map((seller, i) => (
                            <div key={seller.id} className="relative">
                                <div className="flex items-center gap-6 mb-3">
                                    <div className="relative">
                                        <Avatar className="w-14 h-14 border-2 border-white/10 shadow-2xl">
                                            <AvatarFallback className="bg-slate-800 text-indigo-400 font-black italic">{seller.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div className={cn(
                                            "absolute -top-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border-4 border-[#020617] rotate-12",
                                            i === 0 ? "bg-amber-500 text-slate-900" :
                                                i === 1 ? "bg-slate-300 text-slate-900" :
                                                    "bg-orange-600 text-white"
                                        )}>
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-end mb-2">
                                            <h4 className="text-white font-black italic truncate">{seller.name}</h4>
                                            <span className="text-indigo-400 text-xs font-black italic">R$ {(seller.total / 100).toLocaleString('pt-BR')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Progress value={(seller.total / (ranking[0].total || 1)) * 100} className="h-2 bg-white/5 rounded-full" />
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3].map(s => <Star key={s} className={cn("w-2 h-2", s <= (3 - i) ? "text-amber-500 fill-current" : "text-slate-800")} />)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-between p-5 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                        <Target className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Atingimento Global</p>
                                        <p className="text-sm font-black text-green-400 italic">{((statsSummary.revenue * 100) / 500000).toFixed(1)}% da Meta</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-indigo-500 animate-pulse" />
                            </div>
                            <button className="w-full h-12 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                                Ver Relatório Detalhado
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className={className}><Target className="w-8 h-8" /></motion.div>
}
