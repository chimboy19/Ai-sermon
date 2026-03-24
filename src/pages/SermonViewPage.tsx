import { useState,useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Sermon, UserProfile } from "../types";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Sparkles,
  Loader2,
  Check,
  Copy,
  MessageSquare,
  FileText,
  Users,
  Heart,
  Quote,
  Lock,
} from "lucide-react";
import { motion } from "motion/react";
import { formatDate } from "../lib/utils";
import { repurposeSermon, generateSermonImage } from "../services/geminiService";
import ReactMarkdown from "react-markdown";

interface SermonViewPageProps {
  sermonId: string;
  userProfile: UserProfile | null;
  onBack: () => void;
}

export default function SermonViewPage({sermonId,userProfile,onBack,}: SermonViewPageProps) {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [repurposing, setRepurposing] = useState<string | null>(null);
  const [repurposedData, setRepurposedData] = useState<string | Record<string, any> | null>(null);
  const [repurposeError, setRepurposeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSermon, setEditedSermon] = useState<Sermon | null>(null);

  const isTrialExhausted = (userProfile?.sermonCount || 0) >= 4;



  useEffect(() => {
    let isMounted = true;

    const fetchSermon = async () => {
      try {
        setLoading(true);
        const docSnap = await getDoc(doc(db, "sermons", sermonId));
        if (!isMounted) return;

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Sermon;
          setSermon(data);
          setEditedSermon(data);
        }
      } catch (error) {
        console.error("Failed to fetch sermon:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSermon();

    return () => {
      isMounted = false;
    };
  }, [sermonId]);




  const handleSave = async () => {
    if (!editedSermon) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, "sermons", sermonId), {
        ...editedSermon,
        updatedAt: new Date().toISOString(),
      });
      setSermon(editedSermon);
      setIsEditing(false);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };



  const handleRepurpose = async (
  target: "social" | "blog" | "devotional" | "discussion") => {
    
  if (!sermon) return;

  setRepurposing(target);
  setRepurposedData(null);
  setRepurposeError(null);

  try {
    const data = (await repurposeSermon(sermon, target)) as any;

    if (target === "social" && Array.isArray(data.posts)) {
      const postsWithImages = await Promise.all(
        data.posts.map(async (post: any) => {
          try {
            const image = await generateSermonImage(post.visualIdea);
            return { ...post, image };
          } catch {
            return post;
          }
        })
      );

      setRepurposedData({ posts: postsWithImages });

    } else if (target === "blog" || target === "devotional") {
      try {
        if (data.visualIdea) {
          const image = await generateSermonImage(data.visualIdea);
          setRepurposedData({ ...data, image });
        } else {
          setRepurposedData(data);
        }
      } catch {
        setRepurposedData(data);
      }

    } else {
      setRepurposedData(data);
    }

  } catch (error: any) {
    console.error("Repurposing failed:", error);
    setRepurposeError(error.message || "Failed to repurpose sermon. Please check your console or network tab.");
  } finally {
    setRepurposing(null);
  }
};




  const handleCopy = () => {
    let textToCopy = "";

    if (typeof repurposedData === "string") {
      textToCopy = repurposedData;
    } else if (repurposedData?.posts) {
      textToCopy = repurposedData.posts
        .map((p: any) => p.content ?? "")
        .join("\n\n---\n\n");
    } else if (repurposedData?.content) {
      textToCopy = repurposedData.content;
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = (imageDataUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };





  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse bg-white rounded-3xl h-96" />
    );



  if (!sermon)
    return <div className="text-center py-20">Sermon not found.</div>;
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-stone-500 hover:text-olive-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </button>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg text-sm font-medium flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Edit Sermon
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-sm border border-stone-100">
          <div className="mb-12">
            {isEditing ? (
              <input
                className="text-4xl md:text-5xl font-serif font-medium mb-6 leading-tight w-full border-b border-stone-200 focus:border-olive-600 outline-none"
                value={editedSermon?.title}
                onChange={(e) =>
                  setEditedSermon((prev) =>
                    prev ? { ...prev, title: e.target.value } : null,
                  )
                }
              />
            ) : (
              <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6 leading-tight">
                {sermon.title}
              </h1>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-stone-500">
              <span className="px-3 py-1 bg-stone-50 rounded-full">
                {sermon.biblePassage}
              </span>
              <span className="px-3 py-1 bg-stone-50 rounded-full">
                {sermon.topic}
              </span>
              <span className="px-3 py-1 bg-stone-50 rounded-full">
                {formatDate(sermon.createdAt)}
              </span>
            </div>
          </div>

          <div className="prose prose-stone max-w-none font-serif text-lg leading-relaxed space-y-12">
            <section>
              <h2 className="text-2xl font-semibold text-olive-600 mb-4 italic">
                Introduction
              </h2>
              {isEditing ? (
                <textarea
                  className="w-full h-32 p-4 bg-stone-50 rounded-xl border border-stone-100 focus:ring-2 focus:ring-olive-500 outline-none"
                  value={editedSermon?.introduction}
                  onChange={(e) =>
                    setEditedSermon((prev) =>
                      prev ? { ...prev, introduction: e.target.value } : null,
                    )
                  }
                />
              ) : (
                <p className="text-stone-700">{sermon.introduction}</p>
              )}
            </section>

            {/* Bible Verses Section */}
            {(sermon.verses?.length > 0 || isEditing) && (
              <section className="bg-olive-50/30 p-8 rounded-3xl border border-olive-100/50">
                <h2 className="text-xl font-semibold text-olive-700 mb-4 flex items-center italic">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Supporting Scripture
                </h2>
                {isEditing ? (
                  <textarea
                    className="w-full h-32 p-4 bg-white rounded-xl border border-stone-100 focus:ring-2 focus:ring-olive-500 outline-none"
                    value={editedSermon?.verses?.join("\n")}
                    placeholder="Enter Bible verses (one per line)..."
                    onChange={(e) =>
                      setEditedSermon((prev) =>
                        prev ? { ...prev, verses: e.target.value.split("\n") } : null,
                      )
                    }
                  />
                ) : (
                  <ul className="space-y-3">
                    {sermon.verses?.map((verse, i) => (
                      <li key={i} className="flex items-start text-olive-900/80 italic">
                        <span className="mr-3 text-olive-400">•</span>
                        {verse}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
  
            {/* Illustration Section */}
            {(sermon.illustration || isEditing) && (
              <section className="bg-stone-50/50 p-8 rounded-3xl border border-stone-100">
                <h2 className="text-xl font-semibold text-stone-700 mb-4 flex items-center italic">
                  <Quote className="w-5 h-5 mr-2 text-olive-600" />
                  Sermon Illustration
                </h2>
                {isEditing ? (
                  <textarea
                    className="w-full h-32 p-4 bg-white rounded-xl border border-stone-100 focus:ring-2 focus:ring-olive-500 outline-none"
                    value={editedSermon?.illustration}
                    placeholder="Enter a sermon story or illustration..."
                    onChange={(e) =>
                      setEditedSermon((prev) =>
                        prev ? { ...prev, illustration: e.target.value } : null,
                      )
                    }
                  />
                ) : (
                  <p className="text-stone-700 italic border-l-4 border-olive-200 pl-6">
                    {sermon.illustration}
                  </p>
                )}
              </section>
            )}

            <section className="space-y-12">
              {(isEditing ? editedSermon?.points : sermon.points)?.map(
                (point, i) => (
                  <div
                    key={i}
                    className="relative pl-8 border-l-2 border-olive-100"
                  >
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-olive-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          className="text-2xl font-semibold mb-2 w-full border-b border-stone-100 focus:border-olive-600 outline-none"
                          value={point.title}
                          onChange={(e) => {
                            const newPoints = [...(editedSermon?.points || [])];
                            newPoints[i].title = e.target.value;
                            setEditedSermon((prev) =>
                              prev ? { ...prev, points: newPoints } : null,
                            );
                          }}
                        />
                        <textarea
                          className="w-full h-48 p-4 bg-stone-50 rounded-xl border border-stone-100 focus:ring-2 focus:ring-olive-500 outline-none"
                          value={point.content}
                          onChange={(e) => {
                            const newPoints = [...(editedSermon?.points || [])];
                            newPoints[i].content = e.target.value;
                            setEditedSermon((prev) =>
                              prev ? { ...prev, points: newPoints } : null,
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-semibold mb-4">
                          {point.title}
                        </h3>
                        <p className="text-stone-700">{point.content}</p>
                      </>
                    )}
                  </div>
                ),
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-olive-600 mb-4 italic">
                Conclusion
              </h2>
              {isEditing ? (
                <textarea
                  className="w-full h-32 p-4 bg-stone-50 rounded-xl border border-stone-100 focus:ring-2 focus:ring-olive-500 outline-none"
                  value={editedSermon?.conclusion}
                  onChange={(e) =>
                    setEditedSermon((prev) =>
                      prev ? { ...prev, conclusion: e.target.value } : null,
                    )
                  }
                />
              ) : (
                <p className="text-stone-700">{sermon.conclusion}</p>
              )}
            </section>

            <section className="bg-olive-50 p-8 rounded-3xl border border-olive-100">
              <h2 className="text-xl font-semibold text-olive-700 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Closing Prayer
              </h2>
              {isEditing ? (
                <textarea
                  className="w-full h-24 p-4 bg-white/50 rounded-xl border border-olive-200 focus:ring-2 focus:ring-olive-500 outline-none italic"
                  value={editedSermon?.prayer}
                  onChange={(e) =>
                    setEditedSermon((prev) =>
                      prev ? { ...prev, prayer: e.target.value } : null,
                    )
                  }
                />
              ) : (
                <p className="text-olive-900 italic">{sermon.prayer}</p>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Sidebar - Repurposing & Tools */}
      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
          <h2 className="text-xl font-serif font-semibold mb-6 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-olive-600" />
            AI Repurposing
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { id: "social", label: "Social Posts", icon: MessageSquare },
              { id: "blog", label: "Blog Article", icon: FileText },
              { id: "devotional", label: "Devotional", icon: Heart },
              { id: "discussion", label: "Discussion", icon: Users },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleRepurpose(tool.id as any)}
                disabled={repurposing !== null || isTrialExhausted}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all group relative ${
                  isTrialExhausted 
                    ? "border-stone-100 bg-stone-50/50 cursor-not-allowed" 
                    : "border-stone-100 hover:border-olive-200 hover:bg-olive-50"
                }`}
              >
                <tool.icon className={`w-6 h-6 mb-2 transition-colors ${
                  isTrialExhausted ? "text-stone-300" : "text-stone-400 group-hover:text-olive-600"
                }`} />
                <span className={`text-xs font-medium ${
                  isTrialExhausted ? "text-stone-400" : "text-stone-600"
                }`}>
                  {tool.label}
                </span>
                {isTrialExhausted && (
                  <div className="absolute top-1 right-1">
                    <Lock className="w-3 h-3 text-stone-300" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {isTrialExhausted && (
            <div className="mb-8 p-4 bg-olive-50 rounded-2xl border border-olive-100">
              <p className="text-xs text-olive-800 leading-relaxed font-medium">
               Your free trial has ended. We’re still improving the system — full access will be available soon
              </p>
            </div>
          )}

          {repurposing && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-olive-600 animate-spin" />
            </div>
          )}

          {repurposeError && (
            <div className="mb-8 p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-xs text-red-800 leading-relaxed font-medium">
                Error: {repurposeError}
              </p>
            </div>
          )}

          {repurposedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
                  Result
                </h3>
                <button
                  onClick={handleCopy}
                  className="p-2 text-stone-400 hover:text-olive-600 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {typeof repurposedData === "string" ? (
                  <div className="p-4 bg-stone-50 rounded-2xl text-sm text-stone-700 prose prose-sm">
                    <ReactMarkdown>{repurposedData}</ReactMarkdown>
                  </div>
                ) : repurposedData.posts ? (
                  repurposedData.posts.map((post: any, i: number) => (
                    <div
                      key={i}
                      className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-100"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-olive-600 uppercase">
                          Post {i + 1}
                        </span>
                      </div>
                      {post.image && (
                        <div className="relative group/img rounded-xl overflow-hidden border border-stone-200">
                          <img
                            src={post.image}
                            alt={`Visual for post ${i + 1}`}
                            className="w-full h-auto object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => handleDownloadImage(post.image, `social-post-${i + 1}`)}
                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-stone-600 opacity-0 group-hover/img:opacity-100 transition-opacity hover:text-olive-600"
                            title="Download Image"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="text-sm text-stone-700 prose prose-sm">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                      </div>
                      <div className="pt-2 border-t border-stone-200">
                        <p className="text-[10px] text-stone-400 italic">
                          Visual Idea: {post.visualIdea}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    {repurposedData.image && (
                      <div className="relative group/img rounded-2xl overflow-hidden border border-stone-200">
                        <img
                          src={repurposedData.image}
                          alt="Repurposed content image"
                          className="w-full h-auto object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => handleDownloadImage(repurposedData.image, `repurposed-${sermon.title.toLowerCase().replace(/\s+/g, '-')}`)}
                          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm text-stone-600 opacity-0 group-hover/img:opacity-100 transition-opacity hover:text-olive-600"
                          title="Download Image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <div className="p-4 bg-stone-50 rounded-2xl text-sm text-stone-700 prose prose-sm">
                      <ReactMarkdown>
                        {typeof repurposedData.content === "string" 
                          ? repurposedData.content 
                          : repurposedData.content 
                            ? JSON.stringify(repurposedData.content, null, 2) 
                            : "No content was generated. Please try again."}
                      </ReactMarkdown>
                    </div>
                    {repurposedData.visualIdea && (
                      <p className="text-[10px] text-stone-400 italic px-4">
                        Visual Idea: {repurposedData.visualIdea}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
          <h2 className="text-xl font-serif font-semibold mb-6">
            Sermon Details
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Bible Passage</span>
              <span className="font-medium">{sermon.biblePassage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Audience</span>
              <span className="font-medium">{sermon.audience}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Length</span>
              <span className="font-medium">{sermon.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Denomination</span>
              <span className="font-medium">{sermon.denomination}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
