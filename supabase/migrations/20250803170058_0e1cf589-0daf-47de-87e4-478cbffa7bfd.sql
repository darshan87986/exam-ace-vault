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

-- Create semesters table
CREATE TABLE public.semesters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  degree_id UUID NOT NULL REFERENCES public.degrees(id) ON DELETE CASCADE,
  semester_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(degree_id, semester_number)
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(semester_id, code)
);

-- Add columns to Exam-prep table
ALTER TABLE public."Exam-prep" ADD COLUMN degree_id UUID REFERENCES public.degrees(id);
ALTER TABLE public."Exam-prep" ADD COLUMN subject_id UUID REFERENCES public.subjects(id);

-- Insert BCA semesters
INSERT INTO public.semesters (degree_id, semester_number, name) 
SELECT d.id, s.semester_number, s.name 
FROM public.degrees d,
(VALUES 
  (1, '1st Semester'),
  (2, '2nd Semester'), 
  (3, '3rd Semester'),
  (4, '4th Semester'),
  (5, '5th Semester'),
  (6, '6th Semester')
) AS s(semester_number, name)
WHERE d.code = 'BCA';

-- Insert BBA semesters
INSERT INTO public.semesters (degree_id, semester_number, name)
SELECT d.id, s.semester_number, s.name 
FROM public.degrees d,
(VALUES 
  (1, '1st Semester'),
  (2, '2nd Semester'), 
  (3, '3rd Semester'),
  (4, '4th Semester'),
  (5, '5th Semester'),
  (6, '6th Semester')
) AS s(semester_number, name)
WHERE d.code = 'BBA';

-- Insert sample subjects for BCA 1st semester
INSERT INTO public.subjects (semester_id, name, code, description)
SELECT s.id, sub.name, sub.code, sub.description
FROM public.semesters s
JOIN public.degrees d ON s.degree_id = d.id,
(VALUES 
  ('Programming in C', 'C', 'Introduction to C programming language'),
  ('Computer Fundamentals', 'CF', 'Basic computer concepts and fundamentals'),
  ('Mathematics', 'MATH', 'Mathematical foundations for computer applications'),
  ('English Communication', 'ENG', 'English language and communication skills'),
  ('Digital Electronics', 'DE', 'Digital circuits and electronics')
) AS sub(name, code, description)
WHERE d.code = 'BCA' AND s.semester_number = 1;

-- Insert sample subjects for BBA 1st semester
INSERT INTO public.subjects (semester_id, name, code, description)
SELECT s.id, sub.name, sub.code, sub.description
FROM public.semesters s
JOIN public.degrees d ON s.degree_id = d.id,
(VALUES 
  ('Principles of Management', 'POM', 'Basic management principles and concepts'),
  ('Business Mathematics', 'BM', 'Mathematical applications in business'),
  ('Business Communication', 'BC', 'Communication skills for business'),
  ('Economics', 'ECO', 'Economic principles and applications'),
  ('Accounting', 'ACC', 'Financial accounting fundamentals')
) AS sub(name, code, description)
WHERE d.code = 'BBA' AND s.semester_number = 1;

-- Create indexes for better performance
CREATE INDEX idx_semesters_degree_id ON public.semesters(degree_id);
CREATE INDEX idx_subjects_semester_id ON public.subjects(semester_id);
CREATE INDEX idx_exam_prep_degree_id ON public."Exam-prep"(degree_id);
CREATE INDEX idx_exam_prep_subject_id ON public."Exam-prep"(subject_id);

-- Enable RLS on all tables
ALTER TABLE public.degrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to degrees" 
  ON public.degrees 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to semesters" 
  ON public.semesters 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to subjects" 
  ON public.subjects 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to manage all tables
CREATE POLICY "Allow authenticated users to manage degrees" 
  ON public.degrees 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage semesters" 
  ON public.semesters 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage subjects" 
  ON public.subjects 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);