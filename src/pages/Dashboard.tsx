import { useState,useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import type { Sermon } from "../types";
import { PlusCircle, Library, Clock, ChevronRight } from "lucide-react";
import { formatDate } from "../lib/utils";
import type { View } from "../App";

interface DashboardProps {
    onNavigate: (view: View) => void;
    onSermonClick: (id: string) => void;
}


const Dashboard = ({ onNavigate, onSermonClick, }: DashboardProps) => {
    

  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "sermons"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(3),
        );
        const snapshot = await getDocs(q);
        setRecentSermons(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Sermon),
        );
      } catch (error) {
        console.error("Failed to fetch recent sermons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

    
    
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif font-medium mb-2">
            Welcome back,
          </h1>
          <p className="text-stone-600">
            What will you share with your congregation today?
          </p>
        </div>
        <button
          onClick={() => onNavigate("generator")}
          className="bg-olive-600 text-white px-6 py-3 rounded-full flex items-center hover:bg-olive-700 transition-all shadow-sm"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Sermon
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-serif font-semibold mb-4">
            Quick Actions
          </h2>
          <button
            onClick={() => onNavigate("generator")}
            className="w-full p-6 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all text-left flex items-center group"
          >
            <div className="w-12 h-12 bg-olive-50 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-olive-100 transition-colors">
              <PlusCircle className="text-olive-600 w-6 h-6" />
            </div>
            <div>
              <div className="font-medium">Generate Sermon</div>
              <div className="text-xs text-stone-500">
                Create a new message from scratch
              </div>
            </div>
          </button>
          <button
            onClick={() => onNavigate("library")}
            className="w-full p-6 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all text-left flex items-center group"
          >
            <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-stone-100 transition-colors">
              <Library className="text-stone-600 w-6 h-6" />
            </div>
            <div>
              <div className="font-medium">Sermon Library</div>
              <div className="text-xs text-stone-500">
                Access your past messages
              </div>
            </div>
          </button>
        </div>

        {/* Recent Sermons */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-semibold">Recent Sermons</h2>
            <button
              onClick={() => onNavigate("library")}
              className="text-sm text-olive-600 hover:underline"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-white rounded-3xl animate-pulse border border-stone-100"
                />
              ))}
            </div>
          ) : recentSermons.length > 0 ? (
            <div className="space-y-4">
              {recentSermons.map((sermon) => (
                <button
                  key={sermon.id}
                  onClick={() => onSermonClick(sermon.id!)}
                  className="w-full p-6 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-olive-50 rounded-full flex items-center justify-center mr-4">
                      <Clock className="text-olive-600 w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium group-hover:text-olive-600 transition-colors">
                        {sermon.title}
                      </div>
                      <div className="text-xs text-stone-500">
                        {sermon.topic} • {formatDate(sermon.createdAt)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-stone-300 group-hover:text-olive-600 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-dashed border-stone-200 text-center">
              <p className="text-stone-500 italic">
                No sermons yet. Start by generating your first one!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard