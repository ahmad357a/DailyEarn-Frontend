import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

const faqData = [
  {
    question: "How do the lucky draws work?",
    answer: "Every draw has a specific number of entries and a set end time. When the draw closes, we use a certified random number generator to select the winner. All participants have an equal chance of winning regardless of when they entered."
  },
  {
    question: "When will I know if I've won?",
    answer: "Winners are notified immediately via email and SMS after each draw closes. You'll also see a notification in your dashboard. We announce all winners publicly to ensure transparency."
  },
  {
    question: "How are prizes delivered?",
    answer: "Physical prizes are shipped within 24-48 hours to your registered address. Digital prizes like gift cards are delivered electronically within hours. All shipping is free and fully insured."
  },
  {
    question: "Is this legal and legitimate?",
    answer: "Yes! DailyEarn is fully licensed and regulated. We operate under strict gambling commission guidelines and maintain transparent records of all draws. All winners are real and verified."
  },
  {
    question: "Can I increase my chances of winning?",
    answer: "Each entry gives you one chance to win. You can purchase multiple entries for the same draw to increase your odds. However, each entry is treated equally in our random selection process."
  },
  {
    question: "What if I don't win?",
    answer: "While we can't guarantee wins, we run multiple draws daily with various prize levels. Many of our users eventually win by participating regularly. Remember to only spend what you can afford."
  },
  {
    question: "How do I claim my prize?",
    answer: "Prize claiming is automatic! Once you win, you'll receive detailed instructions via email. For physical prizes, we'll need to verify your shipping address. For digital prizes, they're delivered instantly."
  },
  {
    question: "Are there any hidden fees?",
    answer: "No hidden fees ever! The entry price you see is all you pay. Shipping is free, taxes are handled by us, and there are no processing charges. What you see is what you pay."
  }
];

const FAQ = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 text-primary font-medium mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            Got questions?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about DailyEarn Lucky Draw. Still have questions? Contact our support team.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="lucky-card border-none"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary hover:no-underline px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed px-6 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@dailyearn.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
            >
              Email Support
            </a>
            <a 
              href="#"
              className="inline-flex items-center justify-center px-6 py-3 bg-secondary/10 text-secondary-foreground rounded-xl hover:bg-secondary/20 transition-colors"
            >
              Live Chat
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;