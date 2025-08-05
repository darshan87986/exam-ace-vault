import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, BookOpen, FileText, GraduationCap, Users, ArrowLeft, ChevronRight, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (currentView === "home") {
      fetchResources();
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

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("Exam-prep")
        .select("*")
        .eq("is_published", true)
        .eq("show_in_recent", true)
        .order("created_at", { ascending: false })
        .limit(6);

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
              <Link to="/resources" className="text-muted-foreground hover:text-primary transition-colors">All Resources</Link>
              <Link to="/subjects" className="text-muted-foreground hover:text-primary transition-colors">Subjects</Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
            </nav>
            <Button asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-r from-secondary/20 to-accent/20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">Why Choose ExamAce Vault?</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Comprehensive Collection</h4>
              <p className="text-muted-foreground">
                Thousands of question papers, solved papers, and study notes covering all major subjects and courses.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors">
                <FileText className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">High Quality Content</h4>
              <p className="text-muted-foreground">
                All resources are carefully curated and verified for accuracy. Get the most reliable study materials.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/30 transition-colors">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Free Access</h4>
              <p className="text-muted-foreground">
                Complete free access to all resources. No hidden fees, no subscriptions. Education should be accessible to all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Your Ultimate
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"> Exam Resource </span>
            Hub
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Access thousands of previous year question papers, solved papers, and comprehensive study notes. 
            Everything you need to ace your degree exams, all in one place.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by subject, course, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button
              size="lg"
              onClick={() => setCurrentView("universities")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-4 shadow-lg hover:shadow-xl transition-all"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Browse by University
            </Button>
            <Button
              size="lg"
              onClick={() => setCurrentView("degrees")}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 sm:px-8 py-4 shadow-lg hover:shadow-xl transition-all"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Browse by Degree
            </Button>
            <Button
              size="lg"
              onClick={handleBackToHome}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 sm:px-8 py-4 shadow-lg hover:shadow-xl transition-all"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              All Resources
            </Button>
          </div>

          {/* Filter Tabs - Only show on home view */}
          {currentView === "home" && (
            <div className="flex justify-center space-x-2 mb-12">
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
                  className={`rounded-full transition-all ${
                    selectedType === type.key 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "hover:bg-secondary/20 hover:text-secondary-foreground"
                  }`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Content Based on Current View */}
      {currentView === "home" && (
        <>
          {/* Stats Section */}
          <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">10,000+</div>
                  <div className="text-muted-foreground">Question Papers</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-secondary-foreground">500+</div>
                  <div className="text-muted-foreground">Universities</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-accent-foreground">100+</div>
                  <div className="text-muted-foreground">Subjects</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">50,000+</div>
                  <div className="text-muted-foreground">Downloads</div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Resources */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-bold text-center text-foreground mb-12">Recently Added Resources</h3>
              
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-foreground">{resource.title}</CardTitle>
                            <CardDescription className="text-muted-foreground">{resource.course} • {resource.year}</CardDescription>
                          </div>
                          <Badge className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/30">
                            {resource.resource_type.replace("_", " ")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {resource.description || "Comprehensive study material for exam preparation"}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            <Download className="h-4 w-4 inline mr-1" />
                            {resource.download_count} downloads
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(resource.id, resource.file_path, resource.title)}
                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                          >
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
        </>
      )}

      {/* Universities View */}
      {currentView === "universities" && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            
            <h3 className="text-3xl font-bold text-center text-foreground mb-12">Choose Your University</h3>
            
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {universities.map((university) => (
                  <Card 
                    key={university.id} 
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => handleUniversitySelect(university)}
                  >
                    <CardHeader className="text-center">
                      <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                      <CardTitle className="text-xl">{university.code}</CardTitle>
                      <CardDescription className="text-sm">{university.name}</CardDescription>
                      {university.location && (
                        <Badge variant="outline" className="mx-auto w-fit mt-2">
                          {university.location}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full">
                        Browse {university.code} Degrees
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!loading && universities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No universities available</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Degrees View */}
      {currentView === "degrees" && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={selectedUniversity ? handleBackToUniversities : handleBackToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {selectedUniversity ? `Back to Universities` : `Back to Home`}
              </Button>
            </div>
            
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {selectedUniversity ? `${selectedUniversity.name} - Choose Your Degree` : `Choose Your Degree`}
              </h3>
              {selectedUniversity && (
                <p className="text-muted-foreground">
                  Select a degree program from {selectedUniversity.code}
                </p>
              )}
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {degrees.map((degree) => (
                  <Card 
                    key={degree.id} 
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => handleDegreeSelect(degree)}
                  >
                    <CardHeader className="text-center">
                      <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
                      <CardTitle className="text-xl">{degree.code}</CardTitle>
                      <CardDescription className="text-sm">{degree.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4">
                        {degree.description || `Access ${degree.code} resources including question papers, solved papers, and notes.`}
                      </p>
                      <Button className="w-full">
                        Browse {degree.code} Semesters
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Semesters View */}
      {currentView === "semesters" && selectedDegree && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={handleBackToDegrees}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Degrees
              </Button>
            </div>
            
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {selectedDegree.name} - Choose Semester
              </h3>
              <p className="text-muted-foreground">
                Select a semester to view available subjects
              </p>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {semesters.map((semester) => (
                  <Card 
                    key={semester.id} 
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => handleSemesterSelect(semester)}
                  >
                    <CardHeader className="text-center">
                      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">{semester.semester_number}</span>
                      </div>
                      <CardTitle className="text-lg">{semester.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full">
                        View Subjects
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!loading && semesters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No semesters available for {selectedDegree.name}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Subjects View */}
      {currentView === "subjects" && selectedSemester && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={handleBackToSemesters}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Semesters
              </Button>
            </div>
            
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {selectedDegree?.code} - {selectedSemester.name} - Choose Subject
              </h3>
              <p className="text-muted-foreground">
                Select a subject to view available question papers, solved papers, and notes
              </p>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <Card 
                    key={subject.id} 
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <CardHeader className="text-center">
                      <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <CardDescription className="text-sm">{subject.code}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground text-sm mb-4">
                        {subject.description || `Study materials for ${subject.name}`}
                      </p>
                      <Button className="w-full">
                        View {subject.code} Resources
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!loading && subjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No subjects available for {selectedSemester.name}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Resources View */}
      {currentView === "resources" && selectedSubject && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={handleBackToSubjects}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Subjects
              </Button>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {selectedDegree?.code} - {selectedSemester?.name} - {selectedSubject.name}
              </h3>
              <p className="text-muted-foreground">
                Browse and download resources for {selectedSubject.name}
              </p>
            </div>

            {/* Resource Type Filter */}
            <div className="flex justify-center space-x-2 mb-8">
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
                  className="rounded-full"
                >
                  {type.label}
                </Button>
              ))}
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.course} • {resource.year}</CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {resource.resource_type.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {resource.description || "Comprehensive study material for exam preparation"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          <Download className="h-4 w-4 inline mr-1" />
                          {resource.download_count} downloads
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(resource.id, resource.file_path, resource.title)}
                        >
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
                <p className="text-muted-foreground text-lg">
                  No {selectedType === "all" ? "resources" : selectedType.replace("_", " ")} found for {selectedSubject.name}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Comment Sections for Degrees */}
      {selectedDegree && currentView !== "home" && (
        <section className="py-16 bg-muted/30">
          <CommentSection 
            degreeId={selectedDegree.id} 
            degreeName={selectedDegree.name} 
          />
        </section>
      )}

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