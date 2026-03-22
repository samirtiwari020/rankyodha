import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, FileText, AlertCircle, Loader2, BookOpen, Zap, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

interface OnePagerData {
  title: string;
  keyConcepts: string[];
  importantFormulas: { name: string; equation: string }[];
  weaknessAreasToFocus: string[];
  quickSummary: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardHoverVariants = {
  hover: {
    y: -5,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.3 },
  },
};

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-4"
          >
            <BookOpen className="h-12 w-12 mx-auto text-primary" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 py-2 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            AI One-Pager Generator
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your study materials into beautifully organized revision sheets powered by AI
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileHover="hover"
          variants={cardHoverVariants}
          className="mb-8"
        >
          <div className="relative group">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-background/80 backdrop-blur-xl p-8 sm:p-12 rounded-2xl border border-primary/10 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[350px]">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-50"></div>
                  <Upload className="h-16 w-16 text-primary relative" />
                </div>
              </motion.div>
              
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Upload Study Material</h3>
              <p className="text-muted-foreground text-center mb-8">Select a PDF to generate your revision sheet</p>
              
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mb-6 text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-primary file:to-accent file:text-white hover:file:shadow-lg file:transition file:cursor-pointer"
              />
              
              {file && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-sm text-primary mb-6 bg-primary/10 px-4 py-2 rounded-lg"
                >
                  <Check className="h-4 w-4" />
                  {file.name}
                </motion.div>
              )}
              
              <Button
                onClick={generateOnePager}
                disabled={!file || loading}
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate One-Pager
                  </>
                )}
              </Button>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 w-full p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-600 rounded-xl border border-red-500/20 flex items-start"
                  >
                    <AlertCircle className="mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
            >
              {/* Title Section */}
              <motion.div
                variants={itemVariants}
                className="mb-8"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-background/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl border border-primary/10">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                      {data.title}
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed border-l-4 border-gradient bg-gradient-to-r from-primary/20 to-accent/20 pl-6 py-4 rounded-r-lg">
                      {data.quickSummary}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Content Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid lg:grid-cols-2 gap-8 mb-8"
              >
                {/* Key Concepts */}
                <motion.div variants={itemVariants} whileHover="hover" className="group">
                  <div className="relative h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-yellow-400/20 h-full">
                      <motion.div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="mr-3"
                          >
                            <Sparkles className="h-6 w-6 text-yellow-500" />
                          </motion.div>
                          Key Concepts
                        </h3>
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-2xl"
                        >
                          ✨
                        </motion.div>
                      </motion.div>
                      <ul className="space-y-3">
                        {data.keyConcepts.map((concept, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ x: 5, backgroundColor: "rgba(234, 179, 8, 0.1)" }}
                            className="bg-yellow-400/5 hover:bg-yellow-400/10 p-3 rounded-lg text-sm font-medium border border-yellow-400/20 transition-all duration-300 cursor-pointer"
                          >
                            <span className="text-yellow-600">•</span> {concept}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Focus Areas */}
                <motion.div variants={itemVariants} whileHover="hover" className="group">
                  <div className="relative h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-red-400/30 to-pink-400/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-red-400/20 h-full">
                      <motion.div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold flex items-center">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="mr-3"
                          >
                            <Target className="h-6 w-6 text-red-500" />
                          </motion.div>
                          Focus Areas
                        </h3>
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="text-2xl"
                        >
                          🎯
                        </motion.div>
                      </motion.div>
                      <ul className="space-y-3">
                        {data.weaknessAreasToFocus.map((area, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                            className="bg-red-400/5 hover:bg-red-400/10 p-3 rounded-lg text-sm font-medium border border-red-400/20 transition-all duration-300 cursor-pointer"
                          >
                            <span className="text-red-600">▸</span> {area}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Important Formulas */}
              <motion.div variants={itemVariants} whileHover="hover" className="group">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-blue-400/20">
                    <motion.div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold flex items-center">
                        <motion.div
                          animate={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="mr-3"
                        >
                          <Zap className="h-6 w-6 text-blue-500" />
                        </motion.div>
                        Important Formulas
                      </h3>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="text-2xl"
                      >
                        ⚡
                      </motion.div>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {data.importantFormulas.map((formula, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{
                            scale: 1.05,
                            translateY: -5,
                          }}
                          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-400/30 p-4 rounded-xl transition-all duration-300 cursor-pointer group/card"
                        >
                          <span className="text-xs font-bold text-blue-600 mb-2 block uppercase tracking-wider">{formula.name}</span>
                          <div className="font-mono text-sm font-semibold text-foreground bg-black/20 p-3 rounded-lg break-all group-hover/card:bg-black/40 transition-colors">
                            {formula.equation}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
