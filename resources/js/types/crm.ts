export type ProductType = 'sutura' | 'espiculado' | 'parafuso' | 'outros';
export type LogisticsStatus = 'em_transito' | 'desembaraco' | 'em_estoque' | 'esgotado' | 'recall';
export type LeadStatus = 'novo' | 'em_atendimento' | 'aguardando_pagamento' | 'convertido' | 'perdido';

export interface CRMProduct {
  id: string;
  name: string;
  type: ProductType;
  gauge_usp: string;
  length_cm: number;
  needle_type?: string;
  anvisa_registration: string;
  description?: string;
  price_cents: number;
  created_at: string;
  updated_at: string;
}

export interface CRMLot {
  id: string;
  product_id: string;
  lot_number: string;
  expiry_date: string;
  quantity_initial: number;
  quantity_available: number;
  status: LogisticsStatus;
  importation_date?: string;
  created_at: string;
}

export interface CRMLead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  segment: 'medico' | 'clinica' | 'distribuidor' | 'vendedor';
  specialty?: string;
  crm_license?: string;
  status: LeadStatus;
  ai_score_hot: boolean;
  ai_analysis_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface CRMOrder {
  id: string;
  lead_id: string;
  stripe_session_id?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  total_amount_cents: number;
  created_at: string;
}

export interface CRMOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  lot_id: string;
  quantity: number;
  unit_price_cents: number;
  created_at: string;
}

export interface CRMInteraction {
  id: string;
  lead_id: string;
  sender_type: 'vendedor' | 'lead' | 'bot';
  message: string;
  metadata?: any;
  created_at: string;
}

export type ActivityType = 'call' | 'meeting' | 'email' | 'whatsapp' | 'note' | 'visit';

export interface CRMActivity {
  id: string;
  lead_id: string;
  type: ActivityType;
  description: string;
  created_at: string;
}
