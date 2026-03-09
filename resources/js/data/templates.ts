export type Role = 'RH' | 'Gestor' | 'TI' | 'Colaborador' | 'DP';

export interface TemplateStep {
    text: string;
    role: Role;
    key?: string; // Used for programmatic sync
}

export interface Template {
    id: string;
    title: string;
    description: string;
    steps: TemplateStep[];
}

export const templates: Template[] = [
    {
        id: 'admissao',
        title: 'Processo de Admissão',
        description: 'Checklist completo para entrada de novos colaboradores (RH, Gestor, TI)',
        steps: [
            { key: 'rh_dados', role: 'RH', text: 'Coletar Nome Completo, CPF e Dados Pessoais' },
            { key: 'rh_datas', role: 'RH', text: 'Definição de Data de Admissão e Início' },
            { key: 'rh_cargo', role: 'RH', text: 'Definição de Depto, Cargo e Gestor Direto' },
            { key: 'gestor_buddy', role: 'Gestor', text: 'Definir Buddy/Mentor para o novo colaborador' },
            { key: 'gestor_equip', role: 'Gestor', text: 'Solicitar Equipamentos (Notebook, Monitor, etc.)' },
            { key: 'gestor_acessos', role: 'Gestor', text: 'Solicitar Acessos Específicos (Pastas, Sistemas)' },
            { key: 'ti_ad', role: 'TI', text: 'Criar Conta no AD (Active Directory)' },
            { key: 'ti_email', role: 'TI', text: 'Criar E-mail Corporativo' },
            { key: 'ti_vpn', role: 'TI', text: 'Configurar VPN (se aplicável)' },
            { key: 'ti_sap', role: 'TI', text: 'Criar Usuário no SAP B1' },
            { key: 'ti_salesforce', role: 'TI', text: 'Criar Perfil no Salesforce' },
            { key: 'ti_rede', role: 'TI', text: 'Liberar Acesso a Pastas de Rede' },
            { key: 'ti_impressora', role: 'TI', text: 'Configurar Impressoras' },
            { key: 'ti_testes', role: 'TI', text: 'Realizar Testes Gerais de Acesso' },
            { key: 'colab_equip', role: 'Colaborador', text: 'Confirmar Recebimento de Equipamentos' },
            { key: 'colab_acessos', role: 'Colaborador', text: 'Confirmar Funcionamento de Acessos' },
            { key: 'colab_orientacao', role: 'Colaborador', text: 'Receber Orientação Inicial de Sistemas' }
        ]
    },
    {
        id: 'demissao',
        title: 'Processo de Demissão',
        description: 'Fluxo de desligamento de colaboradores e revogação de acessos',
        steps: [
            { key: 'gestor_equip', role: 'Gestor', text: 'Recolher Equipamentos Físicos (Notebook, Celular)' },
            { key: 'gestor_pendencias', role: 'Gestor', text: 'Validar Pendências de Trabalho' },
            { key: 'rh_comunicado', role: 'RH', text: 'Receber Carta de Demissão ou Comunicar Colaborador' },
            { key: 'rh_datas', role: 'RH', text: 'Definição de Último Dia de Trabalho' },
            { key: 'rh_exame', role: 'RH', text: 'Agendar Exame Demissional' },
            { key: 'ti_ad', role: 'TI', text: 'Bloquear Conta AD Imediatamente após saída' },
            { key: 'ti_email', role: 'TI', text: 'Bloquear E-mail Corporativo' },
            { key: 'ti_vpn', role: 'TI', text: 'Revogar Acesso VPN' },
            { key: 'ti_sap', role: 'TI', text: 'Inativar Usuário SAP B1' },
            { key: 'ti_salesforce', role: 'TI', text: 'Inativar Usuário Salesforce' }
        ]
    }
];
