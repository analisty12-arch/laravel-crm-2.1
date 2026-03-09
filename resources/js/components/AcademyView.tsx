import { Play, GraduationCap, Clock, Star, Download, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AcademyView() {
    const modules = [
        {
            title: 'Técnicas de Venda: Fios PDO',
            description: 'Aprenda como abordar cirurgiões plásticos para venda de fios de tração.',
            duration: '45 min',
            lessons: 8,
            rating: 4.8,
            category: 'Sales',
            image: 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?q=80&w=400&auto=format&fit=crop'
        },
        {
            title: 'Anatomia e Planos de Inserção',
            description: 'Conhecimento técnico essencial para demonstrar autoridade frente ao médico.',
            duration: '120 min',
            lessons: 15,
            rating: 5.0,
            category: 'Technical',
            image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=400&auto=format&fit=crop'
        },
        {
            title: 'Logística ANVISA & Compliance',
            description: 'Regras de ouro para rastreabilidade e segurança do paciente.',
            duration: '30 min',
            lessons: 4,
            rating: 4.9,
            category: 'Legal',
            image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=400&auto=format&fit=crop'
        }
    ];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 space-y-8 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <GraduationCap className="w-8 h-8" />
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">MedBeauty <span className="text-indigo-500">Academy</span></h2>
                    </div>
                    <p className="text-slate-500 font-medium italic">Transforme-se em um consultor de elite com nossas certificações.</p>
                </div>

                <div className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-3xl">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Seu Progresso</p>
                        <p className="text-xl font-black text-white italic">Elite Bronze</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center text-[10px] font-black text-indigo-400">
                        35%
                    </div>
                </div>
            </div>

            {/* Featured Course */}
            <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-500/10 group cursor-pointer">
                <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 p-12 space-y-6">
                        <Badge className="bg-white/20 text-white border-none uppercase tracking-[0.2em] text-[10px] font-black px-4 py-1">Lançamento</Badge>
                        <h3 className="text-5xl font-black text-white italic leading-none">Mastering <br /> Aesthetic Sales</h3>
                        <p className="text-indigo-100 text-lg font-medium max-w-sm">O curso definitivo para fechar contratos de alto ticket com clínicas premium.</p>
                        <div className="flex items-center gap-6 pt-4">
                            <Button className="h-14 px-8 bg-white text-indigo-600 hover:bg-slate-100 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
                                <Play className="w-4 h-4 mr-2 fill-current" /> Iniciar Agora
                            </Button>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">24 h de conteúdo</span>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 relative min-h-[300px]">
                        <img
                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
                            className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                            alt="Academy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-transparent to-transparent md:block hidden" />
                    </div>
                </CardContent>
            </Card>

            {/* Modules Grid */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Módulos de Especialização</h4>
                    <button className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
                        Ver Todos <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                    {modules.map((m) => (
                        <Card key={m.title} className="bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all rounded-[2.5rem] overflow-hidden group">
                            <div className="h-48 relative overflow-hidden">
                                <img src={m.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" alt={m.title} />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all" />
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 uppercase tracking-widest text-[8px] font-black">{m.category}</Badge>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-2xl">
                                        <Play className="w-5 h-5 fill-current" />
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-4">
                                <div className="flex justify-between items-start gap-2">
                                    <h5 className="text-lg font-black text-white italic tracking-tight leading-tight">{m.title}</h5>
                                    <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                                        <Star className="w-3 h-3 fill-current" /> {m.rating}
                                    </div>
                                </div>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">{m.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.duration}</span>
                                        <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {m.lessons} aulas</span>
                                    </div>
                                    <button className="p-2 text-slate-600 hover:text-indigo-400 transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
