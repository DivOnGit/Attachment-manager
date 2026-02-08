import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useChat, useCreateConversation } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

export function AiAnalyst({ contextZoneName }: { contextZoneName?: string }) {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { mutateAsync: createConv } = useCreateConversation();
  const { messages, sendMessage, isLoading } = useChat(conversationId);

  // Initialize conversation on mount
  useEffect(() => {
    if (!conversationId) {
      createConv("Analyst Session").then(conv => setConversationId(conv.id));
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Inject context if available
    let finalPrompt = input;
    if (contextZoneName && !input.toLowerCase().includes(contextZoneName.toLowerCase())) {
      finalPrompt = `${input} (Context: Analysis for zone ${contextZoneName})`;
    }
    
    sendMessage(finalPrompt);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-card/50 flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm">AI Demand Analyst</h3>
          <p className="text-[10px] text-muted-foreground">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Ask me about demand trends or anomaly detection.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-2",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-muted text-muted-foreground border-border"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-3 rounded-2xl max-w-[85%] leading-relaxed shadow-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border border-border rounded-tl-sm text-card-foreground"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 bg-card/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={contextZoneName ? `Ask about ${contextZoneName}...` : "Ask a question..."}
            className="flex-1 bg-background/50 border-border/50 focus:bg-background transition-all"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className={cn(
              "transition-all duration-300",
              isLoading ? "opacity-50" : "hover:scale-105 active:scale-95"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
