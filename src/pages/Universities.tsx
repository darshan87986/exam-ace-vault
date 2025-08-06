import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, MapPin, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface University {
  id: string;
  name: string;
  code: string;
  location?: string;
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

const Universities = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"universities" | "degrees" | "semesters" | "subjects">("universities");
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  useEffect(() => {
    if (currentView === "universities") {
      fetchUniversities();
    } else if (currentView === "degrees") {
      fetchDegrees();
    } else if (currentView === "semesters" && selectedDegree) {
      fetchSemesters();
    } else if (currentView === "subjects" && selectedSemester) {
      fetchSubjects();
    }
  }, [currentView, selectedUniversity, selectedDegree, selectedSemester]);

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

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setSelectedDegree(null);
    setSelectedSemester(null);
    setCurrentView("degrees");
  };

  const handleDegreeSelect = (degree: Degree) => {
    setSelectedDegree(degree);
    setSelectedSemester(null);
    setCurrentView("semesters");
  };

  const handleSemesterSelect = (semester: Semester) => {
    setSelectedSemester(semester);
    setCurrentView("subjects");
  };

  const handleBackToUniversities = () => {
    setSelectedUniversity(null);
    setSelectedDegree(null);
    setSelectedSemester(null);
    setCurrentView("universities");
  };

  const handleBackToDegrees = () => {
    setSelectedDegree(null);
    setSelectedSemester(null);
    setCurrentView("degrees");
  };

  const handleBackToSemesters = () => {
    setCurrentView("semesters");
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
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/universities" className="text-primary font-medium">Universities</Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
            </nav>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <section className="py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            
            {currentView === "universities" && (
              <span className="text-primary font-medium">Universities</span>
            )}
            
            {currentView === "degrees" && (
              <>
                <Link to="/universities" className="text-muted-foreground hover:text-primary">Universities</Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-primary font-medium">{selectedUniversity?.name}</span>
              </>
            )}
            
            {currentView === "semesters" && (
              <>
                <Link to="/universities" className="text-muted-foreground hover:text-primary">Universities</Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <button onClick={handleBackToDegrees} className="text-muted-foreground hover:text-primary">{selectedUniversity?.name}</button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-primary font-medium">{selectedDegree?.name}</span>
              </>
            )}
            
            {currentView === "subjects" && (
              <>
                <Link to="/universities" className="text-muted-foreground hover:text-primary">Universities</Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <button onClick={handleBackToDegrees} className="text-muted-foreground hover:text-primary">{selectedUniversity?.name}</button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <button onClick={handleBackToSemesters} className="text-muted-foreground hover:text-primary">{selectedDegree?.name}</button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-primary font-medium">{selectedSemester?.name}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Universities View */}
      {currentView === "universities" && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Choose Your University</h1>
              <p className="text-lg text-muted-foreground">
                Select your university to browse available degree programs and resources
              </p>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {universities.map((university) => (
                  <Card 
                    key={university.id} 
                    className="group cursor-pointer bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-primary/5 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg hover:shadow-primary/10"
                    onClick={() => handleUniversitySelect(university)}
                  >
                    <CardHeader className="text-center">
                      <MapPin className="h-16 w-16 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{university.code}</CardTitle>
                      <CardDescription className="text-sm font-medium">{university.name}</CardDescription>
                      {university.location && (
                        <Badge variant="outline" className="mx-auto w-fit mt-2 border-primary/30 text-primary">
                          {university.location}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                        Browse {university.code} Degrees
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Degrees View */}
      {currentView === "degrees" && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Button variant="outline" onClick={handleBackToUniversities} className="mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Universities
            </Button>

            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {selectedUniversity?.name} - Available Degree Programs
              </h1>
              <p className="text-lg text-muted-foreground">
                Select a degree program to browse available semesters and subjects
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {degrees.map((degree) => (
                  <Card
                    key={degree.id}
                    className="group cursor-pointer bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-secondary/5 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg hover:shadow-secondary/10"
                    onClick={() => handleDegreeSelect(degree)}
                  >
                    <CardHeader className="text-center">
                      <GraduationCap className="h-16 w-16 text-secondary-foreground mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <CardTitle className="text-xl font-bold group-hover:text-secondary-foreground transition-colors">{degree.code}</CardTitle>
                      <CardDescription className="text-sm font-medium">{degree.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full bg-gradient-to-r from-secondary-foreground to-secondary/90 hover:from-secondary/90 hover:to-secondary shadow-lg hover:shadow-xl transition-all duration-300">
                        Browse {degree.code} Semesters
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
      {currentView === "semesters" && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Button variant="outline" onClick={handleBackToDegrees} className="mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Degrees
            </Button>

            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {selectedDegree?.name} - Available Semesters
              </h1>
              <p className="text-lg text-muted-foreground">
                Select a semester to browse available subjects and resources
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {semesters.map((semester) => (
                  <Card
                    key={semester.id}
                    className="group cursor-pointer bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-accent/5 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg hover:shadow-accent/10"
                    onClick={() => handleSemesterSelect(semester)}
                  >
                    <CardHeader className="text-center">
                      <Badge variant="secondary" className="mx-auto mb-4 text-lg font-bold group-hover:scale-110 transition-transform">
                        Semester {semester.semester_number}
                      </Badge>
                      <CardTitle className="text-xl font-bold group-hover:text-accent-foreground transition-colors">{semester.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full bg-gradient-to-r from-accent-foreground to-accent/90 hover:from-accent/90 hover:to-accent shadow-lg hover:shadow-xl transition-all duration-300">
                        Browse {semester.name} Subjects
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Subjects View */}
      {currentView === "subjects" && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Button variant="outline" onClick={handleBackToSemesters} className="mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Semesters
            </Button>

            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {selectedSemester?.name} - Available Subjects
              </h1>
              <p className="text-lg text-muted-foreground">
                Select a subject to access resources and materials
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {subjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className="group cursor-pointer bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-primary/5 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg hover:shadow-primary/10"
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{subject.code}</CardTitle>
                      <CardDescription className="text-sm font-medium">{subject.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                        Access {subject.name} Resources
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Universities;
