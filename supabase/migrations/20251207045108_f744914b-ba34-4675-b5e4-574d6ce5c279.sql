-- Create finance_dashboards table for user's different finance categories
CREATE TABLE public.finance_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.finance_dashboards ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own dashboards" 
ON public.finance_dashboards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboards" 
ON public.finance_dashboards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards" 
ON public.finance_dashboards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards" 
ON public.finance_dashboards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_finance_dashboards_updated_at
BEFORE UPDATE ON public.finance_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add dashboard_id column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN dashboard_id UUID REFERENCES public.finance_dashboards(id) ON DELETE CASCADE;

-- Add dashboard_id column to categories table  
ALTER TABLE public.categories
ADD COLUMN dashboard_id UUID REFERENCES public.finance_dashboards(id) ON DELETE CASCADE;