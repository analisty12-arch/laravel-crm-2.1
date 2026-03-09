import { useState } from 'react';
import {
    Search,
    LogOut,
    LayoutDashboard,
    PhoneCall,
    Package,
    Bell,
    Settings,
    ChevronLeft,
    Languages,
    GraduationCap,
    TrendingUp,
    ShieldCheck,
    Target,
    Stethoscope,
    ClipboardList,
    Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { QueueWorkspace } from '@/components/QueueWorkspace';
import { LogisticsDashboard } from '@/components/LogisticsDashboard';
import { ChatPanel } from '@/components/ChatPanel';
import { ProductShowcase } from '@/components/ProductShowcase';
import { SalesDashboard } from '@/components/SalesDashboard';
import { SeedCRMData } from '@/components/SeedCRMData';
import { LeadScout } from '@/components/LeadScout';
import { AcademyView } from '@/components/AcademyView';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { CRMLead } from '@/types/crm';
import { cn } from '@/lib/utils';

type CRMView = 'leads' | 'logistics' | 'sales' | 'catalog' | 'scout' | 'academy';

export default function CRMLayout({
    onLogout,
    user,
    onNavigateTo,
}: {
    onLogout: () => void;
    user: any;
    onNavigateTo?: (view: string) => void;
}) {
    const [activeView, setActiveView] = useState<CRMView>('leads');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);

    const profile = user;

    // Internal CRM views
    const menuItems = [
        { id: 'sales', label: 'Estatísticas de Elite', icon: TrendingUp, color: 'text-indigo-400', external: false },
        { id: 'leads', label: 'Gestão de Relacionamento', icon: PhoneCall, color: 'text-emerald-400', external: false },
        { id: 'scout', label: 'Prospecção (G.I. Joe)', icon: Target, color: 'text-amber-400', external: false },
        { id: 'logistics', label: 'Logística & Compliance', icon: ShieldCheck, color: 'text-blue-400', external: false },
        { id: 'catalog', label: 'Showroom Premium', icon: LayoutDashboard, color: 'text-purple-400', external: false },
    ];

    // Views handled by App.tsx (navigate out of CRMLayout)
    const appNavItems = [
        { id: 'dashboard', label: 'Checklists & Processos', icon: ClipboardList, color: 'text-rose-400' },
        { id: 'employees', label: 'Colaboradores (RH)', icon: Users, color: 'text-cyan-400' },
    ];

    const techItems = [
        { id: 'academy', label: 'MedBeauty Academy', icon: GraduationCap, color: 'text-indigo-400' },
        { id: 'lang', label: 'Idioma: PT-BR', icon: Languages, color: 'text-slate-400' },
    ];

    return (
        <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Sidebar */}
            <aside
                className={`bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 transition-all duration-500 ease-in-out flex flex-col ${sidebarOpen ? 'w-72' : 'w-20'}`}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                        <Package className="text-white w-6 h-6" />
                    </div>
                    {sidebarOpen && (
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Ecomed CRM</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Medical Supply</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id as CRMView)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeView === item.id
                                ? 'bg-indigo-500/10 border border-indigo-500/20 text-white'
                                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-active:scale-90 ${activeView === item.id ? item.color : ''}`} />
                            {sidebarOpen && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
                            {activeView === item.id && sidebarOpen && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            )}
                        </button>
                    ))}

                    {/* App-level navigation (handled by App.tsx) */}
                    {onNavigateTo && (
                        <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                            {sidebarOpen && <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 px-4 mb-2">Operações</p>}
                            {appNavItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigateTo(item.id)}
                                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group text-slate-500 hover:bg-white/5 hover:text-slate-300"
                                >
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
                                    {sidebarOpen && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                        {sidebarOpen && <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 px-4 mb-2">Treinamento & Tech</p>}
                        {techItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'lang') return alert(`Idioma configurado: PT-BR (Brasileiro Elite).`);
                                    setActiveView(item.id as CRMView);
                                }}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${activeView === item.id ? 'bg-indigo-500/10 text-white' : 'text-slate-600 hover:text-indigo-400 hover:bg-white/5'}`}
                            >
                                <item.icon className={cn("w-5 h-5 flex-shrink-0 opacity-50 group-hover:opacity-100", activeView === item.id && "opacity-100 " + item.color)} />
                                {sidebarOpen && <span className={cn("font-bold text-xs uppercase tracking-widest", activeView === item.id && "text-white")}>{item.label}</span>}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center gap-4 px-4 text-slate-500 hover:text-white transition-colors py-2"
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${sidebarOpen ? '' : 'rotate-180'}`} />
                        {sidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">Recolher</span>}
                    </button>

                    <div className="flex items-center gap-4 px-2">
                        <Avatar className={cn(
                            "w-10 h-10 border ring-2 transition-all",
                            profile?.role === 'adm_geral' ? "border-indigo-500 ring-indigo-500/20" : "border-white/10 ring-transparent"
                        )}>
                            <AvatarFallback className={cn(
                                "font-bold",
                                profile?.role === 'adm_geral' ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
                            )}>
                                {(profile?.name || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{profile?.name || 'Usuário'}</p>
                                <p className={cn(
                                    "text-[10px] font-black uppercase truncate tracking-widest flex items-center gap-1",
                                    profile?.role === 'adm_geral' ? "text-indigo-400" : "text-slate-500"
                                )}>
                                    {profile?.role === 'adm_geral' && <Stethoscope className="w-3 h-3" />}
                                    {profile?.role === 'adm_geral' ? 'ADM GERAL' : (profile?.role || 'Consultor')}
                                </p>
                            </div>
                        )}
                        {sidebarOpen && (
                            <button
                                onClick={onLogout}
                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                title="Sair"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-xl border-b border-white/5 z-10">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="relative w-full max-w-lg hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Pesquisa global avançada (Lotes, Médicos, NF-e)..."
                                className="bg-white/5 border-white/5 focus:border-indigo-500/50 pl-12 h-11 text-sm text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <SeedCRMData />
                        <button className="relative p-2.5 text-slate-400 hover:text-white bg-white/5 rounded-xl transition-all border border-white/5">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#020617]" />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-white bg-white/5 rounded-xl transition-all border border-white/5">
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-px bg-white/5 mx-2" />
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">Status do Sistema</p>
                            <p className="text-xs text-green-400 flex items-center gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Operacional
                            </p>
                        </div>
                    </div>
                </header>

                {/* Dynamic View */}
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                    {activeView === 'scout' && (
                        <div className="h-full animate-in fade-in slide-in-from-right-4 duration-700">
                            <LeadScout user={user} />
                        </div>
                    )}

                    {activeView === 'leads' && (
                        <div className="h-full flex p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <QueueWorkspace />
                        </div>
                    )}

                    {activeView === 'logistics' && (
                        <div className="h-full overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-700">
                            <LogisticsDashboard />
                        </div>
                    )}

                    {activeView === 'catalog' && (
                        <div className="h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                            <ProductShowcase />
                        </div>
                    )}

                    {activeView === 'sales' && (
                        <div className="h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                            <SalesDashboard />
                        </div>
                    )}

                    {activeView === 'academy' && (
                        <div className="h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
                            <AcademyView />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
