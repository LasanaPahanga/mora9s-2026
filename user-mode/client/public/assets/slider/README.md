# Image Slider Setup

## Current Status
The slider is currently using **online placeholder images** from Unsplash. To use your own tournament images, follow the instructions below.

## How to Add Your Custom Images

### Option 1: Use Local Files (Recommended)
1. Place your tournament images in this folder (`public/assets/slider/`)
2. Name them: `slide1.jpg`, `slide2.jpg`, `slide3.jpg`
3. Update `src/components/ImageSlider.jsx`:

```javascript
const slides = [
  {
    url: "/assets/slider/slide1.jpg",
    title: "Your Title Here",
    subtitle: "Your Subtitle Here"
  },
  {
    url: "/assets/slider/slide2.jpg",
    title: "Another Title",
    subtitle: "Another Subtitle"
  },
  {
    url: "/assets/slider/slide3.jpg",
    title: "Third Title",
    subtitle: "Third Subtitle"
  },
];
```

### Option 2: Use Online Images
Keep the current Unsplash URLs or use your own:

```javascript
const slides = [
  {
    url: "https://your-image-url.com/image1.jpg",
    title: "Your Title",
    subtitle: "Your Subtitle"
  },
];
```

### Recommended Image Specifications:
- **Dimensions**: 1200x500px or 1920x800px (16:9 ratio)
- **Format**: JPG, PNG, or WebP
- **File Size**: Under 500KB for optimal loading
- **Quality**: High resolution for crisp display

### Current Slider Features:
- ✅ Auto-rotation every **3 seconds**
- ✅ Smooth fade & scale transition (1 second)
- ✅ Manual navigation with arrow buttons
- ✅ Dot indicators for quick navigation
- ✅ Slide counter (e.g., "1 / 3")
- ✅ Text overlays with title & subtitle
- ✅ Responsive design for all screen sizes
- ✅ Touch-friendly for mobile devices

### Tips:
- Use high-quality action shots from matches
- Ensure text overlays are readable
- Keep file sizes optimized
- Test on mobile devices
