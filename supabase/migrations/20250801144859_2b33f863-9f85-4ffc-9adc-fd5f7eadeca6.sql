-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.increment_download_count(resource_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Exam-prep" 
  SET download_count = download_count + 1 
  WHERE id = resource_id;
END;
$$;