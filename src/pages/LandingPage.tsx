
import { motion } from "motion/react";
import { Sparkles, Shield, Clock, ChevronRight } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage =({ onGetStarted }: LandingPageProps) =>{
  return (
    <div className="relative overflow-hidden">
      {/* Bible Versions Carousel */}
      <div className="bg-white/50 backdrop-blur-sm border-y border-stone-100 py-10 overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap">
          {[
            "King James Version (KJV)",
            "New International Version (NIV)",
            "English Standard Version (ESV)",
            "New King James Version (NKJV)",
            "New American Standard Bible (NASB)",
            "The Message (MSG)",
            "New Living Translation (NLT)",
            "King James Version (KJV)",
            "New International Version (NIV)",
            "English Standard Version (ESV)",
            "New King James Version (NKJV)",
            "New American Standard Bible (NASB)",
            "The Message (MSG)",
          ].map((version, i) => (
            <div
              key={i}
              className="flex items-center mx-12 text-stone-400 font-serif text-lg tracking-wide group"
            >
              <span className="w-2 h-2 bg-olive-200 rounded-full mr-4 group-hover:bg-olive-400 transition-colors" />
              {version}
            </div>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest text-olive-600 uppercase bg-olive-50 rounded-full">
              Your Divine AI Sermon Assistant
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-medium text-stone-900 leading-tight mb-8">
              The Intelligent Partner <br />
              <span className="italic text-olive-600">
                for Every Pastor
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-stone-600 mb-12 leading-relaxed">
              Experience the power of a dedicated AI Sermon Assistant. We help you 
              transform biblical truths into compelling, structured messages that 
              spark spiritual growth and engage your congregation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-olive-600 text-white rounded-full text-lg font-medium hover:bg-olive-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Start Using Your Assistant
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 text-stone-600 hover:text-olive-600 transition-colors font-medium">
                How It Works
              </button>
            </div>
          </motion.div>
        </div>

        {/* MVP Notice Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-32 p-8 bg-olive-50 rounded-[2rem] border border-olive-100 text-center"
        >
          <p className="text-olive-800 font-medium mb-4">
            You can generate up to 4 sermons for free. This is an early MVP, still in testing and development.
          </p>
          <p className="text-olive-700/80 text-sm leading-relaxed">
            We’d love your feedback on how to improve the tool for pastors and church leaders. <br />
            Enjoy your free trials and help us make this better!
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {[
            {
              icon: Sparkles,
              title: "Smart Assistance",
              description:
                "Your AI Assistant generates complete sermon outlines, illustrations, and prayers tailored to your unique voice.",
            },
            {
              icon: Shield,
              title: "Biblically Rooted",
              description:
                "The assistant is trained to provide accurate scripture references and deep theological insights for every message.",
            },
            {
              icon: Clock,
              title: "Ministry Focus",
              description:
                "Let your AI assistant handle the structuring so you can spend more time in prayer and with your people.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * i, duration: 0.5 }}
              className="p-8 bg-white rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-olive-50 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="text-olive-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4">
                {feature.title}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Content Repurposing Section */}
        <div className="bg-stone-900 rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-olive-400 font-semibold tracking-widest uppercase text-sm mb-4 block">
                Expand Your Ministry
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight mb-8">
                Your Assistant Works <br />
                <span className="italic text-olive-400">Beyond the Pulpit</span>
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed mb-10">
                Your AI Sermon Assistant doesn't stop at the outline. It automatically 
                transforms your message into multiple formats to keep your 
                congregation engaged all week long.
              </p>
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-stone-900 rounded-full font-medium hover:bg-stone-100 transition-all flex items-center"
              >
                Meet Your Assistant
                <ChevronRight className="ml-2 w-5 h-5 text-olive-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Social Posts",
                  desc: "5 engaging posts for Instagram, Facebook, or X.",
                  icon: "✨",
                },
                {
                  title: "Blog Articles",
                  desc: "SEO-optimized articles for your church website.",
                  icon: "📖",
                },
                {
                  title: "Devotionals",
                  desc: "Daily readings distilled from your message.",
                  icon: "🙏",
                },
                {
                  title: "Discussion Guide",
                  desc: "Small group questions to deepen the study.",
                  icon: "💡",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                >
                  <div className="text-2xl mb-4">{item.icon}</div>
                  <h4 className="text-white font-medium mb-2">{item.title}</h4>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-olive-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        </div>
      </section>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 w-1/3 h-1/3 bg-olive-50 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 -z-10 w-1/4 h-1/4 bg-olive-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2" />
    </div>
  );
}

export default LandingPage