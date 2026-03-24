import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Loader2,
  ChevronRight,
  BookOpen,
  Users,
  Clock,
  Cross,
} from "lucide-react";
import { generateSermon } from "../services/geminiService";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import type { Sermon, UserProfile } from "../types";

interface GeneratorPageProps {
  userProfile: UserProfile | null;
  onSermonGenerated: (id: string) => void;
  onProfileUpdate: (updated: UserProfile) => void;
}

const GeneratorPage =({userProfile,onSermonGenerated, onProfileUpdate,}: GeneratorPageProps)=> {
  const [loading, setLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    helped: "",
    features: "",
    wouldPay: "",
  });

  const [formData, setFormData] = useState({
    topic: "",
    biblePassage: "",
    audience: "General Congregation",
    length: "20-30 minutes",
    denomination: "Non-denominational",
  });




  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !userProfile) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "feedback"), {
        userId: auth.currentUser.uid,
        ...feedbackData,
        createdAt: new Date().toISOString(),
      });
      
      const updatedProfile = { ...userProfile, feedbackSubmitted: true };
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        feedbackSubmitted: true
      });
      onProfileUpdate(updatedProfile);
      alert("Thank you for your feedback! It helps us improve the assistant.");
    } catch (error) {
      console.error("Feedback failed:", error);
    } finally {
      setLoading(false);
    }
  };




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !userProfile) {
      alert("Please sign in to generate a sermon.");
      return;
    }

    setLoading(true);

    try {
      const result = await generateSermon(formData);

      const newSermon: Sermon = {
        ...formData,
        userId: auth.currentUser.uid,
        title: result.title || "Untitled Sermon",
        introduction: result.introduction || "",
        points: result.points || [],
        verses: result.verses || [],
        applications: result.applications || [],
        conclusion: result.conclusion || "",
        prayer: result.prayer || "",
        illustration: result.illustration || "",
        fullText: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saveToFirestore = addDoc(collection(db, "sermons"), newSermon);
      const updateCount = updateDoc(doc(db, "users", auth.currentUser.uid), {
        sermonCount: increment(1)
      });

      const timeout = new Promise((_, reject) => 
        setTimeout(() => {
          reject(new Error("Operation timed out. Please check your connection."));
        }, 15000)
      );

      await Promise.all([
        Promise.race([saveToFirestore, timeout]),
        updateCount
      ]);
      
      onProfileUpdate({ ...userProfile, sermonCount: (userProfile.sermonCount || 0) + 1 });
      
      const docRef = await saveToFirestore;
      onSermonGenerated(docRef.id);
    } catch (error: any) {
      console.error("Generation/Save failed", error);
      alert("Error: " + (error.message || "Failed to generate sermon"));
    } finally {
      setLoading(false);
    }
  };

  

  const currentCount = userProfile?.sermonCount || 0;
  const isTrialExhausted = currentCount >= 4;


  if (isTrialExhausted && !userProfile?.feedbackSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-medium mb-4 text-stone-900">Trial Period Feedback</h2>
            <p className="text-stone-600">You've reached your free trial limit of 4 sermons. We'd love to hear your thoughts!</p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Did this tool help you prepare sermons?</label>
              <select 
                required
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 outline-none"
                value={feedbackData.helped}
                onChange={(e) => setFeedbackData({...feedbackData, helped: e.target.value})}
              >
                <option value="">Select an option</option>
                <option value="very">Yes, very much</option>
                <option value="somewhat">Somewhat</option>
                <option value="not">Not really</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">What features would you like to see?</label>
              <textarea 
                required
                className="w-full h-24 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 outline-none"
                placeholder="Share your ideas..."
                value={feedbackData.features}
                onChange={(e) => setFeedbackData({...feedbackData, features: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Would you pay for this tool?</label>
              <select 
                required
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 outline-none"
                value={feedbackData.wouldPay}
                onChange={(e) => setFeedbackData({...feedbackData, wouldPay: e.target.value})}
              >
                <option value="">Select an option</option>
                <option value="yes">Yes</option>
                <option value="maybe">Maybe</option>
                <option value="no">No</option>
              </select>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-olive-600 text-white rounded-2xl font-medium hover:bg-olive-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Feedback"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (isTrialExhausted && userProfile?.feedbackSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white p-12 rounded-[3rem] shadow-sm border border-stone-100"
        >
          <div className="w-20 h-20 bg-olive-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-olive-600" />
          </div>
          <h2 className="text-4xl font-serif font-medium mb-6">Trial Completed</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            You've successfully used all 4 of your free sermon trials. We hope the assistant has been a blessing to your ministry!
          </p>
          <div className="p-6 bg-stone-50 rounded-2xl text-stone-500 text-sm italic">
            "Go into all the world and preach the gospel to all creation." — Mark 16:15
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-medium mb-4">New Sermon</h1>
        <div className="flex flex-col items-center gap-4">
          <p className="text-stone-600">
            Provide a few details and let AI help you craft your message.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-olive-50 rounded-full border border-olive-100">
            <Sparkles className="w-4 h-4 text-olive-600 mr-2" />
            <span className="text-sm font-medium text-olive-800">
              {4 - currentCount} trial{4 - currentCount !== 1 ? 's' : ''} remaining
            </span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-olive-600" />
                Topic or Theme
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Forgiveness, Hope in Trials"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-transparent outline-none transition-all"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-olive-600" />
                Bible Passage
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Psalm 23, John 3:16"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-transparent outline-none transition-all"
                value={formData.biblePassage}
                onChange={(e) =>
                  setFormData({ ...formData, biblePassage: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 flex items-center">
                <Users className="w-4 h-4 mr-2 text-olive-600" />
                Target Audience
              </label>
              <select
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                value={formData.audience}
                onChange={(e) =>
                  setFormData({ ...formData, audience: e.target.value })
                }
              >
                <option>General Congregation</option>
                <option>Youth Ministry</option>
                <option>Men's Group</option>
                <option>Women's Group</option>
                <option>Children's Ministry</option>
                <option>New Believers</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-olive-600" />
                Sermon Length
              </label>
              <select
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                value={formData.length}
                onChange={(e) =>
                  setFormData({ ...formData, length: e.target.value })
                }
              >
                <option>10-15 minutes</option>
                <option>20-30 minutes</option>
                <option>40-50 minutes</option>
                <option>Short Devotional (5 min)</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-stone-700 flex items-center">
                <Cross className="w-4 h-4 mr-2 text-olive-600" />
                Denomination / Style
              </label>
              <select
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                value={formData.denomination}
                onChange={(e) =>
                  setFormData({ ...formData, denomination: e.target.value })
                }
              >
                <option>Non-denominational</option>
                <option>Baptist</option>
                <option>Pentecostal</option>
                <option>Catholic</option>
                <option>Evangelical</option>
                <option>Liturgical</option>
                <option>Conversational</option>
              </select>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-olive-600 text-white rounded-2xl font-medium hover:bg-olive-700 transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating your message...
              </>
            ) : (
              <>
                Generate Sermon
                <ChevronRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default GeneratorPage