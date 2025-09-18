import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "New York, NY",
    prize: "iPhone 14 Pro",
    amount: "$5",
    rating: 5,
    text: "I couldn't believe it when I got the notification! Won an iPhone 14 Pro with just a $5 entry. DailyEarn is legit!",
    avatar: "SJ"
  },
  {
    name: "Mike Chen",
    location: "Los Angeles, CA", 
    prize: "Mystery Gift Box",
    amount: "$2",
    rating: 5,
    text: "Started with the $2 mystery box and won a $25 gift card. The whole process was super smooth and transparent.",
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    location: "Miami, FL",
    prize: "Gaming Console", 
    amount: "$5",
    rating: 5,
    text: "Won a gaming console last month! My kids were so excited. The delivery was fast and the prize was exactly as described.",
    avatar: "ER"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Happy Winners
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied winners who trusted DailyEarn with their luck. Your success story could be next!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group">
              <div className="lucky-card relative overflow-hidden group-hover:shadow-colored">
                <div className="absolute top-4 right-4 text-secondary/20">
                  <Quote className="w-8 h-8" />
                </div>

                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                {/* Winner Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                {/* Prize Badge */}
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <div className="bg-success/10 rounded-lg p-3 text-center">
                    <div className="text-sm text-success font-medium">
                      Won: {testimonial.prize}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Entry cost: {testimonial.amount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center space-x-8 bg-white/50 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-soft">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24h</div>
              <div className="text-sm text-muted-foreground">Avg. Delivery</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Secure</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;