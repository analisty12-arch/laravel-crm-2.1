import { useState, type KeyboardEvent } from 'react';
import { ArrowLeft, Plus, Trash2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AdmissaoFlow } from './AdmissaoFlow';
import { DemissaoFlow } from './DemissaoFlow';
import { templates } from '@/data/templates';

export interface ChecklistItem {
    id: string;
    text: string;
    isCompleted: boolean;
    role: string;
    key?: string;
}

export interface ChecklistData {
    id: string;
    title: string;
    type: string;
    createdAt: number;
    items: ChecklistItem[];
    data?: any;
}

interface ChecklistViewProps {
    checklist: ChecklistData;
    onUpdate: (updates: Partial<ChecklistData>) => void;
    onBack: () => void;
    onTaskAdd: (text: string) => void;
    onTaskToggle: (taskId: string, isCompleted: boolean) => void;
    onTaskDelete: (taskId: string) => void;
    user: any;
}

export function ChecklistView({
    checklist,
    onUpdate,
    onBack,
    onTaskAdd,
    onTaskToggle,
    onTaskDelete,
    user
}: ChecklistViewProps) {
    const [newItemText, setNewItemText] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addItem();
        }
    };

    const addItem = () => {
        if (newItemText.trim()) {
            onTaskAdd(newItemText);
            setNewItemText('');
        }
    };

    const isAdmissao = checklist.type === 'Processo de Admissão' || checklist.title.includes('Admissão');
    const isDemissao = checklist.type === 'Processo de Demissão' || checklist.title.includes('Demissão');

    const syncItems = (items: ChecklistItem[], data: any, type: 'admissao' | 'demissao'): ChecklistItem[] => {
        return items.map(item => {
            let isCompleted = item.isCompleted;
            const text = item.text.toLowerCase();
            const key = item.key; // New robust key

            if (type === 'admissao') {
                // 1. Data Collection (RH)
                if (key === 'rh_dados' || text.includes('nome completo'))
                    isCompleted = !!(data.nome_completo && (data.nome_exibicao || data.cpf));

                if (key === 'rh_datas' || text.includes('data de admissão'))
                    isCompleted = !!(data.data_admissao && data.data_inicio);

                if (key === 'rh_cargo' || text.includes('depto, cargo'))
                    isCompleted = !!(data.setor_departamento && data.cargo_funcao);

                // 2. Manager Definitions
                if (key === 'gestor_buddy' || text.includes('buddy/mentor'))
                    isCompleted = !!data.buddy_mentor;

                if (key === 'gestor_equip' || text.includes('solicitar equipamentos'))
                    isCompleted = data.equipamentos_necessarios?.length > 0;

                if (key === 'gestor_acessos' || text.includes('solicitar acessos'))
                    isCompleted = data.acessos_necessarios?.length > 0 || !!data.sharepoint_pasta;

                // 3. TI Provisions
                // CONDITIONAL LOGIC: If not requested, mark as done

                // AD is usually mandatory if employee type requires it, but let's assume always required for now
                if (key === 'ti_ad' || text.includes('conta no ad'))
                    isCompleted = data.conta_ad_criada === 'Sim';

                if (key === 'ti_email' || text.includes('e-mail corporativo'))
                    isCompleted = data.email_corporativo_criado === 'Sim';

                // VPN - Conditional
                if (key === 'ti_vpn' || text.includes('vpn')) {
                    if (data.necessita_vpn === 'Sim') {
                        isCompleted = data.vpn_configurada === 'Sim';
                    } else if (data.necessita_vpn === 'Nao') {
                        isCompleted = true; // Auto-complete if not needed
                    }
                    // If undefined (not reached Gestor step yet), stays false
                }

                // Systems - Conditional on Software List
                const softwares = data.softwares_necessarios || [];

                if (key === 'ti_sap' || text.includes('sap b1')) {
                    if (softwares.includes('SAP B1')) {
                        isCompleted = data.usuario_sap_criado === 'Sim';
                    } else if (data.currentSection > 2) {
                        // Only auto-complete if we passed the Gestor stage (so we know for sure it wasn't asked)
                        isCompleted = true;
                    }
                }

                if (key === 'ti_salesforce' || text.includes('salesforce')) {
                    if (softwares.includes('Salesforce')) {
                        isCompleted = data.perfil_salesforce_criado === 'Sim';
                    } else if (data.currentSection > 2) {
                        isCompleted = true;
                    }
                }

                if (key === 'ti_rede' || text.includes('pastas de rede'))
                    isCompleted = data.pastas_rede_liberadas === 'Sim';

                // Printer - Conditional
                if (key === 'ti_impressora' || text.includes('impressoras')) {
                    if (data.necessita_impressora === 'Sim') {
                        isCompleted = data.impressoras_configuradas === 'Sim';
                    } else if (data.necessita_impressora === 'Nao') {
                        isCompleted = true;
                    }
                }

                if (key === 'ti_testes' || text.includes('testes gerais'))
                    isCompleted = data.testes_gerais_realizados === 'Sim';

                // 4. Employee Confirmations
                if (key === 'colab_equip' || text.includes('recebimento de equipamentos'))
                    isCompleted = data.confirma_recebimento_equipamentos === 'Sim';

                if (key === 'colab_acessos' || text.includes('funcionamento de acessos'))
                    isCompleted = data.confirma_funcionamento_acessos === 'Sim';

                if (key === 'colab_orientacao' || text.includes('orientação inicial'))
                    isCompleted = data.recebeu_orientacao_sistemas === 'Sim';

            } else if (type === 'demissao') {
                if (key === 'rh_comunicado' || text.includes('carta de demissão') || text.includes('comunicar'))
                    isCompleted = !!data.nome_completo;

                if (key === 'rh_datas' || text.includes('último dia'))
                    isCompleted = !!data.ultimo_dia;

                if (key === 'rh_exame' || text.includes('agendar exame'))
                    isCompleted = data.solicitar_exame === true;

                if (key === 'gestor_equip' || text.includes('equipamentos físicos'))
                    isCompleted = data.equipamentos_devolvidos === 'Sim' || data.equipamentos_recolhidos === true;

                if (key === 'gestor_pendencias' || text.includes('pendências de trabalho'))
                    isCompleted = !!data.lista_pendencias;

                if (key === 'ti_ad' || text.includes('bloquear conta ad'))
                    isCompleted = data.conta_ad_bloqueada === true;

                if (key === 'ti_email' || text.includes('bloquear e-mail'))
                    isCompleted = data.email_bloqueado === true;

                if (key === 'ti_vpn' || text.includes('revogar acesso vpn'))
                    isCompleted = data.acesso_vpn_revogado === true;

                if (key === 'ti_sap' || text.includes('sap b1'))
                    isCompleted = data.bloquear_sap === true;

                if (key === 'ti_salesforce' || text.includes('salesforce'))
                    isCompleted = data.congelar_salesforce === true;

                // Sync old DP items (now RH)
                if (key === 'dp_verbas' || text.includes('verbas rescisórias'))
                    isCompleted = !!data.data_homologacao;

                if (key === 'dp_guias' || text.includes('guias'))
                    isCompleted = !!data.data_homologacao; // Usually done together or scheduled

                if (key === 'dp_ctps' || text.includes('ctps'))
                    isCompleted = data.carteira_assinada === true;

                if (key === 'dp_arquivo' || text.includes('arquivar'))
                    isCompleted = !!data.data_homologacao && data.carteira_assinada === true; // Assumed done when flow completes
            }
            return { ...item, isCompleted };
        });
    };

    if (isAdmissao || isDemissao) {
        return (
            <div className="container mx-auto p-4 max-w-4xl animate-in fade-in">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold font-serif text-rose-gold-dark">{checklist.title}</h1>
                </div>

                {isAdmissao && (
                    <AdmissaoFlow
                        data={checklist.data || {}}
                        onUpdate={(flowData) => {
                            const updatedItems = syncItems(checklist.items, flowData, 'admissao');
                            onUpdate({ data: flowData, items: updatedItems });
                        }}
                        user={user}
                    />
                )}

                {isDemissao && (
                    <DemissaoFlow
                        data={checklist.data || {}}
                        onUpdate={(flowData) => {
                            const updatedItems = syncItems(checklist.items, flowData, 'demissao');
                            onUpdate({ data: flowData, items: updatedItems });
                        }}
                        user={user}
                    />
                )}

                <div className="mt-12 pt-8 border-t border-rose-gold/10">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-rose-gold-dark font-serif">
                        <CheckSquare className="w-5 h-5 text-rose-gold" /> Status do Checklist
                    </h2>
                    <Card className="border-rose-gold/20 shadow-soft">
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {(() => {
                                    // Robust sorting based on Template definition
                                    let displayItems = [...checklist.items];

                                    // Filter out old DP items or items explicitly marked to remove
                                    // The user requested "tudo que for do DP... pode remover"
                                    // This handles legacy data where role might still be 'DP' or if it matches the text we just removed
                                    const removedTexts = [
                                        'Calcular Verbas Rescisórias e Homologação',
                                        'Emitir Guias de Recolhimento',
                                        'Realizar Baixa na CTPS',
                                        'Arquivar Documentação de Desligamento'
                                    ];

                                    displayItems = displayItems.filter(item =>
                                        item.role !== 'DP' && !removedTexts.includes(item.text)
                                    );

                                    // Find matching template
                                    // Try matching by ID first (if type matches ID) or Title
                                    const template = templates.find(t =>
                                        t.title === checklist.type ||
                                        t.id === checklist.type ||
                                        checklist.title.includes(t.title)
                                    );

                                    if (template) {
                                        displayItems.sort((a, b) => {
                                            const indexA = template.steps.findIndex(step => step.text === a.text);
                                            const indexB = template.steps.findIndex(step => step.text === b.text);

                                            // If both found, sort by template index
                                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;

                                            // If only A found, A comes first
                                            if (indexA !== -1) return -1;

                                            // If only B found, B comes first
                                            if (indexB !== -1) return 1;

                                            // If neither found, keep original order (or sort by creation)
                                            return 0;
                                        });
                                    }

                                    return displayItems.map(item => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 p-4 bg-card border border-rose-gold/5 rounded-xl hover:border-rose-gold/30 transition-all duration-300 group"
                                        >
                                            <Checkbox
                                                checked={item.isCompleted}
                                                disabled={true} // Automatic based on form
                                                className="h-5 w-5 border-rose-gold/50 data-[state=checked]:bg-rose-gold data-[state=checked]:border-rose-gold"
                                            />
                                            <span className={`flex-1 text-sm font-medium transition-colors ${item.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                {item.text}
                                            </span>
                                            {item.role && (
                                                <Badge variant="secondary" className="bg-rose-gold/10 text-rose-gold-dark border-none font-semibold text-[10px] tracking-wider">
                                                    {item.role}
                                                </Badge>
                                            )}
                                        </div>
                                    ))
                                })()}
                                {checklist.items.length === 0 && (
                                    <p className="text-center text-muted-foreground py-12 italic">
                                        Nenhuma tarefa configurada para este fluxo.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Default View (fallback)
    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {checklist.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {checklist.items.filter(i => i.isCompleted).length} of {checklist.items.length} completed
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <Card className="border-primary/20 shadow-lg shadow-primary/5">
                    <CardContent className="p-6">
                        <div className="flex gap-2 mb-6">
                            <Input
                                type="text"
                                placeholder="Add new task..."
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1"
                            />
                            <Button onClick={addItem}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {checklist.items.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors group"
                                >
                                    <Checkbox
                                        checked={item.isCompleted}
                                        onCheckedChange={(checked: boolean) => onTaskToggle(item.id, checked)}
                                    />
                                    <span className={`flex-1 ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                        {item.text}
                                    </span>
                                    {item.role && (
                                        <span className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground">
                                            {item.role}
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => onTaskDelete(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {checklist.items.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-4">
                                        <CheckSquare className="h-6 w-6" />
                                    </div>
                                    <p>No tasks yet. Add one above!</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
