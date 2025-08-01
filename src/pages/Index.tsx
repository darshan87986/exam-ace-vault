import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, BookOpen, FileText, GraduationCap, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resources, setResources] = useState<ExamResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("Exam-prep")
        .select("*")
        .eq("is_published", true)
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

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = 
      resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.course?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || resource.resource_type === selectedType;
    
    return matchesSearch && matchesType;
  });

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
              <Link to="/resources" className="text-muted-foreground hover:text-foreground">All Resources</Link>
              <Link to="/subjects" className="text-muted-foreground hover:text-foreground">Subjects</Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </nav>
            <Button asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Your Ultimate
            <span className="text-primary"> Exam Resource </span>
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

          {/* Filter Tabs */}
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
                className="rounded-full"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose ExamAce Vault?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Comprehensive Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Thousands of question papers, solved papers, and study notes covering all major subjects and courses.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>High Quality Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All resources are carefully curated and verified for accuracy. Get the most reliable study materials.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Free Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete free access to all resources. No hidden fees, no subscriptions. Education should be accessible to all.
                </CardDescription>
              </CardContent>
            </Card>
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
              <p className="text-muted-foreground text-lg">No resources found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-foreground">ExamAce Vault</span>
              </div>
              <p className="text-muted-foreground">
                Your trusted platform for academic resources and exam preparation materials.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/resources" className="hover:text-foreground">All Resources</Link></li>
                <li><Link to="/subjects" className="hover:text-foreground">Browse by Subject</Link></li>
                <li><Link to="/search" className="hover:text-foreground">Advanced Search</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <p className="text-muted-foreground mb-4">
                Stay updated with the latest resources and exam tips.
              </p>
              <Button className="w-full">Subscribe to Updates</Button>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ExamAce Vault. All rights reserved. Built with ❤️ for students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;