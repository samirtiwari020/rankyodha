import { useEffect, useState, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useCourse } from "@/contexts/CourseContext";

interface GraphData {
  nodes: { id: string; val: number; mastery: number }[];
  links: { source: string; target: string }[];
}

export function RetentionGraph() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedCourse } = useCourse();
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Animation loop for jiggle effect
  useEffect(() => {
    let animationFrameId: number;
    if (hoverNode) {
      const loop = () => {
        setTick((t) => t + 1);
        animationFrameId = requestAnimationFrame(loop);
      };
      loop();
    } else {
      setTick(0);
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [hoverNode]);

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
      setLoading(true);
      try {
        const data = await apiRequest<GraphData>(`/api/v1/analytics/graph?course=${selectedCourse}`, {}, true);
        setGraphData(data);
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [selectedCourse]);

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
              onNodeHover={(node: any) => setHoverNode(node ? node.id : null)}
              // Render labels inside nodes
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.id;
                const isHovered = node.id === hoverNode;
                const fontSize = (isHovered ? 14 : 12) / globalScale;
                
                ctx.font = `bold ${fontSize}px Inter, system-ui, Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                
                // Calculate dynamic radius to fit text, with padding
                const baseRadius = (node.val * 2) + (isHovered ? 6 : 2);
                const radius = Math.max(textWidth / 2 + (8 / globalScale), baseRadius);

                let drawX = node.x;
                let drawY = node.y;

                // Apply jiggle movement if hovered
                if (isHovered) {
                  drawX += Math.sin(tick / 4) * (2 / globalScale);
                  drawY += Math.cos(tick / 4) * (2 / globalScale);
                }

                // Add Glow Effect
                ctx.shadowColor = getNodeColor(node.mastery);
                ctx.shadowBlur = (isHovered ? 25 : 15) / globalScale;
                
                // Draw Node Circle
                ctx.fillStyle = getNodeColor(node.mastery);
                ctx.beginPath();
                ctx.arc(drawX, drawY, radius, 0, 2 * Math.PI, false);
                ctx.fill();

                // Reset shadow for text
                ctx.shadowBlur = 0;

                // Draw Text Label INSIDE
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Determine text color for contrast
                const isDarkTheme = theme === 'dark';
                const isMutedGray = node.mastery === 0; // Mastery 0 is gray
                
                if (isMutedGray && isDarkTheme) {
                  ctx.fillStyle = '#ffffff'; // White text on dark gray nodes in dark mode
                } else if (isMutedGray && !isDarkTheme) {
                  ctx.fillStyle = '#0f1319'; // Dark text on light gray nodes in light mode
                } else {
                  // For neon colors (emerald, yellow, red), dark text usually looks sharpest and most modern
                  ctx.fillStyle = '#111827'; 
                }
                
                ctx.fillText(label, drawX, drawY);
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
