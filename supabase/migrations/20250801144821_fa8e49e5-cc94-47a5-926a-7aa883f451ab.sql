-- Enable RLS on the existing Exam-prep table
ALTER TABLE public."Exam-prep" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access to resources
CREATE POLICY "Allow public read access to exam resources" 
ON public."Exam-prep" 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to insert (admins only, will be refined later)
CREATE POLICY "Allow authenticated users to insert exam resources" 
ON public."Exam-prep" 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy for authenticated users to update
CREATE POLICY "Allow authenticated users to update exam resources" 
ON public."Exam-prep" 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create policy for authenticated users to delete
CREATE POLICY "Allow authenticated users to delete exam resources" 
ON public."Exam-prep" 
FOR DELETE 
TO authenticated 
USING (true);

-- Add some additional useful columns
ALTER TABLE public."Exam-prep" 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'question_paper' CHECK (resource_type IN ('question_paper', 'solved_paper', 'notes')),
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Create an index for better search performance
CREATE INDEX IF NOT EXISTS idx_exam_prep_subject ON public."Exam-prep"(subject);
CREATE INDEX IF NOT EXISTS idx_exam_prep_year ON public."Exam-prep"(year);
CREATE INDEX IF NOT EXISTS idx_exam_prep_course ON public."Exam-prep"(course);
CREATE INDEX IF NOT EXISTS idx_exam_prep_resource_type ON public."Exam-prep"(resource_type);

-- Create a function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(resource_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public."Exam-prep" 
  SET download_count = download_count + 1 
  WHERE id = resource_id;
END;
$$;