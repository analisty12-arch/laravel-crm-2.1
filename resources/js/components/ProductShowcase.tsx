import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Info, CheckCircle2, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { SeedCRMData } from '@/components/SeedCRMData';
import type { CRMProduct } from '@/types/crm';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1628102422238-693843e9313b?q=80&w=800&auto=format&fit=crop';

export function ProductShowcase() {
    const [products, setProducts] = useState<(CRMProduct & { image?: string, features?: string[] })[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase
                .from('crm_products')
                .select('*')
                .order('name', { ascending: true });

            if (data) {
                // Add default images and features if missing
                const enhanced = data.map((p: CRMProduct) => ({
                    ...p,
                    image: (p as any).image_url || FALLBACK_IMAGE,
                    features: (p as any).features || ['Qualidade Premium', 'Certificado ANVISA', 'Resistência Superior']
                }));
                setProducts(enhanced);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <p>Nenhum produto cadastrado no catálogo.</p>
                <SeedCRMData />
            </div>
        );
    }

    const activeProduct = products[activeIndex];

    return (
        <div className="h-full p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Catálogo Premium</h2>
                    <p className="text-slate-400">Produtos de alta tecnologia com certificação ANVISA.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-white/5 border-white/10 text-white rounded-xl"
                        onClick={() => setActiveIndex(prev => (prev === 0 ? products.length - 1 : prev - 1))}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-white/5 border-white/10 text-white rounded-xl"
                        onClick={() => setActiveIndex(prev => (prev === products.length - 1 ? 0 : prev + 1))}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
                {/* Animated Image Viewport */}
                <div className="relative aspect-square max-w-lg mx-auto group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeProduct.id}
                            initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 1.1, rotateY: 20 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="w-full h-full relative"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div className="absolute inset-0 bg-indigo-500/10 rounded-[40px] blur-3xl" />
                            <img
                                src={activeProduct.image}
                                alt={activeProduct.name}
                                className="w-full h-full object-cover rounded-[40px] border border-white/10 shadow-2xl relative z-10"
                            />

                            {/* Product Info Overlay (appearing on hover) */}
                            <motion.div
                                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                                className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm rounded-[40px] p-8 flex flex-col justify-end gap-4 pointer-events-none"
                            >
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <Star className="w-4 h-4 fill-indigo-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Produto Destaque</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white">{activeProduct.name}</h3>
                                <div className="flex gap-2">
                                    <Badge className="bg-white/10 text-white border-white/20">{activeProduct.gauge_usp} USP</Badge>
                                    <Badge className="bg-white/10 text-white border-white/20">{activeProduct.length_cm} cm</Badge>
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Detailed Info */}
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
                    <div className="space-y-4">
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                            {activeProduct.type}
                        </Badge>
                        <h1 className="text-5xl font-extrabold text-white leading-tight">
                            {activeProduct.name}
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            {activeProduct.description}
                        </p>
                    </div>

                    <Card className="bg-white/[0.03] border-white/5 backdrop-blur-xl">
                        <CardContent className="p-6 grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agulha/Injetor</span>
                                <div className="flex items-center gap-2 text-white">
                                    <Info className="w-4 h-4 text-indigo-400" />
                                    <span className="font-semibold">{activeProduct.needle_type}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reg. ANVISA</span>
                                <div className="flex items-center gap-2 text-white">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <span className="font-mono">{activeProduct.anvisa_registration}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Diferenciais Técnicos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {(activeProduct.features || []).map(feature => (
                                <div key={feature} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Preço Unidade</span>
                            <span className="text-4xl font-black text-white">
                                R$ {(activeProduct.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <Button className="flex-1 h-16 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-lg shadow-xl shadow-white/10 group transition-all">
                            <ShoppingCart className="w-6 h-6 mr-2 transition-transform group-hover:scale-110" />
                            VENDER AGORA
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
