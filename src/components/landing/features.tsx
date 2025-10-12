import { Card, CardContent } from "@/components/ui/card";
import { 
  Activity, 
  Brain, 
  Lightbulb, 
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Track Daily Inputs",
    description: "Log sleep, meals, exercise, and mood with simple, intuitive tracking that takes seconds."
  },
  {
    icon: Brain,
    title: "Cognitive Insights",
    description: "Understand how your daily habits affect focus, clarity, and mental performance."
  },
  {
    icon: Sparkles,
    title: "Pattern Discovery",
    description: "AI-powered analysis reveals personal patterns you never knew existed."
  },
  {
    icon: Lightbulb,
    title: "Daily Insights",
    description: "Get actionable recommendations to boost your physical and mental energy."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
            Understand Your Energy at a{" "}
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #f5855f 0%, #960047 50%, #953599 100%)' }}
            >
              Glance
            </span>
          </h2>
          <p className="text-lg text-neutral-600">
            Intuitive analytics to help you discover what truly impacts your energy levels
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-neutral-200 hover:border-purple-300 transition-all hover:shadow-lg group"
              >
                <CardContent className="pt-6 space-y-4">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ 
                      backgroundColor: '#953599'
                    }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-neutral-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mt-32">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
              How it works
            </h2>
            <p className="text-lg text-neutral-600">
              Start optimizing your energy in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Track Your Day",
                description: "Log your sleep, meals, activities, and how you feel in just seconds each day."
              },
              {
                step: "02",
                title: "Discover Patterns",
                description: "Our AI analyzes your data to uncover connections between your habits and energy levels."
              },
              {
                step: "03",
                title: "Optimize & Thrive",
                description: "Receive personalized insights and recommendations to boost your energy and feel your best."
              }
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div 
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full text-white font-bold text-xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #f5855f 0%, #960047 50%, #953599 100%)' 
                  }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {item.title}
                </h3>
                <p className="text-neutral-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

