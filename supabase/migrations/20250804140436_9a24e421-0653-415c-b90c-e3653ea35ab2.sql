-- Create universities table
CREATE TABLE public.universities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on universities
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Create policies for universities
CREATE POLICY "Allow public read access to universities" 
ON public.universities 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to manage universities" 
ON public.universities 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add university_id to degrees table
ALTER TABLE public.degrees 
ADD COLUMN university_id UUID REFERENCES public.universities(id);

-- Add show_in_recent flag to Exam-prep table
ALTER TABLE public."Exam-prep" 
ADD COLUMN show_in_recent BOOLEAN NOT NULL DEFAULT true;

-- Create comments table for degree-specific comments
CREATE TABLE public.degree_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  degree_id UUID NOT NULL REFERENCES public.degrees(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  comment_text TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.degree_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Allow public read access to approved comments" 
ON public.degree_comments 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Allow anyone to insert comments" 
ON public.degree_comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage comments" 
ON public.degree_comments 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Insert RCU university
INSERT INTO public.universities (name, code, location) 
VALUES ('Rani Channamma University', 'RCU', 'Belagavi');

-- Update existing degrees to link to RCU
UPDATE public.degrees 
SET university_id = (SELECT id FROM public.universities WHERE code = 'RCU' LIMIT 1);