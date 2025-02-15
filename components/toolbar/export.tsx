"use client";

import { useEffect, useState } from "react";
import { useLayerStore } from "@/lib/layer-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";

export default function ExportAsset({ resource }: { resource: string }) {
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const [selected, setSelected] = useState("original");

  useEffect(() => {
    if (typeof window === "undefined") return;
  }, []);

  const handleDownload = async () => {
    if (!activeLayer?.publicId) return;
    
    try {
      const res = await fetch(
        `/api/download?publicId=${activeLayer.publicId}&quality=${selected}&resource_type=${activeLayer.resourceType}&format=${activeLayer.format}&url=${activeLayer.url}`
      );
      if (!res.ok) throw new Error("Failed to fetch image URL");
  
      const data = await res.json();
      if (data.error) throw new Error(data.error);
  
      const imageResponse = await fetch(data.url);
      if (!imageResponse.ok) throw new Error("Failed to fetch image");
  
      const imageBlob = await imageResponse.blob();
      const downloadUrl = URL.createObjectURL(imageBlob);
  
      
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
  
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  

  return (
    <Dialog>
      <DialogTrigger disabled={!activeLayer?.url} asChild>
        <Button variant="outline" className="py-8">
          <span className="flex gap-1 items-center justify-center flex-col text-xs font-medium">
            Export
            <Download size={18} />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div>
          <h3 className="text-center text-2xl font-medium pb-4">Export</h3>
          <div className="flex flex-col gap-4">
            {["original", "large", "medium", "small"].map((size, index) => (
              <Card
                key={index}
                onClick={() => setSelected(size)}
                className={cn(selected === size ? "border-primary" : "", "p-4 cursor-pointer")}
              >
                <CardContent className="p-0">
                  <CardTitle className="text-md">{size.charAt(0).toUpperCase() + size.slice(1)}</CardTitle>
                  <CardDescription>
                    {Math.round(activeLayer.width! * (size === "original" ? 1 : size === "large" ? 0.7 : size === "medium" ? 0.5 : 0.3))}X
                    {Math.round(activeLayer.height! * (size === "original" ? 1 : size === "large" ? 0.7 : size === "medium" ? 0.5 : 0.3))}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Button onClick={handleDownload}>
          Download {selected} {resource}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
