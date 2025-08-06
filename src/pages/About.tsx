import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Award, TrendingUp, BookOpen, Target, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
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
              <Link to="/universities" className="text-muted-foreground hover:text-primary transition-colors">Universities</Link>
              <Link to="/about" className="text-primary font-medium">About Us</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
            </nav>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            About <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">ExamAce Vault</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Empowering students worldwide with comprehensive exam resources and study materials 
            to achieve academic excellence and unlock their full potential.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Target className="h-4 w-4 mr-2" />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Making Quality Education Accessible to Everyone
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At ExamAce Vault, we believe that every student deserves access to high-quality study materials 
                regardless of their financial background. Our mission is to democratize education by providing 
                comprehensive exam resources completely free of charge.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are committed to breaking down barriers to academic success and ensuring that financial 
                constraints never stand in the way of a student's educational journey.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 text-center">
                <BookOpen className="h-24 w-24 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-4">10,000+</h3>
                <p className="text-muted-foreground">Students Helped Worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-to-r from-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at ExamAce Vault
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-primary/5">
              <CardHeader>
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Accessibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We ensure that quality education resources are accessible to students from all walks of life, 
                  breaking down financial and geographical barriers.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-secondary/5">
              <CardHeader>
                <div className="bg-secondary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors">
                  <Award className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Every resource on our platform is carefully curated, verified for accuracy, and regularly updated 
                  to maintain the highest educational standards.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-accent/5">
              <CardHeader>
                <div className="bg-accent/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/30 transition-colors">
                  <Users className="h-8 w-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We foster a supportive learning community where students can share knowledge, collaborate, 
                  and help each other succeed academically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              Our Story
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Born from a Student's Struggle
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              ExamAce Vault was founded by a group of university students who experienced firsthand the challenges 
              of finding quality exam preparation materials. Frustrated by expensive textbooks and limited access 
              to previous year papers, they decided to create a platform that would solve these problems for 
              students everywhere.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              What started as a small collection of shared notes has grown into a comprehensive platform serving 
              thousands of students across multiple universities and degree programs. Today, ExamAce Vault continues 
              to be student-driven, constantly evolving to meet the changing needs of the academic community.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
              <blockquote className="text-xl italic text-foreground mb-4">
                "Education is the most powerful weapon which you can use to change the world."
              </blockquote>
              <cite className="text-muted-foreground">- Nelson Mandela</cite>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your journey to academic excellence today. Access thousands of resources and join 
            students who trust ExamAce Vault for their exam preparation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/">Explore Resources</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">ExamAce Vault</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 ExamAce Vault. All rights reserved. Made with ❤️ for students worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;