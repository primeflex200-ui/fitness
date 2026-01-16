import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import { toast } from "sonner";

const BodyFatCalculator = () => {
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [neck, setNeck] = useState<string>("");
  const [waist, setWaist] = useState<string>("");
  const [hip, setHip] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("");

  const calculateBodyFat = () => {
    // Validate inputs
    if (!gender || !age || !weight || !height || !neck || !waist) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (gender === "female" && !hip) {
      toast.error("Hip measurement is required for females");
      return;
    }

    const heightNum = parseFloat(height);
    const neckNum = parseFloat(neck);
    const waistNum = parseFloat(waist);
    const hipNum = gender === "female" ? parseFloat(hip) : 0;

    // US Navy Method for Body Fat Calculation
    let bodyFatPercentage: number;

    if (gender === "male") {
      // Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
      bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waistNum - neckNum) + 0.15456 * Math.log10(heightNum)) - 450;
    } else {
      // Female formula: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
      bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waistNum + hipNum - neckNum) + 0.22100 * Math.log10(heightNum)) - 450;
    }

    setBodyFat(parseFloat(bodyFatPercentage.toFixed(1)));
    setCategory(getBodyFatCategory(bodyFatPercentage, gender));
    toast.success("Body fat percentage calculated!");
  };

  const getBodyFatCategory = (bf: number, gen: string): string => {
    if (gen === "male") {
      if (bf < 6) return "Essential Fat";
      if (bf < 14) return "Athletes";
      if (bf < 18) return "Fitness";
      if (bf < 25) return "Average";
      return "Obese";
    } else {
      if (bf < 14) return "Essential Fat";
      if (bf < 21) return "Athletes";
      if (bf < 25) return "Fitness";
      if (bf < 32) return "Average";
      return "Obese";
    }
  };

  const getCategoryColor = (cat: string): string => {
    switch (cat) {
      case "Essential Fat":
      case "Athletes":
        return "text-green-500";
      case "Fitness":
        return "text-blue-500";
      case "Average":
        return "text-yellow-500";
      case "Obese":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const reset = () => {
    setGender("");
    setAge("");
    setWeight("");
    setHeight("");
    setNeck("");
    setWaist("");
    setHip("");
    setBodyFat(null);
    setCategory("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/diet">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Calculator className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Body Fat Calculator</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Calculate Your Body Fat %</h1>
          <p className="text-muted-foreground">
            Using the US Navy Method for accurate body fat estimation
          </p>
        </div>

        {/* Calculator Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Your Measurements</CardTitle>
            <CardDescription>All measurements should be in centimeters (cm)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gender */}
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age and Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>

            {/* Height */}
            <div>
              <Label htmlFor="height">Height (cm) *</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            {/* Neck */}
            <div>
              <Label htmlFor="neck">Neck Circumference (cm) *</Label>
              <Input
                id="neck"
                type="number"
                step="0.1"
                placeholder="38"
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Measure around the neck at the narrowest point
              </p>
            </div>

            {/* Waist */}
            <div>
              <Label htmlFor="waist">Waist Circumference (cm) *</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                placeholder="85"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Measure at the navel level (belly button)
              </p>
            </div>

            {/* Hip (for females) */}
            {gender === "female" && (
              <div>
                <Label htmlFor="hip">Hip Circumference (cm) *</Label>
                <Input
                  id="hip"
                  type="number"
                  step="0.1"
                  placeholder="95"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Measure at the widest point of the hips
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={calculateBodyFat} className="flex-1">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate
              </Button>
              <Button onClick={reset} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Card */}
        {bodyFat !== null && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-transparent animate-fade-in">
            <CardHeader>
              <CardTitle>Your Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="text-6xl font-bold text-primary mb-2">{bodyFat}%</div>
                <div className={`text-2xl font-semibold ${getCategoryColor(category)}`}>
                  {category}
                </div>
              </div>

              {/* Category Ranges */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold mb-3">Body Fat Categories ({gender === "male" ? "Male" : "Female"})</h4>
                <div className="space-y-2 text-sm">
                  {gender === "male" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-green-500">Essential Fat:</span>
                        <span>2-5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-500">Athletes:</span>
                        <span>6-13%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-500">Fitness:</span>
                        <span>14-17%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-500">Average:</span>
                        <span>18-24%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-500">Obese:</span>
                        <span>25%+</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-green-500">Essential Fat:</span>
                        <span>10-13%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-500">Athletes:</span>
                        <span>14-20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-500">Fitness:</span>
                        <span>21-24%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-500">Average:</span>
                        <span>25-31%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-500">Obese:</span>
                        <span>32%+</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6 border-blue-500/50 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-2">How to Measure:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use a flexible measuring tape</li>
                  <li>Measure in the morning before eating</li>
                  <li>Keep the tape snug but not tight</li>
                  <li>Take measurements 3 times and use the average</li>
                  <li>This method has ±3-4% accuracy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BodyFatCalculator;
