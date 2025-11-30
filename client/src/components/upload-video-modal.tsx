import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, X, Upload, Link as LinkIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadVideoModal({ open, onOpenChange }: UploadVideoModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("url");
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "file">("url");
  const [isDragging, setIsDragging] = useState(false);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    thumbnail: "",
    category: "",
    duration: "",
    intensity: "",
    difficulty: "",
    trainer: "",
    caloriePerMinute: "",
    isDraft: false,
  });
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      if (uploadMode === "file" && selectedFile) {
        // Upload file using FormData with credentials
        const formDataToSend = new FormData();
        formDataToSend.append('video', selectedFile);
        formDataToSend.append('title', data.title);
        formDataToSend.append('description', data.description || '');
        
        // Add thumbnail - either file or URL
        if (selectedThumbnailFile) {
          formDataToSend.append('thumbnailFile', selectedThumbnailFile);
        } else if (data.thumbnail) {
          formDataToSend.append('thumbnail', data.thumbnail);
        }
        
        formDataToSend.append('category', data.category);
        formDataToSend.append('duration', data.duration || '');
        formDataToSend.append('caloriePerMinute', data.caloriePerMinute || '');
        formDataToSend.append('intensity', data.intensity || '');
        formDataToSend.append('difficulty', data.difficulty || '');
        formDataToSend.append('trainer', data.trainer || '');
        formDataToSend.append('equipment', JSON.stringify(equipment));
        formDataToSend.append('isDraft', data.isDraft ? 'true' : 'false');

        const res = await fetch('/api/videos/upload', {
          method: 'POST',
          credentials: 'include',
          body: formDataToSend,
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Upload failed' }));
          throw new Error(errorData.message || 'Upload failed');
        }
        return res.json();
      } else {
        // Upload via URL
        const res = await apiRequest('POST', '/api/videos', {
          ...data,
          duration: data.duration ? parseInt(data.duration) : undefined,
          caloriePerMinute: data.caloriePerMinute ? parseFloat(data.caloriePerMinute) : undefined,
          equipment,
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Video uploaded",
        description: formData.isDraft 
          ? "Video saved as draft successfully."
          : "Video published successfully.",
      });
      // Reset form
      setFormData({
        title: "",
        description: "",
        url: "",
        thumbnail: "",
        category: "",
        duration: "",
        intensity: "",
        difficulty: "",
        trainer: "",
        caloriePerMinute: "",
        isDraft: false,
      });
      setEquipment([]);
      setSelectedFile(null);
      setSelectedThumbnailFile(null);
      setThumbnailMode("url");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on upload mode
    if (uploadMode === "file") {
      if (!formData.title || !selectedFile || !formData.category) {
        toast({
          title: "Missing required fields",
          description: "Please fill in Title, select a video file, and choose a Category.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!formData.title || !formData.url || !formData.category) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields (Title, Video URL, Category).",
          variant: "destructive",
        });
        return;
      }
    }
    
    uploadMutation.mutate(formData);
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment("");
    }
  };

  const removeEquipment = (item: string) => {
    setEquipment(equipment.filter(e => e !== item));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Check if it's a video file
      if (file.type.startsWith('video/')) {
        handleFileSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please drop a video file (MP4, WebM, MOV, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    
    toast({
      title: "Video selected",
      description: `File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleThumbnailDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsThumbnailDragging(true);
  };

  const handleThumbnailDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsThumbnailDragging(false);
  };

  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsThumbnailDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedThumbnailFile(file);
        toast({
          title: "Thumbnail selected",
          description: `File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please drop an image file (JPG, PNG, WebP, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handleThumbnailFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedThumbnailFile(file);
      toast({
        title: "Thumbnail selected",
        description: `File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Upload New Video</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-video-title"
                placeholder="e.g., Full Body Strength Training"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Strength">Strength</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                  <SelectItem value="Yoga">Yoga</SelectItem>
                  <SelectItem value="HIIT">HIIT</SelectItem>
                  <SelectItem value="Flexibility">Flexibility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="textarea-description"
              placeholder="Provide detailed instructions, benefits, and what to expect from this workout..."
            />
          </div>

          {/* Upload Mode Tabs */}
          <Tabs value={uploadMode} onValueChange={(value) => setUploadMode(value as "file" | "url")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" data-testid="tab-url">
                <LinkIcon className="h-4 w-4 mr-2" />
                Video URL
              </TabsTrigger>
              <TabsTrigger value="file" data-testid="tab-file">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="url">Video URL *</Label>
                <Input
                  id="url"
                  type="url"
                  required={uploadMode === "url"}
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  data-testid="input-url"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                />
                <p className="text-xs text-muted-foreground">
                  YouTube, Vimeo, or direct video URL
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Upload Video File *</Label>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="drop-zone-video"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    data-testid="input-video-file"
                  />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Drag and drop your video here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse your files</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: MP4, WebM, MOV • Max size: 50MB
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                      ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Thumbnail Tabs */}
          <div className="space-y-2">
            <Label>Thumbnail (optional)</Label>
            <Tabs value={thumbnailMode} onValueChange={(value) => setThumbnailMode(value as "url" | "file")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" data-testid="tab-thumbnail-url">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Thumbnail URL
                </TabsTrigger>
                <TabsTrigger value="file" data-testid="tab-thumbnail-file">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    data-testid="input-thumbnail-url"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Cover image URL (JPG, PNG, WebP, etc.)
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div
                    onDragEnter={handleThumbnailDragEnter}
                    onDragLeave={handleThumbnailDragLeave}
                    onDragOver={handleThumbnailDragOver}
                    onDrop={handleThumbnailDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isThumbnailDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                    onClick={() => thumbnailInputRef.current?.click()}
                    data-testid="drop-zone-thumbnail"
                  >
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFileInputChange}
                      className="hidden"
                      data-testid="input-thumbnail-file"
                    />
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium text-sm">Drag and drop your image here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                    {selectedThumbnailFile && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                        ✓ Selected: {selectedThumbnailFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                data-testid="input-duration"
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caloriePerMinute">Calories per Minute</Label>
              <Input
                id="caloriePerMinute"
                type="number"
                min="0"
                step="0.1"
                value={formData.caloriePerMinute}
                onChange={(e) => setFormData({ ...formData, caloriePerMinute: e.target.value })}
                data-testid="input-calorie-per-minute"
                placeholder="5.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger data-testid="select-difficulty">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="intensity">Intensity</Label>
              <Select value={formData.intensity} onValueChange={(value) => setFormData({ ...formData, intensity: value })}>
                <SelectTrigger data-testid="select-intensity">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainer">Trainer/Instructor</Label>
            <Input
              id="trainer"
              value={formData.trainer}
              onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
              data-testid="input-trainer"
              placeholder="Enter trainer name"
            />
          </div>

          <div className="space-y-2">
            <Label>Equipment Needed</Label>
            <div className="flex gap-2">
              <Input
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                placeholder="Add equipment (press Enter)"
                data-testid="input-equipment"
              />
              <Button type="button" variant="outline" onClick={addEquipment} data-testid="button-add-equipment">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add items like: dumbbells, resistance bands, yoga mat, etc.
            </p>
            {equipment.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {equipment.map((item) => (
                  <div key={item} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeEquipment(item)}
                      className="ml-1 hover:text-destructive"
                      data-testid={`button-remove-equipment-${item}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="draft"
              checked={formData.isDraft}
              onCheckedChange={(checked) => setFormData({ ...formData, isDraft: checked })}
              data-testid="switch-draft"
            />
            <Label htmlFor="draft" className="cursor-pointer">
              Save as Draft (unpublished)
            </Label>
          </div>

          <div className="flex gap-3 pt-4 flex-wrap">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={uploadMutation.isPending}
              data-testid="button-upload"
            >
              {uploadMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {formData.isDraft ? "Save as Draft" : "Publish Video"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
