import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Key, Phone, Settings } from "lucide-react";

const IntegrationInfo = () => {
  return (
    <Card className="card-elevated border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Integration Setup</span>
        </CardTitle>
        <CardDescription>
          Complete setup instructions for production deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Backend Database */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Database & Authentication</h3>
            <Badge variant="outline" className="border-accent text-accent">Required</Badge>
          </div>
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              For user management and conversation persistence, you'll need a backend database. 
              Lovable has native Supabase integration which provides:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-3">
              <li>• User authentication (email/password)</li>
              <li>• PostgreSQL database for user data</li>
              <li>• Real-time subscriptions</li>
              <li>• Conversation history storage</li>
            </ul>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mt-3">
              <p className="text-xs text-accent font-medium mb-1">💡 Lovable Integration</p>
              <p className="text-xs text-muted-foreground">
                Click the green Supabase button in the top-right corner to connect your database and enable user management.
              </p>
            </div>
          </div>
        </div>

        {/* Bland.ai Integration */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Bland.ai Voice Engine</h3>
            <Badge variant="outline" className="border-primary text-primary">Critical</Badge>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              To enable real voice conversations, you need to integrate the Bland.ai SDK:
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <code className="bg-muted px-2 py-1 rounded text-xs block">
                npm install @bland-ai/web-sdk
              </code>
              <p>Then add your API credentials to the environment configuration.</p>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Required API Keys</h3>
            <Badge variant="outline" className="border-accent text-accent">Secure</Badge>
          </div>
          <div className="bg-muted/50 border border-muted rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground mb-1">Bland.ai</p>
                <p className="text-muted-foreground">• API Key</p>
                <p className="text-muted-foreground">• Agent ID</p>
                <p className="text-muted-foreground">• Voice ID (optional)</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Supabase</p>
                <p className="text-muted-foreground">• Project URL</p>
                <p className="text-muted-foreground">• Anon Key</p>
                <p className="text-muted-foreground">• Service Role Key</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <h4 className="font-medium text-accent mb-2">🎯 Current Implementation Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-foreground font-medium mb-1">✅ Complete</p>
              <ul className="text-muted-foreground space-y-0.5">
                <li>• UI/UX Design</li>
                <li>• Voice Interface</li>
                <li>• Transcript System</li>
                <li>• Prompt Management</li>
              </ul>
            </div>
            <div>
              <p className="text-foreground font-medium mb-1">⚙️ Ready for Integration</p>
              <ul className="text-muted-foreground space-y-0.5">
                <li>• Bland.ai SDK</li>
                <li>• Database Connection</li>
                <li>• Audio Streaming</li>
                <li>• User Management</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationInfo;