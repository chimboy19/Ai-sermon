import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import type { Sermon } from "../types";
import {
  Search,
  Trash2,
  BookOpen,
  Clock,
  Calendar,
  Library,
} from "lucide-react";
import { formatDate } from "../lib/utils";

interface LibraryPageProps {
  onSermonClick: (id: string) => void;
}

const LibraryPage = ({ onSermonClick }: LibraryPageProps) => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSermons = async () => {
      if (!auth.currentUser) return;

      try {
        setLoading(true);

        const q = query(
          collection(db, "sermons"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc"),
        );

        const snapshot = await getDocs(q);

        const sermonsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Sermon[];

        setSermons(sermonsData);
      } catch (error) {
        console.error("Failed to fetch sermons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);


  

  /* ---------- DELETE SERMON ---------- */



  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this sermon?",
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "sermons", id));

      // safer state update
      setSermons((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };



  
  /* ---------- FILTER SERMONS ---------- */

  const filteredSermons = sermons.filter((s) => {
    const search = searchTerm.toLowerCase();

    return (
      (s.title ?? "").toLowerCase().includes(search) ||
      (s.topic ?? "").toLowerCase().includes(search) ||
      (s.biblePassage ?? "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-medium mb-2">
            Sermon Library
          </h1>
          <p className="text-stone-600">
            Your collection of inspired messages.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title, topic, or scripture..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-olive-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-white rounded-4xl animate-pulse border border-stone-100"
            />
          ))}
        </div>
      ) : filteredSermons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons.map((sermon) => (
            <div
              key={sermon.id}
              onClick={() => onSermonClick(sermon.id!)}
              className="group bg-white p-8 rounded-4xl border border-stone-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-olive-50 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-olive-600 w-5 h-5" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, sermon.id!)}
                    className="p-2 text-stone-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-olive-600 transition-colors">
                  {sermon.title}
                </h3>
                <p className="text-sm text-stone-500 mb-4 line-clamp-2">
                  {sermon.introduction}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-50 space-y-2">
                <div className="flex items-center text-xs text-stone-400">
                  <Calendar className="w-3 h-3 mr-2" />
                  {formatDate(sermon.createdAt)}
                </div>
                <div className="flex items-center text-xs text-stone-400">
                  <Clock className="w-3 h-3 mr-2" />
                  {sermon.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-stone-200">
          <Library className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 italic">
            No sermons found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};
export default LibraryPage