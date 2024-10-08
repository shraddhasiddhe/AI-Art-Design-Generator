"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, RefreshCw, Download, Upload, Plus, Minus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Shape {
  type: string
  x: number
  y: number
  size: number
  color: string
}

const generateArt = (
  category: string,
  complexity: number,
  text: string,
  canvas: HTMLCanvasElement,
  fontSize: number,
  fontStyle: string,
  textColor: string,
  uploadedImage: HTMLImageElement | null,
  particleEffect: string,
  glowIntensity: number,
  animationSpeed: number,
  backgroundStyle: string,
  shapes: Shape[]
) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Generate interesting background
  switch (backgroundStyle) {
    case 'fractal':
      generateFractalBackground(ctx, canvas.width, canvas.height)
      break
    case 'voronoi':
      generateVoronoiBackground(ctx, canvas.width, canvas.height)
      break
    case 'flow':
      generateFlowFieldBackground(ctx, canvas.width, canvas.height)
      break
    default:
      generateGradientBackground(ctx, canvas.width, canvas.height)
  }

  // Function to check if a point is within the uploaded image area
  const isInUploadedImageArea = (x: number, y: number): boolean => {
    if (!uploadedImage) return false
    const scale = Math.min(canvas.width / uploadedImage.width, canvas.height / uploadedImage.height)
    const imageWidth = uploadedImage.width * scale
    const imageHeight = uploadedImage.height * scale
    const imageX = (canvas.width - imageWidth) / 2
    const imageY = (canvas.height - imageHeight) / 2
    return x >= imageX && x <= imageX + imageWidth && y >= imageY && y <= imageY + imageHeight
  }

  // Generate shapes based on category and complexity
  const autoShapes = Math.floor(complexity / 10) + 5
  for (let i = 0; i < autoShapes; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    if (!isInUploadedImageArea(x, y)) {
      ctx.beginPath()
      if (category === 'geometric') {
        const size = Math.random() * 100 + 50
        ctx.rect(x, y, size, size)
      } else if (category === 'abstract') {
        ctx.moveTo(x, y)
        ctx.bezierCurveTo(
          Math.random() * canvas.width, Math.random() * canvas.height,
          Math.random() * canvas.width, Math.random() * canvas.height,
          Math.random() * canvas.width, Math.random() * canvas.height
        )
      } else if (category === 'futuristic') {
        ctx.arc(x, y, Math.random() * 50 + 10, 0, Math.PI * 2)
      } else if (category === 'nature') {
        // Draw a simple tree
        ctx.moveTo(x, y)
        ctx.lineTo(x, y - 50)
        ctx.arc(x, y - 70, 20, 0, Math.PI * 2)
      } else if (category === 'minimalist') {
        // Draw a simple line
        ctx.moveTo(x, y)
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      }
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`
      ctx.fill()
      ctx.stroke()
    }
  }

  // Draw user-added shapes
  shapes.forEach(shape => {
    if (!isInUploadedImageArea(shape.x, shape.y)) {
      ctx.beginPath()
      if (shape.type === 'circle') {
        ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2)
      } else if (shape.type === 'square') {
        ctx.rect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size)
      } else if (shape.type === 'triangle') {
        ctx.moveTo(shape.x, shape.y - shape.size / 2)
        ctx.lineTo(shape.x - shape.size / 2, shape.y + shape.size / 2)
        ctx.lineTo(shape.x + shape.size / 2, shape.y + shape.size / 2)
        ctx.closePath()
      }
      ctx.fillStyle = shape.color
      ctx.fill()
      ctx.stroke()
    }
  })

  // Add particle effect
  if (particleEffect !== 'none') {
    const particles = 100
    for (let i = 0; i < particles; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      if (!isInUploadedImageArea(x, y)) {
        ctx.beginPath()
        if (particleEffect === 'stardust') {
          ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`
        } else if (particleEffect === 'fireflies') {
          ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 0, ${Math.random() * 0.5 + 0.5})`
        }
        ctx.fill()
      }
    }
  }

  // Add glow effect
  ctx.shadowBlur = glowIntensity
  ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'

  // Add text overlay
  if (text) {
    ctx.font = `${fontStyle} ${fontSize}px Arial`
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  }

  // Simulate animation (in a real implementation, this would be done with requestAnimationFrame)
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(Date.now() * animationSpeed / 1000) * 0.1 + 0.1})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw uploaded image if available
  if (uploadedImage) {
    const scale = Math.min(canvas.width / uploadedImage.width, canvas.height / uploadedImage.height)
    const x = (canvas.width / 2) - (uploadedImage.width / 2) * scale
    const y = (canvas.height / 2) - (uploadedImage.height / 2) * scale
    ctx.drawImage(uploadedImage, x, y, uploadedImage.width * scale, uploadedImage.height * scale)
  }
}

const generateGradientBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, `hsl(${Math.random() * 360}, 100%, 50%)`)
  gradient.addColorStop(1, `hsl(${Math.random() * 360}, 100%, 50%)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

const generateFractalBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const maxIterations = 100
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let a = (x - width / 2) * 4 / width
      let b = (y - height / 2) * 4 / height
      let ca = a
      let cb = b
      let n = 0
      while (n < maxIterations) {
        const aa = a * a - b * b
        const bb = 2 * a * b
        a = aa + ca
        b = bb + cb
        if (a * a + b * b > 16) {
          break
        }
        n++
      }
      const hue = (n / maxIterations) * 360
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      ctx.fillRect(x, y, 1, 1)
    }
  }
}

const generateVoronoiBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const points = Array.from({ length: 20 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`
  }))

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let minDist = Infinity
      let closestPoint
      for (const point of points) {
        const dist = Math.hypot(x - point.x, y - point.y)
        if (dist < minDist) {
          minDist = dist
          closestPoint = point
        }
      }
      ctx.fillStyle = closestPoint!.color
      ctx.fillRect(x, y, 1, 1)
    }
  }
}

const generateFlowFieldBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const scale = 0.01
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const angle = (Math.sin(x * scale) + Math.cos(y * scale)) * Math.PI
      const hue = (angle + Math.PI) / (2 * Math.PI) * 360
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      ctx.fillRect(x, y, 1, 1)
    }
  }
}

export default function AIArtGenerator() {
  const [category, setCategory] = useState("geometric")
  const [complexity, setComplexity] = useState(50)
  const [purpose, setPurpose] = useState("social")
  const [isGenerating, setIsGenerating] = useState(false)
  const [textEnabled, setTextEnabled] = useState(false)
  const [customText, setCustomText] = useState("")
  const [fontSize, setFontSize] = useState(30)
  const [fontStyle, setFontStyle] = useState("normal")
  const [textColor, setTextColor] = useState("#ffffff")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null)
  const [particleEffect, setParticleEffect] = useState("none")
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(0)
  const [backgroundStyle, setBackgroundStyle] = useState("gradient")
  const [shapes, setShapes] = useState<Shape[]>([])
  const [currentShape, setCurrentShape] = useState<Shape>({
    type: 'circle',
    x: 400,
    y: 300,
    size: 50,
    color: '#000000'
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSuggestions(["Abstract Neon", "Minimalist Shapes", "Futuristic Cityscape", "Natural Patterns", "Geometric Harmony"])
  }, [])

  const handleGenerate = async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing time
    if (canvasRef.current) {
      generateArt(
        category,
        complexity,
        textEnabled ? customText : "",
        canvasRef.current,
        fontSize,
        fontStyle,
        textColor,
        uploadedImage,
        particleEffect,
        glowIntensity,
        animationSpeed,
        backgroundStyle,
        shapes
      )
    }
    setIsGenerating(false)
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = 'generated-art.png'
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setUploadedImage(img)
          handleGenerate()
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddShape = () => {
    setShapes([...shapes, currentShape])
    setCurrentShape({
      ...currentShape,
      x: Math.random() * 800,
      y: Math.random() * 600
    })
    handleGenerate()
  }

  const handleRemoveShape = (index: number) => {
    const newShapes = shapes.filter((_, i) => i !== index)
    setShapes(newShapes)
    handleGenerate()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">AI Art & Design Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Art Category</Label>
            <Select value={category}   onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geometric">Geometric Patterns</SelectItem>
                <SelectItem value="abstract">Abstract Art</SelectItem>
                <SelectItem value="futuristic">Futuristic Landscapes</SelectItem>
                <SelectItem value="nature">Natural Patterns</SelectItem>
                <SelectItem value="minimalist">Minimalist Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="backgroundStyle">Background Style</Label>
            <Select value={backgroundStyle} onValueChange={setBackgroundStyle}>
              <SelectTrigger id="backgroundStyle">
                <SelectValue placeholder="Select a background style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="fractal">Fractal</SelectItem>
                <SelectItem value="voronoi">Voronoi</SelectItem>
                <SelectItem value="flow">Flow Field</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="complexity">Complexity</Label>
            <Slider
              id="complexity"
              min={0}
              max={100}
              step={1}
              value={[complexity]}
              onValueChange={(value) => setComplexity(value[0])}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="purpose">Design Purpose</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger id="purpose">
                <SelectValue placeholder="Select a purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social">Social Media Banner</SelectItem>
                <SelectItem value="website">Website Background</SelectItem>
                <SelectItem value="poster">Poster Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="particleEffect">Particle Effect</Label>
            <Select value={particleEffect} onValueChange={setParticleEffect}>
              <SelectTrigger id="particleEffect">
                <SelectValue placeholder="Select a particle effect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="stardust">Stardust</SelectItem>
                <SelectItem value="fireflies">Fireflies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="glowIntensity">Glow Intensity</Label>
            <Slider
              id="glowIntensity"
              min={0}
              max={20}
              step={1}
              value={[glowIntensity]}
              onValueChange={(value) => setGlowIntensity(value[0])}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="animationSpeed">Animation Speed</Label>
            <Slider
              id="animationSpeed"
              min={0}
              max={10}
              step={0.1}
              value={[animationSpeed]}
              onValueChange={(value) => setAnimationSpeed(value[0])}
              className="mt-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="text"
              checked={textEnabled}
              onCheckedChange={setTextEnabled}
            />
            <Label htmlFor="text">Add Text Overlay</Label>
          </div>

          {textEnabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="customText">Custom Text</Label>
                <Input
                  id="customText"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your text here"
                />
              </div>
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Slider
                  id="fontSize"
                  min={10}
                  max={100}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="fontStyle">Font Style</Label>
                <Select value={fontStyle} onValueChange={setFontStyle}>
                  <SelectTrigger id="fontStyle">
                    <SelectValue placeholder="Select a font style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="italic">Italic</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="bold italic">Bold Italic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <Input
                  id="textColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-full"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="imageUpload">Upload Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Image
              </Button>
              {uploadedImage && (
                <span className="text-sm text-muted-foreground">Image uploaded</span>
              )}
            </div>
          </div>

          {uploadedImage && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Image Uploaded</AlertTitle>
              <AlertDescription>
                The uploaded image will be placed on top of the generated art. No designs will be added on top of your image.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label>Add Shapes</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Select value={currentShape.type} onValueChange={(value) => setCurrentShape({...currentShape, type: value})}>
                <SelectTrigger id="shapeType">
                  <SelectValue placeholder="Shape Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="color"
                value={currentShape.color}
                onChange={(e) => setCurrentShape({...currentShape, color: e.target.value})}
                className="w-12 h-10"
              />
              <Slider
                min={10}
                max={200}
                step={1}
                value={[currentShape.size]}
                onValueChange={(value) => setCurrentShape({...currentShape, size: value[0]})}
                className="w-24"
              />
              <Button onClick={handleAddShape}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {shapes.length > 0 && (
            <div>
              <Label>Added Shapes</Label>
              <div className="space-y-2 mt-2">
                {shapes.map((shape, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{`${shape.type} (${shape.x.toFixed(0)}, ${shape.y.toFixed(0)})`}</span>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveShape(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Art'
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleGenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Suggested Designs</h2>
          <div className="flex space-x-2">
            {suggestions.map((suggestion, index) => (
              <Button key={index} variant="secondary" onClick={() => setCategory(suggestion.toLowerCase())}>
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
