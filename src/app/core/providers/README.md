# Mock API Service

This mock API service simulates a backend API for image management operations. It's designed to help with development and testing when you don't have a real backend available.

## Features

- **Simulated Image Data**: Uses mock images from `/mock-data/images/` folder
- **Realistic API Responses**: Returns proper API response structures with success/error states
- **Configurable Behavior**: Adjustable delay times and success rates
- **Progress Tracking**: Simulated upload progress for better UX
- **Error Simulation**: Random failures based on configurable success rates
- **Full CRUD Operations**: Get, Upload, Delete, and Search images
- **Reactive State Management**: Uses Angular Signals for state tracking

## Services

### MockApiService
The core service that simulates API endpoints:

```typescript
import { MockApiService } from './core/providers/mock-api.service';

// Get all images
mockApiService.getImages().subscribe(response => {
  console.log(response.data); // ImageData[]
});

// Upload files
mockApiService.uploadImages(files).subscribe(response => {
  console.log(response.data.uploadedImages);
});

// Search images
mockApiService.searchImages('query', ['tag1']).subscribe(response => {
  console.log(response.data);
});
```

### ImageService
A higher-level service that wraps MockApiService with additional functionality:

```typescript
import { ImageService } from './core/providers/image.service';

// Load and update local state
await imageService.fetchAndUpdateImages();

// Get mock images immediately (no async)
const mockImages = imageService.getMockImages();

// Check loading states
console.log(imageService.isLoading());
console.log(imageService.isUploading());
```

## Configuration

The mock API can be configured at runtime:

```typescript
mockApiService.updateConfig({
  delayMs: 1500,        // Response delay in milliseconds
  successRate: 0.8      // Success rate (0.0 - 1.0)
});
```

## Mock Data

The service includes 4 sample images:
- `0101308.png`
- `0101309.png` 
- `0101310.png`
- `0101311.png`

These images are served from `/mock-data/images/` and each has:
- Unique ID
- Filename
- File size
- Upload date
- Tags for searching

## Components

### ImageUploadComponent
Enhanced image upload component that uses the mock API:
- Drag & drop file upload
- Displays mock images from the service
- Search functionality
- Real upload simulation

### MockApiDemoComponent
Comprehensive demo showing all mock API features:
- Configuration controls
- All CRUD operations
- Progress tracking
- Error handling
- State management

## Usage Examples

### Basic Image Loading
```typescript
@Component({...})
export class MyComponent {
  private imageService = inject(ImageService);
  
  async ngOnInit() {
    // Load mock images
    await this.imageService.fetchAndUpdateImages();
    
    // Access images via signal
    console.log(this.imageService.images());
  }
}
```

### File Upload with Progress
```typescript
async uploadFiles(files: File[]) {
  this.imageService.uploadImagesWithProgress(files).subscribe({
    next: ({ progress, message }) => {
      console.log(`${progress}%: ${message}`);
    },
    complete: () => {
      console.log('Upload completed!');
    }
  });
}
```

### Search Implementation
```typescript
async searchImages(query: string) {
  try {
    const response = await this.imageService.searchImages(query).toPromise();
    if (response?.success) {
      console.log(`Found ${response.data.length} images`);
    }
  } catch (error) {
    console.error('Search failed:', error);
  }
}
```

## Error Handling

The mock API simulates real-world error scenarios:

```typescript
try {
  const response = await mockApiService.uploadImages(files).toPromise();
  if (response?.success) {
    // Handle success
  } else {
    // Handle API error
  }
} catch (error) {
  // Handle network/system error
}
```

## Testing

The services include comprehensive tests showing:
- Successful operations
- Error scenarios  
- Configuration changes
- State management

Run tests with:
```bash
npm test -- --testNamePattern="MockApiService|ImageService"
```

## Integration

To use in your components:

1. Import the services:
```typescript
import { ImageService, MockApiService } from './core/providers';
```

2. Inject in your component:
```typescript
private readonly imageService = inject(ImageService);
```

3. Use reactive data:
```typescript
// In template
@if (imageService.images().length > 0) {
  // Display images
}
```

## Development

The mock API helps with:
- Frontend development without backend dependency
- Testing different scenarios (errors, slow responses)
- Prototyping image upload workflows
- Demonstrating UI/UX patterns

## Production

When moving to production:
1. Replace MockApiService with real HTTP service
2. Update ImageService to use real endpoints
3. Keep the same interfaces for seamless transition
