import { useState } from 'react';
import { Database, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function SeedCRMData() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const seed = async () => {
        setLoading(true);
        try {
            // 1. Seed Products
            const products = [
                {
                    name: 'Fio Espiculado COG 4D',
                    type: 'espiculado',
                    gauge_usp: '1-0',
                    length_cm: 10,
                    needle_type: 'Cânula W-Type',
                    anvisa_registration: '80123456789',
                    description: 'Fio de PDO com garras bidirecionais para lifting facial imediato.',
                    price_cents: 45000
                },
                {
                    name: 'Sutura Mono PDO',
                    type: 'sutura',
                    gauge_usp: '3-0',
                    length_cm: 5,
                    needle_type: 'Agulha Curva 1/2',
                    anvisa_registration: '80123456780',
                    description: 'Fio monofilamentar para rejuvenescimento e textura de pele.',
                    price_cents: 12000
                },
                {
                    name: 'Parafuso Titânio 2.0mm',
                    type: 'parafuso',
                    gauge_usp: 'N/A',
                    length_cm: 2,
                    needle_type: 'Hexagonal',
                    anvisa_registration: '80123456781',
                    description: 'Parafuso de fixação óssea em titânio grau médico.',
                    price_cents: 8500
                }
            ];

            const { data: insertedProducts, error: pError } = await supabase
                .from('crm_products')
                .upsert(products, { onConflict: 'name' })
                .select();

            if (pError) throw pError;

            // 2. Seed Lots
            if (insertedProducts) {
                const lots = insertedProducts.map(p => ({
                    product_id: p.id,
                    lot_number: `LOT-${p.name.substring(0, 3).toUpperCase()}-2024`,
                    expiry_date: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // 1 year from now
                    quantity_initial: 1000,
                    quantity_available: 850,
                    status: 'em_estoque'
                }));

                const { error: lError } = await supabase.from('crm_lots').upsert(lots, { onConflict: 'lot_number, product_id' });
                if (lError) throw lError;
            }

            // 3. Seed Leads
            const leads = [
                {
                    name: 'Dr. Ricardo Silva',
                    phone: '+55 11 99999-9999',
                    email: 'ricardo@hospital.com',
                    segment: 'medico',
                    specialty: 'Dermatologia',
                    crm_license: 'CRM/SP 123456',
                    status: 'novo',
                    ai_score_hot: true,
                    ai_analysis_summary: 'Alta intenção de compra para fios espiculados.'
                },
                {
                    name: 'Clínica Aesthetic',
                    phone: '+55 11 98888-8888',
                    email: 'contato@aesthetic.com',
                    segment: 'clinica',
                    specialty: 'Estética Avançada',
                    crm_license: 'ALVARÁ-9988',
                    status: 'em_atendimento',
                    ai_score_hot: false,
                    ai_analysis_summary: 'Dúvidas sobre o prazo de entrega dos pedidos.'
                }
            ];

            const { data: insertedLeads, error: leError } = await supabase.from('crm_leads').upsert(leads, { onConflict: 'phone' }).select();
            if (leError) throw leError;

            // 4. Seed Orders (for Sales Dashboard)
            if (insertedLeads && insertedProducts) {
                const orders = insertedLeads.map((l, i) => ({
                    lead_id: l.id,
                    total_amount_cents: i === 0 ? 135000 : 45000,
                    payment_status: 'paid',
                    created_at: new Date(Date.now() - (i * 86400000)).toISOString()
                }));

                const { data: insertedOrders, error: oError } = await supabase.from('crm_orders').upsert(orders).select();
                if (oError) throw oError;

                if (insertedOrders) {
                    const orderItems = insertedOrders.map((o, i) => ({
                        order_id: o.id,
                        product_id: insertedProducts[i % insertedProducts.length].id,
                        quantity: i === 0 ? 3 : 1,
                        unit_price_cents: 45000
                    }));
                    await supabase.from('crm_order_items').insert(orderItems);
                }
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            console.error('--- SEED ERROR DETAILS ---');
            console.error('Message:', error.message);
            console.error('Full Error Object:', error);

            let tip = '';
            if (error.message?.includes('relation') || error.message?.includes('not found')) {
                tip = '\n\nDica: As tabelas no Supabase ainda não foram criadas. Você precisa rodar o script SQL no Dashboard do Supabase.';
            } else if (error.message?.includes('constraint') || error.message?.includes('unique')) {
                tip = '\n\nDica: Erro de restrição única. Verifique se as colunas "name" e "phone" possuem a restrição UNIQUE.';
            } else if (error.message?.includes('fetch')) {
                tip = '\n\nDica: Erro de conexão. Verifique se o VITE_SUPABASE_URL no seu .env está correto e se o projeto não está pausado.';
            }

            alert('Falha ao semear dados: ' + error.message + tip);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={seed}
            disabled={loading}
            variant="outline"
            className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300"
        >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : success ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Database className="w-4 h-4 mr-2" />}
            {loading ? 'Semeando...' : success ? 'Sucesso!' : 'Semear Dados Demo'}
        </Button>
    );
}
