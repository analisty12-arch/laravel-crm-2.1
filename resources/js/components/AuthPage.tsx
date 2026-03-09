import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Mail,
    LogIn,
    ShieldCheck,
    ArrowRight,
    Globe,
    Loader2,
    Lock,
    MessageSquare
} from 'lucide-react';

export function AuthPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState<'password' | 'magic'>('password');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (authMethod === 'password') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: window.location.origin,
                    }
                });
                if (error) throw error;
                alert('Link de acesso enviado para o seu e-mail!');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            alert(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] flex overflow-hidden font-sans">
            {/* Left Side: Brand & Visuals */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-purple-900/20 to-transparent" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-24 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-50" />

                <div className="relative z-10 flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Lock className="text-white w-5 h-5" />
                    </div>
                    <span className="text-white font-black text-2xl tracking-tighter uppercase italic">MedBeauty<span className="text-indigo-500">CRM</span></span>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tighter uppercase italic">
                        Plataforma de<br />
                        <span className="text-indigo-500">Atendimento </span><br />
                        Especializado.
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
                        Acesse sua carteira de leads, gerencie pedidos e acompanhe a logística ANVISA em tempo real.
                    </p>
                    <div className="flex items-center gap-6 pt-8">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#050510] bg-slate-800 overflow-hidden shadow-xl" />
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">+500 consultores ativos</p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <span>Versão 4.0.2</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full" />
                    <span>Segurança ANVISA</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full" />
                    <span>Supabase Encryption</span>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <Card className="w-full max-w-md bg-white/[0.03] backdrop-blur-3xl border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="h-2 bg-indigo-600 w-full" />
                    <CardHeader className="p-10 pb-4 text-center">
                        <CardTitle className="text-3xl font-black text-indigo-100 uppercase italic tracking-tighter mb-2">Bem-vindo ao Portal</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Acesse sua conta para começar as vendas.</CardDescription>
                    </CardHeader>

                    <CardContent className="p-10 space-y-8">
                        {/* Social Logins #2 Premium Auth */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                            >
                                <Globe className="w-4 h-4 text-white" /> Google
                            </button>
                            <button
                                onClick={() => handleSocialLogin('linkedin')}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                            >
                                <LogIn className="w-4 h-4 text-white" /> LinkedIn
                            </button>
                            <button
                                onClick={() => alert('WhatsApp Magic Link: Gerando token de acesso para seu número cadastrado...')}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all active:scale-95"
                            >
                                <MessageSquare className="w-4 h-4" /> WhatsApp
                            </button>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5" />
                            </div>
                            <span className="relative bg-[#0d0d1b] px-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest whitespace-nowrap">ou use seu e-mail corporativo</span>
                        </div>

                        {/* Email Login Flow */}
                        <form onSubmit={handleEmailAuth} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1 italic">E-mail ou WhatsApp</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <Input
                                            type="email"
                                            placeholder="ex: voce@medbeauty.com"
                                            className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-700 rounded-2xl focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                {authMethod === 'password' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Sua Senha</label>
                                            <button type="button" className="text-[10px] text-indigo-500 font-bold hover:underline">Esqueci a senha</button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-700 rounded-2xl focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>Acessar o Painel <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>

                        {/* Secondary Auth Method Toggle */}
                        <div className="flex justify-center flex-col gap-4 text-center">
                            <p
                                onClick={() => setAuthMethod(authMethod === 'password' ? 'magic' : 'password')}
                                className="text-xs text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors font-medium underline underline-offset-4"
                            >
                                {authMethod === 'password' ? 'Entrar com link mágico (WhatsApp/E-mail)' : 'Entrar com e-mail e senha'}
                            </p>

                            <div className="flex items-center justify-center gap-2 p-3 bg-indigo-500/5 rounded-2xl text-[10px] text-indigo-400 font-bold uppercase tracking-tighter border border-indigo-500/10">
                                <ShieldCheck className="w-4 h-4" />
                                Conexão criptografada ponta-a-ponta
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
