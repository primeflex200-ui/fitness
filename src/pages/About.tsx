import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info, Dumbbell, Users, Trophy, Heart } from "lucide-react";
import { 
  appFeatures, 
  appDescription, 
  developers, 
  vision, 
  disclaimer, 
  versionHistory,
  APP_VERSION,
  BUILD_DATE 
} from "@/config/appFeatures";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Info className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">About PRIME FLEX</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {APP_VERSION} • {BUILD_DATE}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* App Overview */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Dumbbell className="w-7 h-7 text-primary" />
              About PRIME FLEX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              {appDescription}
            </p>
          </CardContent>
        </Card>

        {/* Features Overview - AUTO-GENERATED FROM CONFIG */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Key Features & How to Use
          </h2>
          
          <div className="space-y-4">
            {appFeatures.map((feature) => (
              <Card 
                key={feature.id}
                className={
                  feature.newFeature 
                    ? "border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5" 
                    : "border-border"
                }
              >
                <CardHeader>
                  <CardTitle className="text-xl">
                    {feature.title} {feature.newFeature && "(NEW!)"}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold">How to Use:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {feature.howToUse.map((step, index) => (
                      <li key={index} dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ))}
                  </ol>
                  {feature.tips && (
                    <p className="text-sm italic text-primary">💡 Tip: {feature.tips}</p>
                  )}
                  {feature.warning && (
                    <p className="text-sm italic text-destructive">⚠️ Disclaimer: {feature.warning}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Disclaimer - AUTO-GENERATED */}
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">⚠️ Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {disclaimer}
            </p>
          </CardContent>
        </Card>

        {/* Developer Credits - AUTO-GENERATED */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Developer Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-lg font-bold">Developed By:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {developers.map((dev) => (
                  <li key={dev} className="text-lg">{dev}</li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-sm font-semibold">Vision:</p>
              <p className="text-sm italic text-muted-foreground leading-relaxed">
                "{vision}"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Version History - AUTO-GENERATED */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {versionHistory.map((version) => (
                <div key={version.version} className="flex gap-3">
                  <span className={`font-bold min-w-[60px] ${version.highlight ? 'text-primary' : ''}`}>
                    {version.version}
                  </span>
                  <span className="text-muted-foreground">{version.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;