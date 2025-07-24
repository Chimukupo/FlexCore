import type { Exercise } from '@flexcore/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Wrench, User, List } from 'lucide-react';
import { env } from '../env';
import { useState } from 'react';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Create array of image sources to try in order
  const imageSources = [
    // First try: Direct gifUrl from API (most reliable)
    exercise.gifUrl,
    // Second try: ExerciseDB image endpoint 
    `https://exercisedb.p.rapidapi.com/image?exerciseId=${exercise.id}&resolution=180&rapidapi-key=${env.VITE_RAPIDAPI_KEY}`,
    // Final fallback: Placeholder
    'https://via.placeholder.com/300x200?text=Exercise+Image'
  ].filter((src): src is string => Boolean(src)); // Remove null/undefined values

  const handleImageError = () => {
    const currentSrc = imageSources[currentImageIndex];
    console.error('❌ Exercise image failed to load:', currentSrc);
    
    // Try next image source
    if (currentImageIndex < imageSources.length - 1) {
      const nextIndex = currentImageIndex + 1;
      console.log('🔄 Trying next image source:', imageSources[nextIndex]);
      setCurrentImageIndex(nextIndex);
    } else {
      console.log('❌ All image sources failed');
    }
  };

  const handleImageLoad = () => {
    const currentSrc = imageSources[currentImageIndex];
    console.log('✅ Image loaded successfully:', currentSrc);
  };

  const currentImageSrc = imageSources[currentImageIndex];

  return (
    <Card className="shadow-md hover:scale-105 transition-transform" data-testid="exercise-card">
      <CardHeader>
        <CardTitle className="text-lg">{exercise.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          key={currentImageIndex} // Force re-render when source changes
          src={currentImageSrc}
          alt={exercise.name}
          className="w-full h-48 object-cover rounded-md mb-3"
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-blue-500" />
            <span><strong>Body Part:</strong> {exercise.bodyPart}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-red-500" />
            <span><strong>Target:</strong> {exercise.target}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wrench className="h-4 w-4 text-gray-500" />
            <span><strong>Equipment:</strong> {exercise.equipment}</span>
          </div>
          
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <User className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Secondary:</strong> {exercise.secondaryMuscles.join(', ')}</span>
            </div>
          )}
          
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <List className="h-4 w-4 text-indigo-500" />
                <strong>Instructions:</strong>
              </div>
              <ul className="list-disc list-inside ml-6 space-y-1">
                {exercise.instructions.slice(0, 3).map((instruction, index) => (
                  <li key={index} className="text-xs text-gray-600">{instruction}</li>
                ))}
                {exercise.instructions.length > 3 && (
                  <li className="text-xs text-gray-500 italic">
                    +{exercise.instructions.length - 3} more steps...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard; 