import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Mail, Phone, MapPin, Clock, Send, MessageCircle, HelpCircle, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
              <Link to="/universities" className="text-muted-foreground hover:text-primary transition-colors">Universities</Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="text-primary font-medium">Contact Us</Link>
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
            Get in <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions, suggestions, or need help? We're here to assist you on your academic journey. 
            Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-primary/5">
              <CardHeader>
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Email Us</CardTitle>
                <CardDescription>Send us a message anytime</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-medium mb-2">support@examacevault.com</p>
                <p className="text-muted-foreground text-sm">We respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-secondary/5">
              <CardHeader>
                <div className="bg-secondary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors">
                  <MessageCircle className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Live Chat</CardTitle>
                <CardDescription>Chat with our team</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-foreground font-medium mb-2">Available 24/7</p>
                <p className="text-muted-foreground text-sm">Instant support and guidance</p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-accent/5">
              <CardHeader>
                <div className="bg-accent/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/30 transition-colors">
                  <HelpCircle className="h-8 w-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Help Center</CardTitle>
                <CardDescription>Find answers quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-accent-foreground font-medium mb-2">FAQ & Guides</p>
                <p className="text-muted-foreground text-sm">Self-service support</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gradient-to-r from-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Send us a Message</h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16">
              {/* Contact Form */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Contact Form</CardTitle>
                  <CardDescription className="text-center">
                    We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What is this message about?"
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        required
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <div className="space-y-8">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="h-8 w-8 text-primary" />
                      <CardTitle className="text-xl">Response Time</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">General Inquiries:</span>
                        <span className="font-medium">Within 24 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Technical Support:</span>
                        <span className="font-medium">Within 12 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Urgent Issues:</span>
                        <span className="font-medium">Within 6 hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-secondary/10 to-secondary/5">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <FileQuestion className="h-8 w-8 text-secondary-foreground" />
                      <CardTitle className="text-xl">Common Topics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Resource requests and suggestions</li>
                      <li>• Technical issues and bug reports</li>
                      <li>• Account and access problems</li>
                      <li>• Partnership and collaboration</li>
                      <li>• Content contribution guidelines</li>
                      <li>• General feedback and improvements</li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-6 text-center">
                  <h3 className="text-xl font-bold text-foreground mb-3">Prefer Direct Contact?</h3>
                  <p className="text-muted-foreground mb-4">
                    You can also reach us directly at our support email for immediate assistance.
                  </p>
                  <Button asChild variant="outline" className="border-accent/30 text-accent-foreground hover:bg-accent/10">
                    <a href="mailto:support@examacevault.com">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Support
                    </a>
                  </Button>
                </div>
              </div>
            </div>
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

export default Contact;