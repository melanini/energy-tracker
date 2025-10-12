import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Ryze and how does it help me with my energy?",
    answer: "Ryze is an energy tracker app designed to help you understand the precise relationship between your daily activities, lifestyle choices, and your resulting energy levels. You log your activities, key variables (like nutrition, hydration, sleep quality, etc.), and your perceived energy. Ryze then uses advanced analytics and AI explanations to pinpoint your energy correlations, providing deep insights into what truly boosts or drains you."
  },
  {
    question: "Why should I track activities and variables if I already know that I feel tired?",
    answer: "Subjective feelings are important. Sometimes it's difficult for us to identify what truly impacts your energy levels. For example, a 'fun' social activity might feel energizing in the moment, but the data might show it's actually contributing to an energy crash the next day. By tracking the details, Ryze helps you find the true underlying causes of your energy shifts. The AI explanations specifically bridge the gap between your feelings and the objective data, leading to more sustainable, informed habits."
  },
  {
    question: "How often should I log my energy levels in Ryze?",
    answer: "We strongly recommend logging your perceived energy at least 3-4 times per day (e.g., upon waking, mid-morning, after lunch, and before bed). Consistent, frequent logging is crucial because it allows Ryze to capture your energy fluctuations accurately and generate reliable time distribution breakdowns and energy correlations linked to specific activities."
  },
  {
    question: "What kind of information should I be tracking in Ryze?",
    answer: "Ryze focuses on high-impact variables, including: Time Usage (how you spend your time for the Time Distribution Breakdown), Nutrition & Hydration (amount of fruits and veggies eaten, fluid intake), Social Activities (time spent with others and their perceived impact), Perceived Sleep Quality (how rested you feel), and Other Variables (stress levels, caffeine intake, mood, etc)."
  },
  {
    question: "What kind of analytics does Ryze offer?",
    answer: "Ryze offers powerful analytics to transform your raw data into actionable insights: Energy Correlations (identifying which specific variables have the strongest positive or negative link to your energy scores), Time Distribution Breakdown (showing exactly how your time is allocated across different activity types and correlating that allocation with your energy levels), and Trends (highlighting patterns over time like weekly energy dips, seasonal changes, or the long-term impact of a new routine)."
  },
  {
    question: "How does the Ryze AI help me understand my data?",
    answer: "The Ryze AI acts as your personal energy coach, providing plain-language explanations for the complex analytics. Instead of just showing you a correlation graph, the AI will explain: 'Your data suggests a strong negative correlation between screen time after 9 PM and your next-day morning energy score. Consider a digital detox an hour before bed.' It translates data into direct, understandable advice."
  },
  {
    question: "I feel great, but my analytics show a negative correlation with my activities. Why the difference?",
    answer: "This discrepancy is where Ryze provides the most value. Your current good feeling (subjective score) might be a temporary boost (from excitement, caffeine, or an important win). However, the energy correlations and trends reveal the unsustainable underlying reality (like accumulated sleep debt or emotional stress). Ryze helps you look past the momentary feeling to the long-term energy truth, enabling you to build habits that are genuinely sustainable."
  },
  {
    question: "How long until I start seeing meaningful patterns and AI explanations?",
    answer: "We recommend tracking consistently for at least 2-4 weeks. This duration provides enough data across different variables, days of the week, and energy fluctuations for Ryze's analytics engine and AI to generate reliable, personalized correlations and explanations about your unique energy profile."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8f5f2' }}>
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-neutral-600">
            Everything you need to know about Ryze
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white border border-neutral-200 rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger 
                className="text-left font-semibold text-neutral-900 transition-colors"
                style={{ 
                  color: '#1f2937'
                }}
              >
                <span className="hover:bg-gradient-to-r hover:from-[#f5855f] hover:to-[#953599] hover:bg-clip-text hover:text-transparent transition-all">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

