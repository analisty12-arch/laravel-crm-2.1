import { useState, useEffect } from 'react'
import { authApi, checklistApi, taskApi } from './lib/api'
import { templates } from './data/templates'
import CRMLayout from './components/CRMLayout'
import { ChecklistView, type ChecklistData } from './components/ChecklistView'
import { Dashboard } from './components/Dashboard'
import { SocialFeed } from './components/SocialFeed'
import { EmployeeDirectory } from './components/EmployeeDirectory'
import { CalendarView } from './components/CalendarView'
import {
  Mail, Lock, ArrowRight, Loader2, ShieldCheck,
  Package, ClipboardList, PhoneCall, Users, Globe, ChevronLeft
} from 'lucide-react'
import './App.css'

// ─── Single Unified Login Page ────────────────────────────────────────────────
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.login(email.trim(), password);
      window.location.reload();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex overflow-hidden font-sans">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-purple-900/20 to-transparent" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-50" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="text-white font-black text-2xl tracking-tighter uppercase italic">
            MedBeauty<span className="text-indigo-400">CRM</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tighter uppercase italic">
            Portal<br />
            <span className="text-indigo-400">Interno </span><br />
            Unificado.
          </h1>
          <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
            Gerencie leads, checklists, logística ANVISA, equipe e processos — tudo em uma única plataforma.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 pt-4">
            {[
              { icon: PhoneCall, label: 'CRM de Leads' },
              { icon: ClipboardList, label: 'Checklists' },
              { icon: Users, label: 'Equipe & RH' },
              { icon: Globe, label: 'Logística' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-xs font-semibold">
                <Icon className="w-3.5 h-3.5 text-indigo-400" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-6 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          <span>MedBeauty S.A.</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>Sistema Interno</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>v2.1.0</span>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#08081a]">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="text-white font-black text-xl tracking-tighter uppercase italic">
              MedBeauty<span className="text-indigo-400">CRM</span>
            </span>
          </div>

          {/* Card */}
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600" />
            <div className="p-10 space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                  Bem-vindo(a)
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Acesse com suas credenciais corporativas
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">
                    E-mail corporativo
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="voce@medbeauty.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 text-white placeholder:text-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 text-white placeholder:text-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Acessar o Portal <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 p-3 bg-indigo-500/5 rounded-2xl text-[10px] text-indigo-400 font-bold uppercase tracking-tighter border border-indigo-500/10">
                <ShieldCheck className="w-4 h-4" />
                Conexão segura — Laravel Sanctum
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<
    'crm' | 'dashboard' | 'feed' | 'employees' | 'calendar'
  >('crm');
  const [checklists, setChecklists] = useState<ChecklistData[]>([]);
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);

  useEffect(() => {
    if (authApi.isAuthenticated()) {
      const user = authApi.getUser();
      if (user) {
        // Sanitize legacy cached users with object role
        if (typeof user.role === 'object') {
          authApi.logout();
          window.location.reload();
          return;
        }
        setCurrentUser(user);
        fetchChecklists();
      }
    }
    setIsLoading(false);
  }, []);

  async function fetchChecklists() {
    try {
      const data = await checklistApi.getAll();
      const combined: ChecklistData[] = data.map((c: any) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        data: c.data,
        createdAt: new Date(c.created_at).getTime(),
        items: (c.tasks || []).map((t: any) => ({
          id: t.id,
          text: t.text,
          role: t.role || undefined,
          isCompleted: t.completed,
          createdAt: new Date(t.created_at).getTime()
        }))
      }));
      setChecklists(combined);
    } catch (err) {
      console.warn('fetchChecklists error:', err);
    }
  }

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setChecklists([]);
    setView('crm');
  };

  const handleCreate = async (templateId: string, title?: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template && templateId !== 'custom') return;

    const listTitle = title || (template ? template.title : 'Nova Lista');
    const listType = template ? template.title : 'Custom List';

    try {
      const newList = await checklistApi.create({ title: listTitle, type: listType });
      let items: any[] = [];
      if (template) {
        for (const step of template.steps) {
          const task = await taskApi.create(newList.id, {
            text: step.text,
            role: step.role,
            completed: false
          });
          items.push(task);
        }
      }
      const newLocal: ChecklistData = {
        id: newList.id,
        title: newList.title,
        type: newList.type,
        data: newList.data,
        createdAt: new Date(newList.created_at).getTime(),
        items: items.map(t => ({
          id: t.id,
          text: t.text,
          role: t.role || undefined,
          isCompleted: t.completed,
          createdAt: new Date(t.created_at).getTime()
        }))
      };
      setChecklists([newLocal, ...checklists]);
      setActiveChecklistId(newList.id);
    } catch (err) {
      console.error('Error creating checklist:', err);
    }
  };

  const handleTaskAdd = async (checklistId: string, text: string) => {
    try {
      const data = await taskApi.create(checklistId, { text, completed: false });
      const newItem = {
        id: data.id,
        text: data.text,
        role: data.role || undefined,
        isCompleted: data.completed,
        createdAt: new Date(data.created_at).getTime()
      };
      setChecklists(prev => prev.map(c =>
        c.id === checklistId ? { ...c, items: [newItem, ...c.items] } : c
      ));
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    setChecklists(prev => prev.map(c => ({
      ...c,
      items: c.items.map(i => i.id === taskId ? { ...i, isCompleted: !currentStatus } : i)
    })));
    await taskApi.update(taskId, { completed: !currentStatus }).catch(console.error);
  };

  const handleTaskDelete = async (taskId: string) => {
    setChecklists(prev => prev.map(c => ({
      ...c,
      items: c.items.filter(i => i.id !== taskId)
    })));
    await taskApi.remove(taskId).catch(console.error);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // ── Not authenticated → show unified login ─────────────────────────────────
  if (!currentUser) {
    return <LoginPage />;
  }

  // ── CRM view (default after login) ────────────────────────────────────────
  if (view === 'crm') {
    return (
      <CRMLayout
        user={currentUser}
        onLogout={handleLogout}
        onNavigateTo={(v: string) => setView(v as any)}
      />
    );
  }

  // ── Checklist active ───────────────────────────────────────────────────────
  const activeChecklist = checklists.find(c => c.id === activeChecklistId);
  if (activeChecklist) {
    return (
      <ChecklistView
        checklist={activeChecklist}
        onUpdate={(updates) => {
          setChecklists(prev => prev.map(c => c.id === activeChecklist.id ? { ...c, ...updates } : c));
        }}
        onBack={() => setActiveChecklistId(null)}
        onTaskAdd={(text) => handleTaskAdd(activeChecklist.id, text)}
        onTaskToggle={(taskId, status) => handleTaskToggle(taskId, status)}
        onTaskDelete={(taskId) => handleTaskDelete(taskId)}
        user={currentUser}
      />
    );
  }

  // ── Reusable nav bar for secondary views ──────────────────────────────────
  const BackBar = ({ title }: { title: string }) => (
    <header className="h-14 flex items-center gap-4 px-6 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <button
        onClick={() => setView('crm')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar ao CRM
      </button>
      <span className="text-slate-300">|</span>
      <span className="text-sm font-semibold text-slate-800">{title}</span>
    </header>
  );

  // ── Employees directory ──────────────────────────────────────────────────
  if (view === 'employees') return (
    <div className="min-h-screen bg-slate-50">
      <BackBar title="Colaboradores & RH" />
      <EmployeeDirectory standalone={true} currentUser={currentUser} />
    </div>
  );

  // ── Calendar ───────────────────────────────────────────────────────────
  if (view === 'calendar') return (
    <div className="min-h-screen bg-slate-50">
      <BackBar title="Calendário" />
      <div className="p-6"><CalendarView /></div>
    </div>
  );

  // ── Social feed ─────────────────────────────────────────────────────────
  if (view === 'feed') return (
    <SocialFeed
      user={currentUser}
      onLogout={handleLogout}
      onOpenChecklists={() => setView('dashboard')}
      onNavigateToEmployees={() => setView('employees')}
      onNavigateToCalendar={() => setView('calendar')}
      onOpenAdmin={() => setView('crm')}
      onOpenInventory={() => setView('crm')}
      onOpenCalendar={() => setView('calendar')}
      pendingManager={checklists.filter(c => c.data?.currentSection === 2).length}
    />
  );

  // ── Dashboard (checklists list) ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <BackBar title="Checklists & Processos" />
      <Dashboard
        checklists={checklists}
        onSelect={setActiveChecklistId}
        onCreate={handleCreate}
        onDelete={async (id) => {
          if (window.confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
            await checklistApi.remove(id).catch(console.error);
            setChecklists(prev => prev.filter(c => c.id !== id));
          }
        }}
        user={currentUser}
      />
    </div>
  );
}
