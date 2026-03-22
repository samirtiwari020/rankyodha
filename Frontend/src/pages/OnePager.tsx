import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

interface OnePagerData {
  title: string;
  keyConcepts: string[];
  importantFormulas: { name: string; equation: string }[];
  weaknessAreasToFocus: string[];
  quickSummary: string;
}

export default function OnePager() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnePagerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return fallback;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const generateOnePager = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const result = await apiRequest<OnePagerData>("/api/v1/onepager/generate", {
        method: "POST",
        body: formData
      });
      setData(result);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to generate One-Pager"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">AI One-Pager Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload a PDF chapter to generate a quick-revision sheet.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 flex flex-col items-center justify-center border-dashed border-2 bg-muted/20"
      >
        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Upload your Study Material (PDF)</h3>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        <Button
          onClick={generateOnePager}
          disabled={!file || loading}
          className="w-full md:w-auto mt-2"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {loading ? "Analyzing Document..." : "Generate One-Pager"}
        </Button>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center text-sm w-full">
            <AlertCircle className="mr-2 h-4 w-4" /> {error}
          </div>
        )}
      </motion.div>

      {data && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="glass-card p-6 mt-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileText className="h-40 w-40" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            {data.title}
          </h2>
          <p className="italic text-muted-foreground mb-6 border-l-4 border-primary pl-4">
            {data.quickSummary}
          </p>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-yellow-500" /> Key Concepts
              </h3>
              <ul className="space-y-2">
                {data.keyConcepts.map((concept, idx) => (
                  <li key={idx} className="bg-muted/50 p-2 rounded-md text-sm">
                    {concept}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" /> Important Formulas
                </h3>
                <div className="grid gap-2">
                  {data.importantFormulas.map((formula, idx) => (
                    <div key={idx} className="bg-primary/5 border border-primary/20 p-3 rounded-md flex flex-col">
                      <span className="text-xs font-medium text-primary mb-1">{formula.name}</span>
                      <span className="font-mono">{formula.equation}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" /> Focus Areas
                </h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  {data.weaknessAreasToFocus.map((area, idx) => (
                     <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
