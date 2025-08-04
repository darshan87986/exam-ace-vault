import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CommentSection } from "@/components/CommentSection";
import { 
  BookOpen, 
  Download, 
  Search, 
  FileText, 
  Users, 
  Star,
  GraduationCap,
  Upload,
  Trophy,
  Clock,
  Shield,
  Target,
  CheckCircle,
  Phone,
  Mail,
  Info
} from "lucide-react";

interface University {
  id: string;
  name: string;
  code: string;
  location?: string;
  is_active: boolean;
}

interface Degree {
  id: string;
  name: string;
  description?: string;
  university_id: string;
  is_active: boolean;
  subjects?: Subject[];
}

interface Subject {
  id: string;
  name: string;
  semester: number;
  degree_id: string;
  resources?: ExamResource[];
}

interface ExamResource {
  id: string;
  title: string;
  resource_type: string;
  file_path: string;
  subject_id: string;
  show_in_recent: boolean;
  created_at: string;
  subject_name?: string;
  degree_name?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [universities, setUniversities] = useState<University[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentResources, setRecentResources] = useState<ExamResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniversities();
    fetchRecentResources();
  }, []);

  useEffect(() => {
    if (selectedUniversity !== "all") {
      fetchDegreesByUniversity(selectedUniversity);
    } else {
      fetchAllDegrees();
    }
  }, [selectedUniversity]);

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setUniversities(data || []);
    } catch (error) {
      console.error("Error fetching universities:", error);
      toast({
        title: "Error",
        description: "Failed to load universities",
        variant: "destructive",
      });
    }
  };

  const fetchAllDegrees = async () => {
    try {
      const { data, error } = await supabase
        .from("degrees")
        .select(`
          *,
          subjects!inner(
            id,
            name,
            semester,
            exam_resources!inner(
              id,
              title,
              type,
              file_url,
              subject_id,
              show_in_recent,
              created_at
            )
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      const degreesWithSubjects = data?.map(degree => ({
        ...degree,
        subjects: degree.subjects.map((subject: any) => ({
          ...subject,
          resources: subject.exam_resources || []
        }))
      })) || [];

      setDegrees(degreesWithSubjects);
    } catch (error) {
      console.error("Error fetching degrees:", error);
      toast({
        title: "Error", 
        description: "Failed to load degrees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDegreesByUniversity = async (universityId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("degrees")
        .select(`
          *,
          subjects!inner(
            id,
            name,
            semester,
            exam_resources!inner(
              id,
              title,
              type,
              file_url,
              subject_id,
              show_in_recent,
              created_at
            )
          )
        `)
        .eq("university_id", universityId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      const degreesWithSubjects = data?.map(degree => ({
        ...degree,
        subjects: degree.subjects.map((subject: any) => ({
          ...subject,
          resources: subject.exam_resources || []
        }))
      })) || [];

      setDegrees(degreesWithSubjects);
    } catch (error) {
      console.error("Error fetching degrees by university:", error);
      toast({
        title: "Error",
        description: "Failed to load degrees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentResources = async () => {
    try {
      const { data, error } = await supabase
        .from("Exam-prep")
        .select(`
          id,
          title,
          resource_type,
          file_path,
          subject_id,
          show_in_recent,
          created_at
        `)
        .eq("show_in_recent", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      
      setRecentResources(data || []);
    } catch (error) {
      console.error("Error fetching recent resources:", error);
    }
  };

  const handleDownload = async (fileUrl: string, title: string) => {
    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${title}`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file",
        variant: "destructive",
      });
    }
  };

  const filteredDegrees = degrees.filter(degree => {
    if (searchTerm) {
      return degree.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             degree.subjects?.some(subject => 
               subject.name.toLowerCase().includes(searchTerm.toLowerCase())
             );
    }
    return true;
  });

  const getFilteredSubjects = (subjects: Subject[]) => {
    if (!subjects) return [];
    
    return subjects.map(subject => ({
      ...subject,
      resources: subject.resources?.filter(resource => {
        if (activeFilter === "all") return true;
        return resource.type === activeFilter;
      }) || []
    })).filter(subject => 
      subject.resources.length > 0 || activeFilter === "all"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Navigation */}
      <nav className="bg-card/90 backdrop-blur-md border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">StudyHub</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:text-primary">
                <Info className="h-4 w-4" />
                <span>About Us</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:text-primary">
                <Phone className="h-4 w-4" />
                <span>Contact Us</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-50"></div>
        <div className="container mx-auto px-4 relative">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
            Your Ultimate Study Resource Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Access comprehensive study materials, previous year papers, and resources for your academic success. Join thousands of students already achieving their goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why Choose StudyHub?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover what makes us the preferred choice for thousands of students
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-secondary/30">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Quality Resources</h3>
                <p className="text-muted-foreground text-sm">Curated study materials from top universities and expert faculty</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-secondary/30">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Always Updated</h3>
                <p className="text-muted-foreground text-sm">Latest exam patterns and syllabus updates for current academic year</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-secondary/30">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Secure Access</h3>
                <p className="text-muted-foreground text-sm">Safe and secure platform with reliable download links</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-secondary/30">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Exam Focused</h3>
                <p className="text-muted-foreground text-sm">Targeted preparation materials for better exam performance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-16 bg-gradient-to-br from-card/80 to-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Find Your Study Materials</h2>
            
            {/* University Filter */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">Select University</label>
              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger className="w-full h-12 border-2 border-border hover:border-primary transition-colors">
                  <SelectValue placeholder="Choose your university" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name} ({university.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by degree, subject, or resource type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-4 text-lg h-14 border-2 border-border hover:border-primary focus:border-primary transition-colors bg-card/50"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
                className="flex items-center space-x-2 h-11 px-6 transition-all duration-300 hover:scale-105"
              >
                <BookOpen className="h-4 w-4" />
                <span>All Resources</span>
              </Button>
              <Button
                variant={activeFilter === "notes" ? "default" : "outline"}
                onClick={() => setActiveFilter("notes")}
                className="flex items-center space-x-2 h-11 px-6 transition-all duration-300 hover:scale-105"
              >
                <FileText className="h-4 w-4" />
                <span>Notes</span>
              </Button>
              <Button
                variant={activeFilter === "previous_papers" ? "default" : "outline"}
                onClick={() => setActiveFilter("previous_papers")}
                className="flex items-center space-x-2 h-11 px-6 transition-all duration-300 hover:scale-105"
              >
                <Star className="h-4 w-4" />
                <span>Previous Papers</span>
              </Button>
              <Button
                variant={activeFilter === "syllabus" ? "default" : "outline"}
                onClick={() => setActiveFilter("syllabus")}
                className="flex items-center space-x-2 h-11 px-6 transition-all duration-300 hover:scale-105"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Syllabus</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Resources */}
      <section className="py-16 bg-gradient-to-br from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Recently Added Resources</h2>
          
          {recentResources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {recentResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="mb-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20">
                        {resource.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{resource.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {resource.subject_name} • {resource.degree_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Recently Added</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleDownload(resource.file_url, resource.title)}
                        className="flex items-center space-x-1 bg-gradient-to-r from-primary to-accent hover:shadow-md transition-all duration-300"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No recent resources found</p>
            </div>
          )}
        </div>
      </section>

      {/* Degrees and Resources Section */}
      <section className="py-16 bg-gradient-to-br from-background to-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Browse by Degree Program</h2>
          
          {filteredDegrees.length > 0 ? (
            <Tabs defaultValue={filteredDegrees[0]?.id} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-6 mb-8 bg-card/50 backdrop-blur-sm border border-border/50">
                {filteredDegrees.map((degree) => (
                  <TabsTrigger 
                    key={degree.id} 
                    value={degree.id} 
                    className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white transition-all duration-300"
                  >
                    {degree.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {filteredDegrees.map((degree) => (
                <TabsContent key={degree.id} value={degree.id} className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredSubjects(degree.subjects).map((subject) => (
                      <Card key={subject.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{subject.name}</span>
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">{subject.semester} Sem</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {subject.resources?.map((resource) => (
                              <div key={resource.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/30 hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium text-sm text-foreground">{resource.title}</p>
                                    <p className="text-xs text-muted-foreground">{resource.type.replace('_', ' ').toUpperCase()}</p>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDownload(resource.file_url, resource.title)}
                                  className="border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {!subject.resources || subject.resources.length === 0 && (
                              <p className="text-muted-foreground text-sm text-center py-4">No resources available yet</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Comment Section for each degree */}
                  <div className="mt-12">
                    <CommentSection degreeId={degree.id} degreeName={degree.name} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No degree programs found for the selected university</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-primary/90 to-accent/90 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <span className="text-xl font-bold">StudyHub</span>
              </div>
              <p className="text-white/80">Your trusted companion for academic excellence and study resources.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <p className="text-white/70 hover:text-white cursor-pointer transition-colors">Home</p>
                <p className="text-white/70 hover:text-white cursor-pointer transition-colors">Resources</p>
                <p className="text-white/70 hover:text-white cursor-pointer transition-colors">Degrees</p>
                <p className="text-white/70 hover:text-white cursor-pointer transition-colors">Contact</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <p className="text-white/70 hover:text-white cursor-pointer transition-colors">Help Center</p>
                <p className="text-white/70 hover:text-white cursor-pointer transition-colors">FAQ</p>
                <p className="text-white/70 hover:text-white cursor-pointer transition-colors">Contact Us</p>
                <p className="text-white/70 hover:text-white cursor-pointer transition-colors">Feedback</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-white/80">Join our community</span>
                </div>
                <p className="text-white/70">Follow us for updates and study tips</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/70">&copy; 2024 StudyHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;