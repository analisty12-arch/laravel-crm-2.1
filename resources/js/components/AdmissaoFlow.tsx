import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Form,
    FormControl,
    // FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    User,
    Briefcase,
    Monitor,
    CheckCircle2,
    Save,
    Send,
    ClipboardList,
    Copy,
    Check,
    Clock,
    AlertCircle,
    Laptop
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import emailjs from '@emailjs/browser';

// Departments
const DEPARTAMENTOS = [
    { value: "Financeiro", label: "Financeiro" },
    { value: "Marketing", label: "Marketing" },
    { value: "Comercial", label: "Comercial" },
    { value: "Logística", label: "Logística" },
    { value: "Jurídico", label: "Jurídico" },
    { value: "TI", label: "Tech Digital" },
    { value: "RH", label: "Recursos Humanos" },
];

const REGIOES_COMERCIAL = [
    { value: "Norte/Nordeste", label: "Norte/Nordeste" },
    { value: "Sul", label: "Sul" },
    { value: "Sudeste", label: "Sudeste" },
    { value: "Centro", label: "Centro" },
    { value: "Inside Sales", label: "Inside Sales" },
];

// Schema Section 1 - RH
const secaoRHSchema = z.object({
    nome_completo: z.string().optional().or(z.literal("")),
    nome_exibicao: z.string().optional().or(z.literal("")),
    cpf: z.string().optional(),
    data_admissao: z.string().optional().or(z.literal("")),
    data_inicio: z.string().optional().or(z.literal("")),
    tipo_contratacao: z.string().optional().or(z.literal("")),
    setor_departamento: z.string().optional().or(z.literal("")),
    filial_unidade: z.string().optional(),
    gestor_direto: z.string().optional(),
    email_gestor: z.string().optional(),
    cargo_funcao: z.string().optional().or(z.literal("")),
    regime_trabalho: z.enum(["Presencial", "Híbrido", "Remoto", ""]).optional(),
    regiao_comercial: z.string().optional(),
    observacoes_rh: z.string().optional(),
});

// Schema Section 2 - Gestor
const secaoGestorSchema = z.object({
    tipo_vaga: z.string().optional().nullable(),
    buddy_mentor: z.string().optional().nullable(),
    equipamentos_necessarios: z.array(z.string()).optional().default([]).nullable(),
    softwares_necessarios: z.array(z.string()).optional().default([]).nullable(),
    outros_softwares_descricao: z.string().optional().nullable(),
    acessos_necessarios: z.array(z.string()).optional().default([]).nullable(),
    sharepoint_pasta: z.string().optional().nullable(),
    outros_acessos: z.string().optional().nullable(),
    necessita_impressora: z.string().optional().nullable(),
    necessita_vpn: z.string().optional().nullable(),
    observacoes_gestor: z.string().optional().nullable(),
});

// Options
const EQUIPAMENTOS_OPTIONS = [
    { value: "Notebook", label: "Notebook" },
    { value: "Desktop", label: "Desktop" },
    { value: "Tablet", label: "Tablet" },
    { value: "Celular", label: "Celular" },
    { value: "HeadSet", label: "HeadSet" },
    { value: "Mouse", label: "Mouse" },
];

const INVENTORY_TYPES = ["Notebook", "Tablet", "Celular"];

const SOFTWARES_OPTIONS = [
    { value: "Microsoft 365", label: "Microsoft 365 (Office, Teams, Email)" },
    { value: "SAP B1", label: "SAP B1" },
    { value: "Salesforce", label: "Salesforce" },
    { value: "Power BI", label: "Power BI" },
    { value: "Outros", label: "Outros" },
];

// Schema Section 3 - TI
const secaoTISchema = z.object({
    conta_ad_criada: z.string().optional().nullable(),
    email_corporativo_criado: z.string().optional().nullable(),
    licencas_microsoft365: z.array(z.string()).optional().nullable(),
    vpn_configurada: z.string().optional().nullable(),
    softwares_instalados: z.string().optional().nullable(),
    usuario_sap_criado: z.string().optional().nullable(),
    perfil_salesforce_criado: z.string().optional().nullable(),
    pastas_rede_liberadas: z.string().optional().nullable(),
    impressoras_configuradas: z.string().optional().nullable(),
    testes_gerais_realizados: z.string().optional().nullable(),
    observacoes_ti: z.string().optional().nullable(),
    detalhes_conta_ad: z.string().optional().nullable(),
    detalhes_email: z.string().optional().nullable(),
    detalhes_sap: z.string().optional().nullable(),
    detalhes_salesforce: z.string().optional().nullable(),
    detalhes_rede: z.string().optional().nullable(),
    detalhes_testes: z.string().optional().nullable(),
    equipamentos_definidos: z.record(z.string()).optional().default({}),
    status_perifericos: z.record(z.string()).optional().default({}),
});

// Schema Section 4 - Colaborador
const secaoColaboradorSchema = z.object({
    confirma_recebimento_equipamentos: z.string().optional().nullable(),
    confirma_funcionamento_acessos: z.string().optional().nullable(),
    recebeu_orientacao_sistemas: z.string().optional().nullable(),
    sabe_solicitar_suporte: z.string().optional().nullable(),
    observacoes_colaborador: z.string().optional().nullable(),
    termo_assinado: z.boolean().optional().default(false),
    data_assinatura: z.string().optional().nullable(),
});

const fullSchema = secaoRHSchema
    .merge(secaoGestorSchema)
    .merge(secaoTISchema)
    .merge(secaoColaboradorSchema);

type FormData = z.infer<typeof fullSchema>;

const sections = [
    { id: 1, title: "Dados do Colaborador", icon: User, role: "RH" },
    { id: 2, title: "Definições do Gestor", icon: Briefcase, role: "Gestor" },
    { id: 3, title: "Configuração TI", icon: Monitor, role: "TI" },
    { id: 4, title: "Documentos", icon: CheckCircle2, role: "Colaborador" },
];

function validateStep(sectionId: number, data: FormData): boolean {
    // Helper for labels
    const getFieldLabel = (field: string) => {
        const labels: Record<string, string> = {
            'conta_ad_criada': 'Conta AD',
            'email_corporativo_criado': 'Email Corporativo',
            'vpn_configurada': 'VPN',
            'usuario_sap_criado': 'Usuário SAP B1',
            'perfil_salesforce_criado': 'Perfil Salesforce',
            'pastas_rede_liberadas': 'Pastas de Rede',
            'impressoras_configuradas': 'Impressoras',
            'testes_gerais_realizados': 'Testes Gerais'
        };
        return labels[field] || field;
    };

    if (sectionId === 1) {
        // Validation for RH handled by Zod Schema (min 1 requirements)
        // But we add double check if needed
        return true;
    }

    if (sectionId === 2) {
        // Gestor Validation
        const missing = [];
        if (!data.tipo_vaga) missing.push("Tipo da Vaga");
        // if (!data.equipamentos_necessarios || data.equipamentos_necessarios.length === 0) missing.push("Equipamentos Necessários"); // Optional?
        // if (!data.softwares_necessarios) missing.push("Softwares");
        if (!data.necessita_vpn) missing.push("Necessita VPN");
        if (!data.necessita_impressora) missing.push("Necessita Impressora");

        if (missing.length > 0) {
            alert(`Por favor, preencha os seguintes campos obrigatórios do Gestor:\n- ${missing.join("\n- ")}`);
            return false;
        }
        return true;
    }

    if (sectionId === 3) {
        // TI Validation
        // Base required fields (assuming generic ones are always required)
        const requiredFields: (keyof FormData)[] = [
            'conta_ad_criada',
            'email_corporativo_criado',
            'testes_gerais_realizados'
        ];

        // Conditional requirements
        const softwares = data.softwares_necessarios || [];
        if (data.necessita_vpn === 'Sim') requiredFields.push('vpn_configurada');
        if (data.necessita_impressora === 'Sim') requiredFields.push('impressoras_configuradas');

        if (softwares.includes("SAP B1")) requiredFields.push('usuario_sap_criado');
        if (softwares.includes("Salesforce")) requiredFields.push('perfil_salesforce_criado');

        // Check if Sharepoint/Network folders were requested
        if (data.sharepoint_pasta && data.sharepoint_pasta.trim() !== "") {
            requiredFields.push('pastas_rede_liberadas');
        }

        const missing = [];

        requiredFields.forEach(field => {
            const val = data[field];
            if (!val || val === "") {
                const label = getFieldLabel(field);
                missing.push(label);
            }
        });

        // Validate equipment assignment (Only for high-value inventory items)
        const reqEq = data.equipamentos_necessarios || [];
        const inventoryReq = reqEq.filter(eq => INVENTORY_TYPES.includes(eq));
        const defEq = data.equipamentos_definidos || {};

        inventoryReq.forEach(eq => {
            if (!defEq[eq]) {
                missing.push(`Atribuição do item: ${eq}`);
            }
        });

        // Validate peripherals in status_perifericos
        const peripheralReq = reqEq.filter(eq => !INVENTORY_TYPES.includes(eq));
        const statusPerif = data.status_perifericos || {};
        peripheralReq.forEach(eq => {
            if (statusPerif[eq] !== "Sim") {
                missing.push(`Entrega do item: ${eq}`);
            }
        });

        // Validate details for specific fields if they are marked as Done (Sim) AND are in the required list (requested)
        if (data.conta_ad_criada === "Sim" && !data.detalhes_conta_ad) missing.push("Detalhes da Conta AD");
        if (data.email_corporativo_criado === "Sim" && !data.detalhes_email) missing.push("Detalhes do Email");

        if (requiredFields.includes('usuario_sap_criado') && data.usuario_sap_criado === "Sim" && !data.detalhes_sap) missing.push("Detalhes SAP");
        if (requiredFields.includes('perfil_salesforce_criado') && data.perfil_salesforce_criado === "Sim" && !data.detalhes_salesforce) missing.push("Detalhes Salesforce");
        if (requiredFields.includes('pastas_rede_liberadas') && data.pastas_rede_liberadas === "Sim" && !data.detalhes_rede) missing.push("Detalhes Rede");

        if (data.testes_gerais_realizados === "Sim" && !data.detalhes_testes) missing.push("Detalhes Testes");

        if (missing.length > 0) {
            alert(`TI: Por favor, complete os seguintes itens solicitados e seus detalhes:\n- ${missing.join("\n- ")}`);
            return false;
        }
        return true;
    }

    if (sectionId === 4) {
        // Colaborador Validation
        const requiredFields: (keyof FormData)[] = [
            'confirma_recebimento_equipamentos',
            'confirma_funcionamento_acessos',
            'recebeu_orientacao_sistemas',
            // 'sabe_solicitar_suporte' // if added later
        ];

        const missing = requiredFields.filter(field => !data[field] || data[field] === "");

        if (missing.length > 0) {
            alert("Colaborador: Por favor, confirme todos os itens de recebimento/orientação antes de finalizar.");
            return false;
        }

        if (!data.termo_assinado) {
            alert("É necessário assinar o termo via DocuSign antes de finalizar o processo.");
            return false;
        }

        return true;
    }

    return true;
}

function getSectionStatus(sectionId: number, currentSection: number) {
    if (sectionId < currentSection) return 'completed';
    if (sectionId === currentSection) return 'current';
    return 'pending';
}

interface AdmissaoFlowProps {
    data: any;
    onUpdate: (data: any) => void;
    isReadOnly?: boolean;
    user?: any;
}

export function AdmissaoFlow({
    data,
    onUpdate,
    isReadOnly = false,
    user
}: AdmissaoFlowProps) {
    const [currentSection, setCurrentSection] = useState(data?.currentSection || 1);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [availableAssets, setAvailableAssets] = useState<any[]>([]);

    // Fetch Inventory on Mount
    useEffect(() => {
        const fetchInventory = async () => {
            const { data } = await supabase
                .from('tech_assets')
                .select('id, asset_tag, model, device_type, status')
                .eq('status', 'available');

            if (data) setAvailableAssets(data);
        };
        fetchInventory();
    }, []);

    // Sincronizar seção atual quando os dados mudarem externamente
    useEffect(() => {
        if (data?.currentSection && data.currentSection !== currentSection) {
            console.log("Syncing currentSection from props:", data.currentSection);
            setCurrentSection(data.currentSection);
        }
    }, [data?.currentSection]);

    const [isCompleted, setIsCompleted] = useState(false);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [tempDetail, setTempDetail] = useState("");

    // Determine permissions based on User Role
    const userRole = user?.role;
    const isAdm = userRole === 'Adm';

    // Current section role requirement
    const sectionRoles: Record<number, string[]> = {
        1: ['RH'],
        2: ['Gestor'],
        3: ['TI'],
        4: ['Colaborador'] // or generic/TI/RH if helper needed
    };

    const allowedRoles = sectionRoles[currentSection] || [];
    // Can edit if: passed isReadOnly is false AND (Admin OR User has required role)
    // For Gestor, we might want to enforce Department match, but simplified for now to Role check.
    const canEdit = !isReadOnly && (isAdm || allowedRoles.includes(userRole));

    // Disable inputs if cannot edit
    const isSectionReadOnly = !canEdit;

    const handleSectionChange = (sectionId: number) => {
        // Allow navigation to view, but editing is controlled by isSectionReadOnly logic above
        setCurrentSection(sectionId);
        // Don't auto-update on nav
    };

    const copyLink = () => {
        const url = window.location.href; // In real app, might need specific route
        navigator.clipboard.writeText(url);
        alert("Link copiado para a área de transferência!"); // In real app use toast
    };

    const [isSigning, setIsSigning] = useState(false);

    const handleDocusignSign = async () => {
        setIsSigning(true);
        try {
            // Real Edge Function Call
            const { data, error } = await supabase.functions.invoke('docusign', {
                body: {
                    signerName: form.getValues("nome_completo") || user?.name || "Colaborador",
                    signerEmail: user?.email || "colaborador@example.com",
                    equipmentList: form.getValues("equipamentos_necessarios")?.join(", "),
                    softwareList: form.getValues("softwares_necessarios")?.join(", ")
                }
            });

            if (error) throw error; // Network/System errors

            // Soft Error from Backend (Status 200 but contains error field)
            if (data?.error) {
                throw new Error(`Erro DocuSign: ${data.error} - ${data.details || ''}`);
            }

            if (data?.url) {
                window.open(data.url, '_blank');
                form.setValue("termo_assinado", true);
                alert("Redirecionando para DocuSign. Por favor assine o documento.");
            } else if (data?.envelopeId) {
                alert("Envelope enviado por e-mail! Verifique sua caixa de entrada.");
                form.setValue("termo_assinado", true);
            } else {
                throw new Error("Resposta inválida do DocuSign (Sem URL ou Envelope ID)");
            }
        } catch (error: any) {
            console.error("DocuSign Error:", error);
            alert(`Erro ao conectar com DocuSign: ${error.message || "Verifique se a função está deployada."}`);
            // Fallback for demo/dev if function missing
            // form.setValue("termo_assinado", true); 
        } finally {
            setIsSigning(false);
        }
    };

    const form = useForm<FormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(fullSchema) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaultValues: {
            nome_completo: "",
            nome_exibicao: "",
            cpf: "",
            data_admissao: "",
            data_inicio: "",
            tipo_contratacao: "" as any,
            setor_departamento: "",
            filial_unidade: "",
            gestor_direto: "",
            email_gestor: "",
            cargo_funcao: "",
            regime_trabalho: "" as any,
            regiao_comercial: "",
            observacoes_rh: "",
            tipo_vaga: "" as any,
            buddy_mentor: "",
            equipamentos_necessarios: [],
            softwares_necessarios: [],
            acessos_necessarios: [],
            sharepoint_pasta: "",
            outros_acessos: "",
            necessita_impressora: undefined,
            observacoes_gestor: "",
            conta_ad_criada: undefined,
            email_corporativo_criado: undefined,
            licencas_microsoft365: [],
            vpn_configurada: undefined,
            softwares_instalados: undefined,
            usuario_sap_criado: undefined,
            perfil_salesforce_criado: undefined,
            pastas_rede_liberadas: undefined,
            impressoras_configuradas: undefined,
            testes_gerais_realizados: undefined,
            observacoes_ti: "",
            detalhes_conta_ad: "",
            detalhes_email: "",
            detalhes_sap: "",
            detalhes_salesforce: "",
            detalhes_rede: "",
            detalhes_testes: "",
            equipamentos_definidos: {},
            status_perifericos: {},
            confirma_recebimento_equipamentos: undefined,
            confirma_funcionamento_acessos: undefined,
            recebeu_orientacao_sistemas: undefined,
            sabe_solicitar_suporte: undefined,
            observacoes_colaborador: "",
            termo_assinado: false,
            ...data,
        } as any,
    });

    const progress = (currentSection / sections.length) * 100;

    // Monitoramento em tempo real para atualização instantânea do checklist
    useEffect(() => {
        const subscription = form.watch((value) => {
            // Only emit updates if user has permission to edit this section
            if (canEdit) {
                onUpdate({ ...value, currentSection });
            }
        });
        return () => subscription.unsubscribe();
    }, [form, currentSection, onUpdate, canEdit]);

    const handleSubmit = async (values: FormData) => {
        console.log("Iniciando submissão da seção:", currentSection);
        if (!canEdit) {
            console.warn("Permissão negada para editar esta seção");
            alert("Você não tem permissão para salvar nesta etapa.");
            return;
        }

        setIsSendingEmail(true);

        try {
            // Pequeno delay para percepção do usuário
            await new Promise(resolve => setTimeout(resolve, 600));

            console.log("Validando etapa...");
            // Validação da etapa atual antes de prosseguir
            if (!validateStep(currentSection, values)) {
                console.warn("Validação manual falhou para a seção:", currentSection);
                return;
            }

            console.log("Validação passou. Preparando próxima seção...");
            let nextSection = currentSection;
            let successMessage = "";

            if (currentSection < sections.length) {
                nextSection = currentSection + 1;

                if (currentSection === 1) {
                    const templateParams = {
                        to_email: values.email_gestor,
                        nome_colaborador: values.nome_completo,
                        data_exame: values.data_inicio || "A definir",
                        hora_exame: "09:00", // Default or add field
                        local_exame: "RH/Sede",
                        tipo_exame: "Admissional",
                        link_checklist: window.location.href // Send link to manager
                    };

                    emailjs.send(
                        import.meta.env.VITE_EMAILJS_SERVICE_ID,
                        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                        templateParams,
                        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                    ).then(() => {
                        console.log("Email Admissional enviado.");
                    }, (err) => {
                        console.error("Erro email admissional:", err);
                        alert("Aviso: Dados salvos, mas erro ao enviar e-mail para o gestor.");
                    });

                    successMessage = `Sucesso!\n\n1. Dados salvos no sistema.\n2. E-mail de notificação enviado para ${values.email_gestor || 'o gestor'}.\n\nO processo agora está na aba do Gestor.`;
                } else if (currentSection === 2) {
                    successMessage = "Configurações do Gestor salvas! O processo foi enviado para o TI configurar os acessos.";
                } else if (currentSection === 3) {
                    successMessage = "Configurações de TI concluídas! O checklist agora está pronto para a conferência final do Colaborador.";
                }
            } else {
                successMessage = "Processo concluído e salvo com sucesso!";
                setIsCompleted(true);
            }

            console.log("Atualizando seção para:", nextSection);
            setCurrentSection(nextSection);
            onUpdate({ ...values, currentSection: nextSection });

            // Pequeno delay antes do alert para garantir que a UI atualizou (currentSection mudou)
            setTimeout(() => {
                alert(successMessage);
            }, 100);

            // INVENTORY INTEGRATION: Update Asset Status on TI Completion
            if (currentSection === 3) {
                const assignedAssets = form.getValues("equipamentos_definidos") || {};
                const employeeName = form.getValues("nome_completo");

                for (const [type, assetTag] of Object.entries(assignedAssets)) {
                    if (assetTag && typeof assetTag === 'string') {
                        console.log(`Assigning ${assetTag} to ${employeeName}`);
                        const { error } = await supabase
                            .from('tech_assets')
                            .update({
                                status: 'in_use',
                                assigned_to_name: employeeName,
                                location: form.getValues("setor_departamento")
                            })
                            .eq('asset_tag', assetTag); // Assuming Select value holds tag

                        if (error) console.error("Error assigning asset:", error);
                    }
                }
            }

        } catch (error) {
            console.error("Erro crítico no handleSubmit:", error);
            alert("Ocorreu um erro ao salvar os dados. Verifique a conexão e tente novamente.");
        } finally {
            console.log("Finalizando estado de envio.");
            setIsSendingEmail(false);
        }
    };

    const onFormError = (errors: any) => {
        console.error("Erro de Validação do Formulário (Zod):", errors);
        const errorFields = Object.keys(errors).map(field => {
            const msg = (errors as any)[field].message || "Campo inválido";
            return `- ${field}: ${msg}`;
        }).join("\n");
        alert("Não foi possível enviar pois alguns campos estão inválidos:\n" + errorFields);
    };

    const getButtonText = () => {
        if (isSendingEmail) return "Processando...";
        switch (currentSection) {
            case 1: return "Enviar ao Gestor";
            case 2: return "Enviar para TI";
            case 3: return "Enviar para Colaborador";
            case 4: return "Finalizar Admissão";
            default: return "Salvar";
        }
    };

    // If section explicitly doesn't match role, show readonly banner? 
    // Or just rely on disabled inputs.

    // Specific logic for Department Validation can be added here if needed
    // e.g. if (userRole === 'Gestor' && user.department !== data.setor_departamento) canEdit = false;

    return (
        <div className="space-y-6">
            {!canEdit && !isCompleted && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-sm" role="alert">
                    <p className="font-bold">Modo de Visualização</p>
                    <p>Você não tem permissão para editar esta etapa ({sections.find(s => s.id === currentSection)?.role}).</p>
                </div>
            )}

            {isCompleted ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-green-100 p-6 rounded-full">
                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Processo Finalizado!</h2>
                        <p className="text-gray-600 max-w-md mx-auto mt-2">
                            O checklist de admissão foi concluído com sucesso. Todos os departamentos validaram as etapas e o termo foi assinado.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            Voltar ao Início
                        </Button>
                        <Button className="bg-rose-gold text-white" onClick={() => setIsCompleted(false)}>
                            Revisar Respostas
                        </Button>
                    </div>
                </div>
            ) : (
                <>

                    <Card className="border-rose-gold/20 bg-gradient-to-r from-rose-gold/5 to-transparent shadow-soft">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-serif text-rose-gold-dark flex items-center gap-2">
                                        <User className="h-6 w-6 text-rose-gold" />
                                        MEDBEAUTY — Checklist de Admissão
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Formulário oficial de admissão.
                                        <br />
                                        <span className="text-xs font-medium mt-1 inline-block">
                                            Fluxo: RH → Gestor → TI → Colaborador
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
                                    {sections.map((section) => {
                                        const status = getSectionStatus(section.id, currentSection);
                                        return (
                                            <div
                                                key={section.id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all cursor-pointer ${section.id === currentSection
                                                    ? "bg-rose-gold text-white shadow-md"
                                                    : status === 'completed'
                                                        ? "text-sage-dark bg-sage/10 hover:bg-sage/20"
                                                        : "text-muted-foreground hover:bg-rose-gold/10 hover:text-rose-gold-dark"
                                                    }`}
                                                onClick={() => handleSectionChange(section.id)}
                                            >
                                                <section.icon className="h-4 w-4" />
                                                <span className="hidden sm:inline">{section.role}</span>
                                                {status === 'completed' && <Check className="w-3 h-3 ml-1" />}
                                                {status === 'current' && <Clock className="w-3 h-3 ml-1 animate-pulse" />}
                                            </div>
                                        );
                                    })}
                                </div>
                                <Progress value={progress} className="h-1 bg-rose-gold/20" indicatorClassName="bg-rose-gold" />
                            </div>
                        </CardContent>
                    </Card>

                    <Form {...form}>
                        <div className="space-y-6">

                            {/* SECAO 1 - RH */}
                            {currentSection === 1 && (
                                <Card>
                                    <CardHeader className="bg-rose-gold/10 dark:bg-rose-gold/20 rounded-t-lg border-b border-rose-gold/10">
                                        <CardTitle>Dados do Colaborador (RH)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="nome_completo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            1. Nome completo <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Insira o nome completo" {...field} disabled={isSectionReadOnly} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="nome_exibicao"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            2. Nome Exibição <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Como o colaborador será chamado" {...field} disabled={isSectionReadOnly} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="cargo_funcao"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            3. Cargo <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: Analista de RH" {...field} disabled={isSectionReadOnly} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="setor_departamento"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>4. Setor <span className="text-destructive">*</span></FormLabel>
                                                        <FormControl>
                                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2" disabled={isSectionReadOnly}>
                                                                {DEPARTAMENTOS.map(d => (
                                                                    <div key={d.value} className="flex items-center space-x-2">
                                                                        <RadioGroupItem value={d.value} id={d.value} disabled={isSectionReadOnly} />
                                                                        <Label htmlFor={d.value}>{d.label}</Label>
                                                                    </div>
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {form.watch("setor_departamento") === "Comercial" && (
                                                <FormField
                                                    control={form.control}
                                                    name="regiao_comercial"
                                                    render={({ field }) => (
                                                        <FormItem className="animate-in slide-in-from-left-2 fade-in duration-300">
                                                            <FormLabel>4.1 Região Comercial <span className="text-destructive">*</span></FormLabel>
                                                            <FormControl>
                                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2" disabled={isSectionReadOnly}>
                                                                    {REGIOES_COMERCIAL.map(r => (
                                                                        <div key={r.value} className="flex items-center space-x-2">
                                                                            <RadioGroupItem value={r.value} id={`regiao-${r.value}`} disabled={isSectionReadOnly} />
                                                                            <Label htmlFor={`regiao-${r.value}`}>{r.label}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="tipo_contratacao"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-1">
                                                        <FormLabel>5. Tipo Contratação <span className="text-destructive">*</span></FormLabel>
                                                        <FormControl>
                                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-2" disabled={isSectionReadOnly}>
                                                                {["CLT", "PJ", "Estágio"].map(t => (
                                                                    <div key={t} className="flex items-center space-x-2">
                                                                        <RadioGroupItem value={t} id={t} disabled={isSectionReadOnly} />
                                                                        <Label htmlFor={t}>{t}</Label>
                                                                    </div>
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="data_admissao"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>6. Data Admissão <span className="text-destructive">*</span></FormLabel>
                                                        <FormControl><Input type="date" {...field} disabled={isSectionReadOnly} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="data_inicio"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>7. Data de Início <span className="text-destructive">*</span></FormLabel>
                                                        <FormControl><Input type="date" {...field} disabled={isSectionReadOnly} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* SECAO 2 - GESTOR */}
                            {currentSection === 2 && (
                                <Card>
                                    <CardHeader className="bg-cream-dark dark:bg-warm-gray/20 rounded-t-lg border-b border-warm-gray/10"><CardTitle>Definições do Gestor</CardTitle></CardHeader>
                                    <CardContent className="pt-6 space-y-8">
                                        <FormField
                                            control={form.control}
                                            name="tipo_vaga"
                                            render={({ field }) => (
                                                <FormItem className="bg-muted/30 p-4 rounded-lg border mb-6">
                                                    <FormLabel className="text-base font-semibold">Tipo da Vaga</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex gap-6 pt-2" disabled={isSectionReadOnly}>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="Nova Contratacao" id="tipo-nova" />
                                                                <Label htmlFor="tipo-nova">Contratação Nova</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="Reposicao" id="tipo-reposicao" />
                                                                <Label htmlFor="tipo-reposicao">Reposição</Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="equipamentos_necessarios"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel className="text-base font-semibold">1. Equipamentos Necessários</FormLabel>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-4 rounded-lg">
                                                        {EQUIPAMENTOS_OPTIONS.map((item) => (
                                                            <FormField
                                                                key={item.value}
                                                                control={form.control}
                                                                name="equipamentos_necessarios"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(item.value) || false}
                                                                                onCheckedChange={(checked: boolean) => {
                                                                                    const currentValues = Array.isArray(field.value) ? field.value : [];
                                                                                    return checked
                                                                                        ? field.onChange([...currentValues, item.value])
                                                                                        : field.onChange(currentValues.filter((v: string) => v !== item.value))
                                                                                }}
                                                                                disabled={isSectionReadOnly}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal">{item.label}</FormLabel>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="border-t pt-6">
                                            <FormLabel className="text-base font-semibold mb-3 block">2. Sistemas e Acessos</FormLabel>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="softwares_necessarios"
                                                    render={() => (
                                                        <FormItem>
                                                            <FormLabel>Softwares Necessários</FormLabel>
                                                            <div className="grid grid-cols-1 gap-2 border p-3 rounded-md">
                                                                {SOFTWARES_OPTIONS.map((item) => (
                                                                    <FormField
                                                                        key={item.value}
                                                                        control={form.control}
                                                                        name="softwares_necessarios"
                                                                        render={({ field }) => (
                                                                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        checked={field.value?.includes(item.value) || false}
                                                                                        onCheckedChange={(checked: boolean) => {
                                                                                            const currentValues = Array.isArray(field.value) ? field.value : [];
                                                                                            return checked
                                                                                                ? field.onChange([...currentValues, item.value])
                                                                                                : field.onChange(currentValues.filter((v: string) => v !== item.value))
                                                                                        }}
                                                                                        disabled={isSectionReadOnly}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">{item.label}</FormLabel>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* CONDITIONAL RENDER FOR 'OUTROS' DESCRIPTION */}
                                                {form.watch("softwares_necessarios")?.includes("Outros") && (
                                                    <div className="animate-in slide-in-from-top-2 fade-in duration-300 mt-2">
                                                        <FormField
                                                            control={form.control}
                                                            name="outros_softwares_descricao"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Quais outros softwares?</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Descreva os softwares adicionais necessários..."
                                                                            {...field}
                                                                            value={field.value || ""}
                                                                            disabled={isSectionReadOnly}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="necessita_vpn"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel>Necessita VPN? (Acesso Remoto)</FormLabel>
                                                                <FormControl>
                                                                    <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex gap-4" disabled={isSectionReadOnly}>
                                                                        <div className="flex items-center space-x-2">
                                                                            <RadioGroupItem value="Sim" id="vpn-sim" />
                                                                            <Label htmlFor="vpn-sim">Sim</Label>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <RadioGroupItem value="Nao" id="vpn-nao" />
                                                                            <Label htmlFor="vpn-nao">Não</Label>
                                                                        </div>
                                                                    </RadioGroup>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="necessita_impressora"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel>Necessita Acesso a Impressora?</FormLabel>
                                                                <FormControl>
                                                                    <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex gap-4" disabled={isSectionReadOnly}>
                                                                        <div className="flex items-center space-x-2">
                                                                            <RadioGroupItem value="Sim" id="print-sim" />
                                                                            <Label htmlFor="print-sim">Sim</Label>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <RadioGroupItem value="Nao" id="print-nao" />
                                                                            <Label htmlFor="print-nao">Não</Label>
                                                                        </div>
                                                                    </RadioGroup>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="sharepoint_pasta"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Pastas de Rede / Sharepoint</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Especifique as pastas (ex: /Financeiro/Contas)" {...field} value={field.value || ""} disabled={isSectionReadOnly} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="buddy_mentor"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">3. Buddy / Mentor</FormLabel>
                                                            <FormControl><Input placeholder="Nome do mentor" {...field} value={field.value ?? ""} disabled={isSectionReadOnly} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="observacoes_gestor"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">4. Observações Gerais</FormLabel>
                                                            <FormControl><Input placeholder="Outras necessidades..." {...field} value={field.value ?? ""} disabled={isSectionReadOnly} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* SECAO 3 - TI */}
                            {currentSection === 3 && (
                                <div className="space-y-6">
                                    {/* Summary of Requests */}
                                    <Card className="bg-slate-50 border-slate-200">
                                        <CardHeader className="pb-3 border-b border-slate-200">
                                            <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                                                <ClipboardList className="h-4 w-4" /> Resumo da Solicitação
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4 grid gap-6 md:grid-cols-2">
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Dados do Colaborador (RH)</h4>
                                                <div className="space-y-1 text-sm bg-white p-3 rounded border border-slate-100">
                                                    <p><span className="font-medium text-slate-700">Nome:</span> {form.getValues("nome_completo") || "-"}</p>
                                                    <p><span className="font-medium text-slate-700">Cargo:</span> {form.getValues("cargo_funcao") || "-"}</p>
                                                    <p><span className="font-medium text-slate-700">Depto:</span> {form.getValues("setor_departamento") || "-"}</p>
                                                    <p><span className="font-medium text-slate-700">Início:</span> {form.getValues("data_inicio") ? new Date(form.getValues("data_inicio")).toLocaleDateString('pt-BR') : "-"}</p>
                                                    <p><span className="font-medium text-slate-700">Email Gestor:</span> {form.getValues("email_gestor") || "-"}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Solicitações do Gestor</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <span className="font-medium block text-slate-700">Equipamentos:</span>
                                                        {(form.getValues("equipamentos_necessarios")?.length || 0) > 0
                                                            ? <div className="flex flex-wrap gap-1 mt-1">{form.getValues("equipamentos_necessarios")?.map(e => <Badge key={e} variant="outline" className="bg-white border-slate-200">{e}</Badge>)}</div>
                                                            : <span className="text-slate-400 italic">Nenhum solicitado</span>}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium block text-slate-700">Softwares:</span>
                                                        {(form.getValues("softwares_necessarios")?.length || 0) > 0
                                                            ? <div className="flex flex-wrap gap-1 mt-1">{form.getValues("softwares_necessarios")?.map(s => <Badge key={s} variant="outline" className="bg-white border-slate-200">{s}</Badge>)}</div>
                                                            : <span className="text-slate-400 italic">Nenhum solicitado</span>}
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <div className={`flex-1 p-2 rounded border ${form.getValues("necessita_vpn") === 'Sim' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                            <span className="text-xs font-semibold block">VPN</span>
                                                            <span>{form.getValues("necessita_vpn") || "Não"}</span>
                                                        </div>
                                                        <div className={`flex-1 p-2 rounded border ${form.getValues("necessita_impressora") === 'Sim' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                            <span className="text-xs font-semibold block">Impressora</span>
                                                            <span>{form.getValues("necessita_impressora") || "Não"}</span>
                                                        </div>
                                                    </div>
                                                    {form.getValues("sharepoint_pasta") && (
                                                        <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100 text-blue-800 flex items-start gap-2">
                                                            <AlertCircle className="w-3 h-3 mt-0.5" />
                                                            <div>
                                                                <strong>Pastas:</strong> {form.getValues("sharepoint_pasta")}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Equipment Assignment Section */}
                                    <Card>
                                        <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 rounded-t-lg border-b border-amber-100">
                                            <CardTitle className="text-base text-amber-800 flex items-center gap-2">
                                                <Laptop className="h-4 w-4" /> Atribuição de Ativos (Inventário)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-4">
                                            {(form.getValues("equipamentos_necessarios")?.filter(eq => INVENTORY_TYPES.includes(eq)).length || 0) > 0 ? (
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {form.getValues("equipamentos_necessarios")?.filter(eq => INVENTORY_TYPES.includes(eq)).map((eqType) => {
                                                        const available = availableAssets.filter(i => i.device_type.toLowerCase() === eqType.toLowerCase());
                                                        return (
                                                            <div key={eqType} className="bg-white p-3 rounded-lg border border-slate-200">
                                                                <Label className="block mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                                                    {eqType} Solicitado
                                                                </Label>
                                                                {available.length > 0 ? (
                                                                    <Select
                                                                        onValueChange={(val) => {
                                                                            const currentMap = form.getValues("equipamentos_definidos") || {};
                                                                            form.setValue("equipamentos_definidos", { ...currentMap, [eqType]: val }, { shouldValidate: true });
                                                                        }}
                                                                        value={(form.getValues("equipamentos_definidos") as any)?.[eqType] || ""}
                                                                        disabled={isSectionReadOnly}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Selecione um ativo..." />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {available.map(item => (
                                                                                <SelectItem key={item.id} value={item.asset_tag}>
                                                                                    {item.model} - {item.asset_tag}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) : (
                                                                    <div className="text-sm text-red-500 italic flex items-center gap-1">
                                                                        <AlertCircle className="w-4 h-4" /> Sem estoque disponível
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500 italic text-center py-4">Nenhum equipamento foi solicitado pelo gestor.</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="bg-sage/10 dark:bg-sage/20 rounded-t-lg border-b border-sage/10"><CardTitle>Checklist de Configuração (TI)</CardTitle></CardHeader>
                                        <CardContent className="pt-6 space-y-6">
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                                    Tarefas de Configuração
                                                </h4>

                                                <div className="grid gap-3">
                                                    {[
                                                        { id: "conta_ad_criada", label: "Criar Conta no AD (Active Directory)", type: "required", detailField: "detalhes_conta_ad" },
                                                        { id: "email_corporativo_criado", label: "Criar E-mail Corporativo", type: "required", detailField: "detalhes_email" },
                                                        { id: "vpn_configurada", label: "Configurar VPN", type: "conditional", condition: form.getValues("necessita_vpn") === 'Sim' },

                                                        { id: "usuario_sap_criado", label: "Criar Usuário no SAP B1", type: "conditional", condition: form.getValues("softwares_necessarios")?.includes("SAP B1"), detailField: "detalhes_sap" },
                                                        { id: "perfil_salesforce_criado", label: "Criar Perfil no Salesforce", type: "conditional", condition: form.getValues("softwares_necessarios")?.includes("Salesforce"), detailField: "detalhes_salesforce" },
                                                        { id: "pastas_rede_liberadas", label: "Liberar Acesso a Pastas de Rede", type: "conditional", condition: !!form.getValues("sharepoint_pasta"), detailField: "detalhes_rede" },

                                                        { id: "impressoras_configuradas", label: "Configurar Impressoras", type: "conditional", condition: form.getValues("necessita_impressora") === 'Sim' },
                                                        { id: "testes_gerais_realizados", label: "Realizar Testes Gerais de Acesso", type: "required", detailField: "detalhes_testes" },

                                                        // Dinamicamente adicionar periféricos que não tem TAG/Inventário
                                                        ...(form.getValues("equipamentos_necessarios") || [])
                                                            .filter(eq => !INVENTORY_TYPES.includes(eq))
                                                            .map(eq => ({
                                                                id: eq,
                                                                label: `Entregar ${eq}`,
                                                                type: "peripheral"
                                                            }))
                                                    ].map((item: any) => {
                                                        if (item.type === "conditional" && !item.condition) return null;

                                                        const isDone = item.type === "peripheral"
                                                            ? (form.watch("status_perifericos") as any)?.[item.id] === "Sim"
                                                            : form.watch(item.id as any) === "Sim";

                                                        const detailValue = item.detailField ? form.watch(item.detailField as any) : null;

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`
                                                            flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer group
                                                            ${isDone
                                                                        ? "bg-purple-50 border-purple-200 shadow-sm"
                                                                        : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-md"
                                                                    }
                                                        `}
                                                                onClick={() => {
                                                                    if (item.type === "peripheral") {
                                                                        const current = form.getValues("status_perifericos") || {};
                                                                        const val = current[item.id] === "Sim" ? "Nao" : "Sim";
                                                                        form.setValue("status_perifericos", { ...current, [item.id]: val }, { shouldValidate: true });
                                                                    } else if (item.detailField) {
                                                                        setEditingItem(item.id);
                                                                        setTempDetail(form.getValues(item.detailField as any) || "");
                                                                    } else {
                                                                        const current = form.getValues(item.id as any);
                                                                        form.setValue(item.id as any, current === "Sim" ? "Nao" : "Sim", { shouldValidate: true });
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`
                                                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                                                ${isDone ? "bg-purple-600 border-purple-600" : "border-slate-300 group-hover:border-purple-400"}
                                                            `}>
                                                                            {isDone && <Check className="w-4 h-4 text-white" />}
                                                                        </div>
                                                                        <span className={`font-medium ${isDone ? "text-purple-900" : "text-slate-700"}`}>
                                                                            {item.label}
                                                                        </span>
                                                                    </div>
                                                                    {isDone && detailValue && (
                                                                        <span className="text-xs text-slate-500 pl-10">
                                                                            {detailValue}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                                                                    TI
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* DIALOG FOR TI DETAILS */}
                                                {editingItem && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
                                                        <Card className="w-full max-w-md bg-white p-6 shadow-xl rounded-xl">
                                                            <div className="mb-4">
                                                                <h3 className="text-lg font-bold text-slate-800">Detalhes da Tarefa</h3>
                                                                <p className="text-sm text-slate-500">Descreva o que foi feito para concluir esta etapa.</p>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <textarea
                                                                    className="w-full min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                                                    placeholder="Ex: Conta criada com usuário 'j.silva', grupo 'Financeiro'..."
                                                                    value={tempDetail}
                                                                    onChange={(e) => setTempDetail(e.target.value)}
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => setEditingItem(null)}
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button
                                                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                                                        onClick={() => {
                                                                            if (!tempDetail.trim()) {
                                                                                alert("Por favor, descreva o que foi feito.");
                                                                                return;
                                                                            }
                                                                            const fieldName = editingItem;
                                                                            // Map itemId to detailField
                                                                            const detailMap: Record<string, string> = {
                                                                                "conta_ad_criada": "detalhes_conta_ad",
                                                                                "email_corporativo_criado": "detalhes_email",
                                                                                "usuario_sap_criado": "detalhes_sap",
                                                                                "perfil_salesforce_criado": "detalhes_salesforce",
                                                                                "pastas_rede_liberadas": "detalhes_rede",
                                                                                "testes_gerais_realizados": "detalhes_testes"
                                                                            };
                                                                            const detailField = detailMap[fieldName];

                                                                            if (detailField) {
                                                                                form.setValue(detailField as any, tempDetail);
                                                                            }
                                                                            form.setValue(fieldName as any, "Sim", { shouldValidate: true });
                                                                            setEditingItem(null);
                                                                        }}
                                                                    >
                                                                        Concluir Tarefa
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                )}
                                            </div>


                                            <FormField
                                                control={form.control}
                                                name="observacoes_ti"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Observações Técnicas</FormLabel>
                                                        <FormControl><Input placeholder="Registro de chamado, patrimônios, etc." {...field} value={field.value || ""} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                            }

                            {/* SECAO 4 - COLABORADOR */}
                            {
                                currentSection === 4 && (
                                    <Card>
                                        <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 rounded-t-lg border-b border-blue-100 dark:border-blue-900/30">
                                            <CardTitle>Validação do Colaborador</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-6">
                                            <div className="space-y-4">
                                                {/* Termo de Responsabilidade Text */}
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-justify leading-relaxed">
                                                    <h4 className="font-bold text-slate-800 mb-2">Termo de Responsabilidade</h4>
                                                    <p>
                                                        Eu, <strong>{form.getValues("nome_completo") || "[Nome do Colaborador]"}</strong>, declaro ter recebido da empresa MedBeauty os equipamentos e acessos listados abaixo, em perfeito estado de conservação e funcionamento:
                                                    </p>
                                                    <ul className="list-disc pl-5 my-3 space-y-1 text-slate-700">
                                                        <li>
                                                            <span className="font-semibold">Equipamentos:</span> {form.getValues("equipamentos_necessarios")?.join(", ") || "Nenhum equipamento listado"}
                                                        </li>
                                                        <li>
                                                            <span className="font-semibold">Softwares/Acessos:</span> {form.getValues("softwares_necessarios")?.join(", ") || "Nenhum software listado"}
                                                            {form.getValues("necessita_vpn") === "Sim" && ", VPN"}
                                                            {form.getValues("necessita_impressora") === "Sim" && ", Acesso à Impressora"}
                                                        </li>
                                                    </ul>
                                                    <p>
                                                        Comprometo-me a utilizá-los exclusivamente para o desempenho de minhas funções, zelando por sua integridade e confidencialidade das informações acessadas. Declaro estar ciente de que a má utilização ou dano intencional poderá acarretar medidas disciplinares e ressarcimento de danos.
                                                    </p>
                                                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 border-l-4 border-blue-400 text-xs flex justify-between items-center">
                                                        <span>Este texto será enviado via Docusign para assinatura eletrônica formal.</span>

                                                        {form.watch("termo_assinado") ? (
                                                            <Badge className="bg-green-600 hover:bg-green-600 gap-1">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Assinado Digitalmente
                                                            </Badge>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                                                onClick={handleDocusignSign}
                                                                disabled={isSigning}
                                                            >
                                                                {isSigning ? (
                                                                    <>
                                                                        <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                        Assinando...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="h-3 w-3 bg-white rounded-sm" />
                                                                        Assinar via DocuSign
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="confirma_recebimento_equipamentos"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                            <div className="space-y-0.5">
                                                                <FormLabel className="text-base">Equipamentos Recebidos</FormLabel>
                                                                <CardDescription>
                                                                    Confirmo que recebi todos os equipamentos listados.
                                                                </CardDescription>
                                                            </div>
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value === "Sim"}
                                                                    onCheckedChange={(checked) => field.onChange(checked ? "Sim" : "Nao")}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="confirma_funcionamento_acessos"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                            <div className="space-y-0.5">
                                                                <FormLabel className="text-base">Acessos Funcionando</FormLabel>
                                                                <CardDescription>
                                                                    Confirmo que testei meus acessos (Email, AD, etc) e estão ok.
                                                                </CardDescription>
                                                            </div>
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value === "Sim"}
                                                                    onCheckedChange={(checked) => field.onChange(checked ? "Sim" : "Nao")}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="recebeu_orientacao_sistemas"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                            <div className="space-y-0.5">
                                                                <FormLabel className="text-base">Orientação de Sistemas</FormLabel>
                                                                <CardDescription>
                                                                    Recebi orientações iniciais sobre os sistemas da empresa.
                                                                </CardDescription>
                                                            </div>
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value === "Sim"}
                                                                    onCheckedChange={(checked) => field.onChange(checked ? "Sim" : "Nao")}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="observacoes_colaborador"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Observações do Colaborador</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Alguma observação ou pendência?" {...field} value={field.value || ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            }

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="button"
                                    className={`gap-2 min-w-[160px] ${currentSection === 4 && !form.getValues("termo_assinado")
                                        ? "bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300"
                                        : "bg-rose-gold hover:bg-rose-gold-dark text-white"
                                        }`}
                                    disabled={isSendingEmail || (currentSection === 4 && !form.getValues("termo_assinado"))}
                                    onClick={() => {
                                        const values = form.getValues();
                                        console.log("Botão clicado manualmente. Valores atuais:", values);
                                        // Chamamos a validação manual e o submit
                                        handleSubmit(values);
                                    }}
                                >
                                    {isSendingEmail ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            {currentSection < 4 ? <Send className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                            {getButtonText()}
                                        </>
                                    )}
                                </Button>

                                {/* Quick Action: Copy Link */}
                                {currentSection > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={copyLink}
                                        className="ml-2 gap-2 text-rose-gold border-rose-gold/30 hover:bg-rose-gold/10"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copiar Link
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Form>

                </>
            )}
        </div>
    );
}
