import { useEffect, useState, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

interface GraphData {
  nodes: { id: string; val: number; mastery: number }[];
  links: { source: string; target: string }[];
}

export function RetentionGraph() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Resize observer to make graph responsive
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const data = await apiRequest<GraphData>("/api/v1/analytics/graph", {}, true);
        setGraphData(data);
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, []);

  // Center graph after loading
  useEffect(() => {
    if (graphData && fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [graphData]);

  const getNodeColor = useCallback((mastery: number) => {
    if (mastery >= 80) return "#00f59b"; // Neon Emerald (Mastered)
    if (mastery >= 50) return "#facc15"; // Bright Yellow (Learning)
    if (mastery > 0) return "#b71196ff"; // Vibrant Red (Struggling)
    return theme === 'dark' ? "#334155" : "#cbd5e1"; // Muted Gray (Prerequisite/New)
  }, [theme]);

  const getLabelColor = () => {
    return theme === 'dark' ? '#fff' : '#ffffffff';
  }

  return (
    <Card className="col-span-1 lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-xl">Dynamic Knowledge Graph</CardTitle>
        <CardDescription>
          Visualize how your concepts connect. Colors represent your mastery level (Green: Strong, Yellow: Average, Gray: Unstudied). AI automatically maps related topics as you learn!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={containerRef} 
          className="h-[400px] w-full flex items-center justify-center bg-black/5 dark:bg-black/20 rounded-b-xl overflow-hidden relative cursor-move"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Analyzing knowledge connections...</p>
            </div>
          ) : graphData && graphData.nodes.length > 0 ? (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeLabel="id"
              nodeColor={(node: any) => getNodeColor(node.mastery)}
              nodeRelSize={4}
              linkColor={() => theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              linkWidth={1.5}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              d3VelocityDecay={0.3}
              // Render labels next to nodes
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.id;
                const fontSize = 13/globalScale;
                const radius = (node.val * 2) + 1;

                // Add Glow Effect
                ctx.shadowColor = getNodeColor(node.mastery);
                ctx.shadowBlur = 15 / globalScale;
                
                // Draw Node Circle
                ctx.fillStyle = getNodeColor(node.mastery);
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fill();

                // Reset shadow for text
                ctx.shadowBlur = 0;

                // Draw Text Label
                if (globalScale > 0.8) {
                  ctx.font = `bold ${fontSize}px Inter, system-ui, Sans-Serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = getLabelColor();
                  ctx.fillText(label, node.x, node.y + radius + fontSize + 2);
                }
              }}
            />
          ) : (
            <div className="text-center p-8 bg-muted/50 rounded-lg mx-4">
              <h3 className="text-lg font-medium mb-2">Blank Slate</h3>
              <p className="text-muted-foreground">
                Your knowledge graph is empty. Start adding topics to your revision list to watch the AI build your neural network of concepts!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
