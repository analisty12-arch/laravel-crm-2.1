import { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    UserMinus,
    Briefcase,
    Monitor,
    FileSpreadsheet,
    Save,
    Calendar,
    AlertCircle,
    Check,
    Loader2,
    Search
} from "lucide-react";
import { useRef } from "react";

// Schemas
const secaoRHSchema = z.object({
    nome_completo: z.string().min(1, "Nome é obrigatório"),
    cpf: z.string().optional(),
    cargo: z.string().optional(),
    departamento: z.string().optional(),
    data_comunicado: z.string().optional(),
    ultimo_dia: z.string().optional(),
    motivo_desligamento: z.string().optional(),
    tipo_aviso: z.string().optional(),
    observacoes_rh: z.string().optional(),
    lista_equipamentos: z.string().optional(),
    solicitar_exame: z.boolean().default(false),
    data_exame: z.string().optional(),
    hora_exame: z.string().optional(),
    local_exame: z.string().optional(),
    email_exame: z.string().email("Email inválido").optional().or(z.literal("")),
    ignorar_envio_email: z.boolean().default(false),
    // Fields moved from DP
    data_homologacao: z.string().optional(),
    status_pagamento: z.enum(["Pendente", "Programado", "Pago"]).optional(),
    carteira_assinada: z.boolean().default(false),
    exame_demissional: z.boolean().default(false), // Confirmação de realização
});

const secaoGestorSchema = z.object({
    equipamentos_devolvidos: z.enum(["Sim", "Nao", "Parcial"]).optional(),
    lista_pendencias: z.string().optional(),
    backup_realizado: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
    projeto_transferido: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
    chave_acesso_entregue: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
    observacoes_gestor: z.string().optional(),
});

const secaoTISchema = z.object({
    conta_ad_bloqueada: z.boolean().default(false),
    email_bloqueado: z.boolean().default(false),
    acesso_vpn_revogado: z.boolean().default(false),
    licencas_removidas: z.boolean().default(false),
    equipamentos_recolhidos: z.boolean().default(false),
    congelar_salesforce: z.boolean().default(false),
    bloquear_sap: z.boolean().default(false),
    observacoes_ti: z.string().optional(),
});

// DP Section Removed - Merged into RH


const fullSchema = secaoRHSchema.merge(secaoGestorSchema).merge(secaoTISchema);
type FormData = z.infer<typeof fullSchema>;

const sections = [
    { id: 1, title: "Dados do Desligamento & DP", icon: UserMinus, role: "RH" },
    { id: 2, title: "Gestão & Equipamentos", icon: Briefcase, role: "Gestor" },
    { id: 3, title: "Bloqueios TI", icon: Monitor, role: "TI" },
];

interface DemissaoFlowProps {
    data: any;
    onUpdate: (data: any) => void;
    isReadOnly?: boolean;
    user?: any;
}

export function DemissaoFlow({
    data,
    onUpdate,
    isReadOnly = false,
    user
}: DemissaoFlowProps) {
    const isFinished = data?.status === 'completed';
    const isAdm = user?.role === 'Adm';

    // If finished, force ReadOnly (unless reopened), but Adm button handles reopening
    const effectiveReadOnly = isReadOnly || isFinished;
    const [currentSection, setCurrentSection] = useState(data?.currentSection || 1);
    const [actionLoading, setActionLoading] = useState(false);
    const [employees, setEmployees] = useState<{ full_name: string; cpf: string }[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            const { data: empData } = await supabase
                .from('employees')
                .select('full_name, cpf')
                .order('full_name');
            if (empData) setEmployees(empData);
        };
        fetchEmployees();
    }, []);

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.cpf.includes(searchQuery)
    );

    const form = useForm<FormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(fullSchema) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaultValues: {
            nome_completo: data?.nome_completo || "",
            cpf: data?.cpf || "",
            conta_ad_bloqueada: data?.conta_ad_bloqueada || false,
            email_bloqueado: data?.email_bloqueado || false,
            acesso_vpn_revogado: data?.acesso_vpn_revogado || false,
            licencas_removidas: data?.licencas_removidas || false,
            equipamentos_recolhidos: data?.equipamentos_recolhidos || false,
            congelar_salesforce: data?.congelar_salesforce || false,
            bloquear_sap: data?.bloquear_sap || false,
            solicitar_exame: data?.solicitar_exame || false,
            data_exame: data?.data_exame || "",
            hora_exame: data?.hora_exame || "",
            local_exame: data?.local_exame || "",
            email_exame: data?.email_exame || "",
            ignorar_envio_email: data?.ignorar_envio_email || false,
            // DP fields in RH
            data_homologacao: data?.data_homologacao || "",
            status_pagamento: data?.status_pagamento || "Pendente",
            carteira_assinada: data?.carteira_assinada || false,
            exame_demissional: data?.exame_demissional || false,
            ...data,
        } as any,
    });

    const handleSectionChange = (sectionId: number) => {
        setCurrentSection(sectionId);
        onUpdate({ ...form.getValues(), currentSection: sectionId });
    };

    const progress = (currentSection / sections.length) * 100;

    // Monitoramento em tempo real para atualização instantânea do checklist
    useEffect(() => {
        const subscription = form.watch((value) => {
            onUpdate({ ...value, currentSection });
        });
        return () => subscription.unsubscribe();
    }, [form, currentSection, onUpdate]);

    const handleInventoryRelease = async () => {
        const nomeAlvo = form.getValues("nome_completo");
        if (!nomeAlvo) return;

        setActionLoading(true);
        try {
            // Busca equipamentos vinculados a este nome
            const { data: assets, error: fetchError } = await supabase
                .from('tech_assets')
                .select('id, asset_tag')
                .eq('assigned_to_name', nomeAlvo);

            if (fetchError) throw fetchError;

            if (assets && assets.length > 0) {
                const { error: updateError } = await supabase
                    .from('tech_assets')
                    .update({
                        status: 'available',
                        assigned_to_name: 'Disponível',
                        notes: `Liberado automaticamente via checklist de demissão em ${new Date().toLocaleDateString()}`
                    })
                    .eq('assigned_to_name', nomeAlvo);

                if (updateError) throw updateError;
                alert(`${assets.length} equipamentos foram liberados no inventário com sucesso!`);
            } else {
                alert("Nenhum equipamento encontrado vinculado a este colaborador no inventário.");
            }
        } catch (err) {
            console.error("Erro ao liberar inventário:", err);
            alert("Erro ao sincronizar com o inventário.");
        } finally {
            setActionLoading(false);
        }
    };

    const validateCurrentSection = (values: FormData) => {
        if (currentSection === 1) { // Gestor (Now First)
            if (!values.equipamentos_devolvidos) return "Status de Devolução de Equipamentos é obrigatório.";
        }
        if (currentSection === 2) { // RH (Now Second)
            if (!values.nome_completo) return "Nome Completo é obrigatório.";
            if (!values.motivo_desligamento) return "Motivo do Desligamento é obrigatório.";

            // Send Email if Exam is requested AND explicitly NOT skipped
            if (values.solicitar_exame && values.email_exame && !values.ignorar_envio_email) {
                // Prepare template params matching the ID you created
                const templateParams = {
                    to_email: values.email_exame,
                    nome_colaborador: values.nome_completo,
                    data_exame: values.data_exame || "A definir",
                    hora_exame: values.hora_exame || "A definir",
                    local_exame: values.local_exame || "A definir",
                    tipo_exame: "Demissional"
                };

                emailjs.send(
                    import.meta.env.VITE_EMAILJS_SERVICE_ID,
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                    templateParams,
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                ).then((response) => {
                    console.log('SUCCESS!', response.status, response.text);
                    alert("✅ E-mail de agendamento enviado com sucesso!");
                }, (err) => {
                    console.error('FAILED...', err);
                    alert("⚠️ Aviso: O agendamento foi salvo, mas houve erro ao enviar o e-mail: " + JSON.stringify(err));
                });
            }
        }
        return null;
    };

    const handleSubmit = async (values: FormData) => {
        const error = validateCurrentSection(values);
        if (error) {
            alert(`Impedimento: ${error}`);
            return;
        }

        if (currentSection === 3) {
            onUpdate({ ...values, currentSection, status: 'completed' });
            alert("Processo de Demissão Finalizado com Sucesso Pelo TI!");
        } else {
            onUpdate({ ...values, currentSection });
            alert("Dados salvos com sucesso!");
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-rose-gold/20 bg-gradient-to-r from-rose-gold/5 to-transparent shadow-soft">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-serif text-rose-gold-dark flex items-center gap-2">
                                <UserMinus className="h-6 w-6 text-rose-gold" />
                                MEDBEAUTY — Checklist de Desligamento
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Encerramento de ciclo e devolução de ativos.
                                <br />
                                <span className="text-xs font-medium mt-1 inline-block">
                                    Fluxo: RH → Gestor → TI → DP
                                </span>
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-sm px-3 py-1 border-rose-gold/30 text-rose-gold-dark bg-rose-gold/5">
                            Seção {currentSection} de {sections.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            {sections.map((section) => (
                                <div
                                    key={section.id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all cursor-pointer ${section.id === currentSection
                                        ? "bg-rose-gold text-white shadow-md"
                                        : "text-muted-foreground hover:bg-rose-gold/10 hover:text-rose-gold-dark"
                                        }`}
                                    onClick={() => handleSectionChange(section.id)}
                                >
                                    <section.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{section.role}</span>
                                </div>
                            ))}
                        </div>
                        <Progress value={progress} className="h-2" indicatorClassName="bg-rose-gold" />
                    </div>
                </CardContent>
            </Card>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {(currentSection === 1 || isFinished) && (
                        <Card className={`border-none shadow-soft overflow-hidden ${isFinished ? 'opacity-80' : ''}`}>
                            <CardHeader className="bg-rose-gold/5">
                                <CardTitle className="text-lg font-medium flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-rose-gold" />
                                    Gestão & Equipamentos (Gestor)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3 text-amber-800 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>O gestor deve validar a entrega física de todos os itens listados no termo de responsabilidade do colaborador.</p>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="equipamentos_devolvidos"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status de Devolução de Ativos</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger disabled={effectiveReadOnly}><SelectValue placeholder="Selecione o motivo" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Sim">Sim, todos os equipamentos devolvidos</SelectItem>
                                                    <SelectItem value="Nao">Nenhum equipamento devolvido ainda</SelectItem>
                                                    <SelectItem value="Parcial">Devolução parcial (ver observações)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="backup_realizado"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Backup Arquivos?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger disabled={effectiveReadOnly}><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim</SelectItem>
                                                        <SelectItem value="Nao">Não</SelectItem>
                                                        <SelectItem value="NaoAplica">N/A</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="projeto_transferido"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Passagem Bastão?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger disabled={effectiveReadOnly}><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim</SelectItem>
                                                        <SelectItem value="Nao">Não</SelectItem>
                                                        <SelectItem value="NaoAplica">N/A</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="chave_acesso_entregue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Chaves/Cartão?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger disabled={effectiveReadOnly}><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim</SelectItem>
                                                        <SelectItem value="Nao">Não</SelectItem>
                                                        <SelectItem value="NaoAplica">N/A</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="lista_pendencias"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pendências de Trabalho</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Liste tarefas não concluídas..." {...field} disabled={effectiveReadOnly} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="observacoes_gestor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Observações do Gestor</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Comentários adicionais..." {...field} disabled={effectiveReadOnly} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {currentSection === 2 && (
                        <Card className="border-none shadow-soft overflow-hidden">
                            <CardHeader className="bg-rose-gold/5">
                                <CardTitle className="text-lg font-medium flex items-center gap-2">
                                    <UserMinus className="h-5 w-5 text-rose-gold" />
                                    Dados do Desligamento (RH)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="nome_completo"
                                        render={({ field }) => (
                                            <FormItem className="relative" ref={dropdownRef}>
                                                <FormLabel>Selecionar Colaborador</FormLabel>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Digite o nome ou CPF..."
                                                        className="pl-9"
                                                        value={isSearchOpen ? searchQuery : field.value}
                                                        onChange={(e) => {
                                                            setSearchQuery(e.target.value);
                                                            setIsSearchOpen(true);
                                                        }}
                                                        onFocus={() => {
                                                            setIsSearchOpen(true);
                                                            setSearchQuery("");
                                                        }}
                                                        disabled={effectiveReadOnly}
                                                    />
                                                </div>

                                                {isSearchOpen && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                                        {filteredEmployees.length > 0 ? (
                                                            filteredEmployees.map(emp => (
                                                                <div
                                                                    key={emp.cpf + emp.full_name}
                                                                    className="px-4 py-3 hover:bg-rose-gold/5 cursor-pointer border-b last:border-0 flex flex-col items-start transition-colors"
                                                                    onClick={() => {
                                                                        field.onChange(emp.full_name);
                                                                        form.setValue("cpf", emp.cpf);
                                                                        setIsSearchOpen(false);
                                                                        setSearchQuery("");
                                                                    }}
                                                                >
                                                                    <span className="font-medium text-slate-800">{emp.full_name}</span>
                                                                    <span className="text-[10px] text-muted-foreground">CPF: {emp.cpf}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                                Nenhum colaborador encontrado.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cpf"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CPF Confirmado</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="CPF aparecerá aqui" {...field} disabled={true} className="bg-slate-50 font-mono text-rose-gold-dark font-bold" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="data_comunicado"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Data do Comunicado</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input type="date" className="pl-9" {...field} disabled={effectiveReadOnly} />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="ultimo_dia"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Último Dia de Trabalho</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input type="date" className="pl-9" {...field} disabled={effectiveReadOnly} />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="motivo_desligamento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Motivo do Desligamento</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger disabled={effectiveReadOnly}>
                                                        <SelectValue placeholder="Selecione o motivo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="pedido_demissao">Pedido de Demissão</SelectItem>
                                                    <SelectItem value="sem_justa_causa">Dispensa Sem Justa Causa</SelectItem>
                                                    <SelectItem value="com_justa_causa">Dispensa Com Justa Causa</SelectItem>
                                                    <SelectItem value="termino_contrato">Término de Contrato</SelectItem>
                                                    <SelectItem value="acordo">Acordo entre as Partes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="solicitar_exame"
                                    render={({ field }) => (
                                        <FormItem id="field-solicitar-exame" className="flex items-center gap-3 space-y-0 border border-rose-gold/20 bg-rose-gold/5 p-4 rounded-lg">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={effectiveReadOnly} />
                                            </FormControl>
                                            <div className="leading-none">
                                                <FormLabel className="font-semibold text-rose-gold-dark">
                                                    Solicitar Exame Demissional
                                                </FormLabel>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    Confirmo que a solicitação do exame foi encaminhada à medicina do trabalho.
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                {form.watch("solicitar_exame") && (
                                    <div className="p-4 bg-rose-gold/5 rounded-lg border border-rose-gold/20 animate-in fade-in slide-in-from-top-2">
                                        <h4 className="text-sm font-semibold text-rose-gold-dark mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Detalhes do Agendamento
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="data_exame"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Data</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} disabled={effectiveReadOnly} className="bg-white" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="hora_exame"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Hora</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} disabled={effectiveReadOnly} className="bg-white" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="local_exame"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Local / Clínica</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: Clínica MedLabor" {...field} disabled={effectiveReadOnly} className="bg-white" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="email_exame"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-3">
                                                        <FormLabel className="text-xs">E-mail para Notificação</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-0" />
                                                                <Input type="email" placeholder="email@exemplo.com" {...field} disabled={effectiveReadOnly} className="bg-white" />
                                                            </div>
                                                        </FormControl>
                                                        <p className="text-[10px] text-muted-foreground">O colaborador receberá os detalhes neste endereço.</p>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="ignorar_envio_email"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-3 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white/50">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                disabled={effectiveReadOnly}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>
                                                                Email já enviado externamente (Não enviar novamente)
                                                            </FormLabel>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                Marque esta opção se você já comunicou o colaborador por outro meio e quer apenas salvar os dados no sistema.
                                                            </p>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                                <FormField
                                    control={form.control}
                                    name="observacoes_rh"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Observações Adicionais</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Notas relevantes..." {...field} disabled={effectiveReadOnly} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {currentSection === 3 && (
                        <Card className="border-none shadow-soft overflow-hidden">
                            <CardHeader className="bg-rose-gold/5">
                                <CardTitle className="text-lg font-medium flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-rose-gold" />
                                    Procedimentos Técnicos (TI)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                                    <h4 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                                        <Monitor className="h-4 w-4" /> Gestão de Ativos (Inventário)
                                    </h4>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Libere os equipamentos vinculados a este colaborador para que retornem ao status "Disponível".
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleInventoryRelease}
                                            disabled={actionLoading}
                                            className="bg-white border-rose-gold/30 text-rose-gold-dark hover:bg-rose-gold/5"
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            Buscar e Liberar Ativos do Usuário
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">
                                        * Busca equipamentos onde "Responsável" é igual a: <strong>{form.getValues("nome_completo")}</strong>
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="conta_ad_bloqueada"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0 border border-rose-gold/10 p-4 rounded-lg bg-white shadow-sm">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={effectiveReadOnly} />
                                                </FormControl>
                                                <FormLabel className="font-medium">Bloquear Conta AD / Servidor</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email_bloqueado"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0 border border-rose-gold/10 p-4 rounded-lg bg-white shadow-sm">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={effectiveReadOnly} />
                                                </FormControl>
                                                <FormLabel className="font-medium">Remover/Bloquear Email Corporativo</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="acesso_vpn_revogado"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0 border border-rose-gold/10 p-4 rounded-lg bg-white shadow-sm">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={effectiveReadOnly} />
                                                </FormControl>
                                                <FormLabel className="font-medium">Revogar Acessos Externos (VPN)</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="equipamentos_recolhidos"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0 border border-rose-gold/10 p-4 rounded-lg bg-white shadow-sm">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={effectiveReadOnly} />
                                                </FormControl>
                                                <FormLabel className="font-medium">Confirmar Devolução de Hardware</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="congelar_salesforce"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0 border border-rose-gold/10 p-4 rounded-lg bg-white shadow-sm">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={effectiveReadOnly} />
                                                </FormControl>
                                                <FormLabel className="font-medium">Congelar conta Salesforce</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bloquear_sap"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0 border border-rose-gold/10 p-4 rounded-lg bg-white shadow-sm">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={effectiveReadOnly} />
                                                </FormControl>
                                                <FormLabel className="font-medium">Bloquear conta SAP B1</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="observacoes_ti"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notas de TI</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Números de série, pendências..." {...field} disabled={effectiveReadOnly} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {isFinished && isAdm && (
                        <div className="flex justify-center pt-8 pb-4 border-t border-dashed border-rose-gold/30 mt-8">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-amber-500 text-amber-700 hover:bg-amber-50 gap-2"
                                onClick={() => {
                                    if (confirm("Tem certeza que deseja reabrir este processo?")) {
                                        onUpdate({ ...data, status: 'active', currentSection: 3 }); // Reopen at TI or stay where it was? sticking to 3 for now.
                                        alert("Processo reaberto para edição.");
                                    }
                                }}
                            >
                                <AlertCircle className="w-4 h-4" />
                                Reabrir Processo (Admin)
                            </Button>
                        </div>
                    )}

                    {!effectiveReadOnly && !isFinished && (
                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white">
                                <Save className="w-4 h-4" />
                                Salvar Alterações
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
}
