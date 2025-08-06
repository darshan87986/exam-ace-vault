import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, BookOpen, FileText, GraduationCap, Users, ArrowLeft, ChevronRight, MapPin, Award, TrendingUp, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { CommentSection } from "@/components/CommentSection";

interface ExamResource {
  id: number;
  title: string;
  subject: string;
  year: number;
  course: string;
  resource_type: string;
  download_count: number;
  file_path: string;
  description: string;
  degree_id?: string;
  subject_id?: string;
}

interface Degree {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface Semester {
  id: string;
  degree_id: string;
  semester_number: number;
  name: string;
}

interface Subject {
  id: string;
  semester_id: string;
  name: string;
  code: string;
  description?: string;
}

interface University {
  id: string;
  name: string;
  code: string;
  location?: string;
}

interface Stats {
  totalResources: number;
  totalUniversities: number;
  totalSubjects: number;
  totalDownloads: number;
}

// Counter Animation Component
const AnimatedCounter = ({ target, label }: { target: number; label: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && target > 0) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, target]);

  return (
    <div ref={ref} className="space-y-2">
      <div className="text-4xl font-bold text-primary">
        {count.toLocaleString()}+
      </div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState<ExamResource[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "universities" | "degrees" | "semesters" | "subjects" | "resources">("home");
  const [stats, setStats] = useState<Stats>({ totalResources: 0, totalUniversities: 0, totalSubjects: 0, totalDownloads: 0 });

  useEffect(() => {
    if (currentView === "home") {
      fetchResources();
      fetchStats();
    } else if (currentView === "universities") {
      fetchUniversities();
    } else if (currentView === "degrees") {
      fetchDegrees();
    } else if (currentView === "semesters" && selectedDegree) {
      fetchSemesters();
    } else if (currentView === "subjects" && selectedSemester) {
      fetchSubjects();
    } else if (currentView === "resources" && selectedSubject) {
      fetchResourcesBySubject();
    }
  }, [currentView, selectedUniversity, selectedDegree, selectedSemester, selectedSubject]);

  // Separate useEffect for search functionality
  useEffect(() => {
    if (currentView === "home") {
      const debounceTimer = setTimeout(() => {
        setLoading(true);
        fetchResources();
      }, 300); // Debounce search by 300ms

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, currentView]);

  const fetchStats = async () => {
    try {
      // Fetch total resources
      const { count: resourceCount } = await supabase
        .from("Exam-prep")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      // Fetch total universities
      const { count: universityCount } = await supabase
        .from("universities")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch total subjects
      const { count: subjectCount } = await supabase
        .from("subjects")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch total downloads
      const { data: downloadData } = await supabase
        .from("Exam-prep")
        .select("download_count")
        .eq("is_published", true);

      const totalDownloads = downloadData?.reduce((sum, item) => sum + (item.download_count || 0), 0) || 0;

      setStats({
        totalResources: resourceCount || 0,
        totalUniversities: universityCount || 0,
        totalSubjects: subjectCount || 0,
        totalDownloads: totalDownloads
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchResources = async () => {
    try {
      let query = supabase
        .from("Exam-prep")
        .select("*")
        .eq("is_published", true);

      // If there's a search term, apply search filters
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,course.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      } else {
        // Only show recent when no search term
        query = query.eq("show_in_recent", true);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(searchTerm.trim() ? 50 : 6); // Show more results when searching

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("universities" as any)
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setUniversities((data as any) || []);
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDegrees = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("degrees" as any)
        .select("*")
        .eq("is_active", true);
      
      if (selectedUniversity) {
        query = query.eq("university_id", selectedUniversity.id);
      }
      
      const { data, error } = await query.order("name");

      if (error) throw error;
      setDegrees((data as any) || []);
    } catch (error) {
      console.error("Error fetching degrees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("semesters" as any)
        .select("*")
        .eq("degree_id", selectedDegree?.id)
        .eq("is_active", true)
        .order("semester_number");

      if (error) throw error;
      setSemesters((data as any) || []);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subjects" as any)
        .select("*")
        .eq("semester_id", selectedSemester?.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setSubjects((data as any) || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResourcesBySubject = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Exam-prep" as any)
        .select("*")
        .eq("subject_id", selectedSubject?.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources((data as any) || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = 
      resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.course?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || resource.resource_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleDegreeSelect = (degree: Degree) => {
    setSelectedDegree(degree);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setCurrentView("semesters");
  };

  const handleSemesterSelect = (semester: Semester) => {
    setSelectedSemester(semester);
    setSelectedSubject(null);
    setCurrentView("subjects");
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView("resources");
  };

  const handleBackToHome = () => {
    setSelectedDegree(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setCurrentView("home");
  };

  const handleBackToDegrees = () => {
    setSelectedSemester(null);
    setSelectedSubject(null);
    setCurrentView("degrees");
  };

  const handleBackToSemesters = () => {
    setSelectedSubject(null);
    setCurrentView("semesters");
  };

  const handleBackToSubjects = () => {
    setCurrentView("subjects");
  };

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setSelectedDegree(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setCurrentView("degrees");
  };

  const handleBackToUniversities = () => {
    setSelectedDegree(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setCurrentView("universities");
  };

  const handleDownload = async (resourceId: number, filePath: string, title: string) => {
    try {
      // Increment download count
      await supabase.rpc("increment_download_count", { resource_id: resourceId });
      
      // Use the file path directly if it's already a full URL, otherwise construct it
      const downloadUrl = filePath.startsWith('http') 
        ? filePath 
        : supabase.storage.from("question-papers").getPublicUrl(filePath).data.publicUrl;
      
      // Trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = title;
      link.click();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">ExamAce Vault</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-primary font-medium">Home</Link>
              <Link to="/universities" className="text-muted-foreground hover:text-primary transition-colors">Universities</Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
            </nav>
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              Trusted by thousands of students
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight">
            Your Ultimate
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Exam Success </span>
            Platform
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Access thousands of previous year question papers, solved papers, and comprehensive study notes. 
            Everything you need to excel in your degree exams, all in one place.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto relative mb-12">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
            <Input
              type="text"
              placeholder="Search by subject, course, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-16 text-lg rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl focus:shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Call to Action */}
          <div className="flex justify-center">
            <Link to="/universities">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg font-semibold"
              >
                <MapPin className="h-6 w-6 mr-3" />
                Choose Your University
              </Button>
            </Link>
          </div>

          {/* Filter Tabs - Only show on home view */}
          {currentView === "home" && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { key: "all", label: "All Resources" },
                { key: "question_paper", label: "Question Papers" },
                { key: "solved_paper", label: "Solved Papers" },
                { key: "notes", label: "Study Notes" }
              ].map((type) => (
                <Button
                  key={type.key}
                  variant={selectedType === type.key ? "default" : "outline"}
                  onClick={() => setSelectedType(type.key)}
                  className={`rounded-full px-6 py-3 font-medium transition-all duration-300 ${
                    selectedType === type.key 
                      ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                      : "bg-white/60 backdrop-blur-sm hover:bg-secondary/20 hover:text-secondary-foreground hover:scale-105"
                  }`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-secondary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Why Choose ExamAce Vault?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of students who trust us for their exam preparation needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 transform group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">Comprehensive Collection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Thousands of question papers, solved papers, and study notes covering all major subjects and courses from top universities.
              </p>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-secondary/30 group-hover:to-secondary/20 transition-all duration-300 transform group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                <Award className="h-10 w-10 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-secondary-foreground transition-colors">Premium Quality</h3>
              <p className="text-muted-foreground leading-relaxed">
                All resources are carefully curated, verified for accuracy, and updated regularly to ensure you get the best study materials.
              </p>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-accent/20 to-accent/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-300 transform group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                <TrendingUp className="h-10 w-10 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-accent-foreground transition-colors">Completely Free</h3>
              <p className="text-muted-foreground leading-relaxed">
                Complete free access to all resources. No hidden fees, no subscriptions. Quality education should be accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Impact in Numbers</h3>
            <p className="text-lg text-muted-foreground">Helping students succeed across the globe</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <AnimatedCounter target={stats.totalResources} label="Question Papers" />
            <AnimatedCounter target={stats.totalUniversities} label="Universities" />
            <AnimatedCounter target={stats.totalSubjects} label="Subjects" />
            <AnimatedCounter target={stats.totalDownloads} label="Downloads" />
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            {searchTerm.trim() ? `Search Results for "${searchTerm}"` : "Recently Added Resources"}
          </h3>
      
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-card/50">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource) => (
                <Card 
                  key={resource.id} 
                  className="group cursor-pointer bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-primary/5 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg hover:shadow-primary/10 backdrop-blur-sm"
                >
                  <CardHeader className="relative">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {resource.title}
                      </CardTitle>
                      <Badge 
                        variant="secondary"
                        className="bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary-foreground hover:from-secondary/30 hover:to-secondary/20 transition-all border-0 shadow-sm"
                      >
                        {resource.resource_type?.replace('_', ' ').toUpperCase() || 'RESOURCE'}
                      </Badge>
                    </div>
                    <CardDescription className="text-muted-foreground font-medium">
                      {resource.subject} • {resource.course} • {resource.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Download className="h-4 w-4 mr-2" />
                        <span className="font-medium">{resource.download_count} downloads</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleDownload(resource.id, resource.file_path, resource.title)}
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!loading && filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No resources found matching your search.</p>
            </div>
          )}
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-foreground">ExamAce Vault</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Your trusted platform for academic resources and exam preparation materials.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link to="/resources" className="hover:text-foreground transition-colors">All Resources</Link></li>
                <li><Link to="/subjects" className="hover:text-foreground transition-colors">Browse by Subject</Link></li>
                <li><Link to="/search" className="hover:text-foreground transition-colors">Advanced Search</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <p className="text-muted-foreground mb-4 text-sm">
                Stay updated with the latest resources and exam tips.
              </p>
              <Button className="w-full text-sm">Subscribe to Updates</Button>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p className="text-sm">&copy; 2024 ExamAce Vault. All rights reserved. Built with ❤️ for students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;