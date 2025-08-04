import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  user_name: string;
  comment_text: string;
  created_at: string;
}

interface CommentSectionProps {
  degreeId: string;
  degreeName: string;
}

export const CommentSection = ({ degreeId, degreeName }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [degreeId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("degree_comments")
        .select("id, user_name, comment_text, created_at")
        .eq("degree_id", degreeId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !userName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("degree_comments")
        .insert({
          degree_id: degreeId,
          user_name: userName.trim(),
          user_email: userEmail.trim() || null,
          comment_text: newComment.trim(),
        });

      if (error) throw error;

      toast({
        title: "Comment Submitted",
        description: "Your comment has been submitted for review and will appear once approved.",
      });

      setNewComment("");
      setUserName("");
      setUserEmail("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Comments for {degreeName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Your Name *"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full"
              />
              <Input
                type="email"
                placeholder="Your Email (Optional)"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <Textarea
              placeholder="Write your comment here... *"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              className="min-h-[100px] w-full"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit Comment"}
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <h4 className="font-semibold text-sm sm:text-base">{comment.user_name}</h4>
                      <span className="text-xs text-muted-foreground mt-1 sm:mt-0">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-foreground break-words">
                      {comment.comment_text}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};