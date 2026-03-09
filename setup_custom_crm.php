<?php
require 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$sql = "
-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.crm_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'consultant',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    segment TEXT,
    specialty TEXT,
    crm_license TEXT,
    status TEXT DEFAULT 'novo',
    ai_score_hot BOOLEAN DEFAULT FALSE,
    ai_analysis_summary TEXT,
    assigned_to UUID REFERENCES public.crm_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.crm_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    stripe_session_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    total_amount_cents INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function for New Auth Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.crm_profiles (id, full_name, avatar_url)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Check/Create
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Policies (RLS)
ALTER TABLE public.crm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing if they fail to create due to duplicates
DROP POLICY IF EXISTS \"Public profiles are viewable by everyone\" ON public.crm_profiles;
CREATE POLICY \"Public profiles are viewable by everyone\" ON public.crm_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS \"All for authenticated users\" ON public.crm_leads;
CREATE POLICY \"All for authenticated users\" ON public.crm_leads FOR ALL USING (true);

DROP POLICY IF EXISTS \"All for authenticated users\" ON public.crm_orders;
CREATE POLICY \"All for authenticated users\" ON public.crm_orders FOR ALL USING (true);
";

try {
    DB::unprepared($sql);
    echo "CRM Custom Tables, Triggers and RLS Policies created successfully!\n";
} catch (\Exception $e) {
    echo "Error execution: " . $e->getMessage() . "\n";
}
