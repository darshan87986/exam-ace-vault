
-- Create a degrees table
CREATE TABLE public.degrees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial degrees
INSERT INTO public.degrees (name, code, description) VALUES
('Bachelor of Computer Applications', 'BCA', 'Undergraduate degree program in computer applications'),
('Bachelor of Business Administration', 'BBA', 'Undergraduate degree program in business administration');

-- Add degree_id column to Exam-prep table
ALTER TABLE public."Exam-prep" ADD COLUMN degree_id UUID REFERENCES public.degrees(id);

-- Create index for better performance
CREATE INDEX idx_exam_prep_degree_id ON public."Exam-prep"(degree_id);
CREATE INDEX idx_exam_prep_subject ON public."Exam-prep"(subject);

-- Enable RLS on degrees table
ALTER TABLE public.degrees ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to degrees
CREATE POLICY "Allow public read access to degrees" 
  ON public.degrees 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to manage degrees (for admin functionality later)
CREATE POLICY "Allow authenticated users to manage degrees" 
  ON public.degrees 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);
