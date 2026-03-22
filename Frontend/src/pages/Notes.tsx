import { motion, type Variants } from "framer-motion";
import { FileText, Sparkles, Trash2, Save, PlusCircle, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

const fadeUp: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

type NoteItem = {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  updatedAt?: string;
};

export default function Notes() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<NoteItem[]>("/api/v1/notes", { method: "GET" }, true);
      const list = Array.isArray(data) ? data : [];
      setNotes(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0]._id);
        setTitle(list[0].title);
        setContent(list[0].content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const selectNote = (note: NoteItem) => {
    setSelectedId(note._id);
    setTitle(note.title);
    setContent(note.content);
  };

  const createNewDraft = () => {
    setSelectedId(null);
    setTitle("");
    setContent("");
  };

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (selectedId) {
        await apiRequest<NoteItem>(
          `/api/v1/notes/${selectedId}`,
          {
            method: "PUT",
            body: JSON.stringify({ title, content }),
          },
          true
        );
      } else {
        const created = await apiRequest<NoteItem>(
          "/api/v1/notes",
          {
            method: "POST",
            body: JSON.stringify({ title, content }),
          },
          true
        );
        setSelectedId(created._id);
      }

      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!selectedId) return;

    setSaving(true);
    setError("");
    try {
      await apiRequest<{ success: boolean }>(`/api/v1/notes/${selectedId}`, { method: "DELETE" }, true);
      setSelectedId(null);
      setTitle("");
      setContent("");
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    if (!content.trim()) return [];
    return content
      .split(/\n+/)
      .map((line) => line.replace(/^#+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 6);
  }, [content]);

  if (loading) {
    return <div className="max-w-6xl mx-auto">Loading notes...</div>;
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">Notes</h1>
        <p className="text-muted-foreground text-sm mt-1">Create and manage notes from backend database</p>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <Button variant="outline" className="gap-2" onClick={createNewDraft}>
          <PlusCircle className="h-4 w-4" /> New Note
        </Button>
        <Button variant="gradient" className="gap-2" onClick={saveNote} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Note"}
        </Button>
        <Button variant="outline" className="gap-2" onClick={deleteNote} disabled={!selectedId || saving}>
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </motion.div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid lg:grid-cols-[0.8fr_1.2fr_1fr] gap-6">
        <motion.div variants={fadeUp} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <List className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Saved Notes</h3>
          </div>
          <div className="space-y-2 max-h-80 overflow-auto pr-1">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              notes.map((note) => (
                <button
                  key={note._id}
                  onClick={() => selectNote(note)}
                  className={`w-full rounded-lg border p-3 text-left ${
                    selectedId === note._id ? "border-cyan-500/40 bg-cyan-500/10" : "border-border/60 bg-muted/20"
                  }`}
                >
                  <p className="text-sm font-medium line-clamp-1">{note.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{note.updatedAt ? new Date(note.updatedAt).toLocaleString() : ""}</p>
                </button>
              ))
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Editor</h3>
          </div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" className="mb-3" />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-72 bg-transparent text-sm leading-relaxed outline-none resize-none placeholder:text-muted-foreground"
            placeholder="Start writing your notes..."
          />
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-sm">Quick Summary</h3>
          </div>
          {summary.length === 0 ? (
            <p className="text-sm text-muted-foreground">Write a note to generate a quick summary.</p>
          ) : (
            <ul className="space-y-2">
              {summary.map((point, i) => (
                <li key={`${point}-${i}`} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
