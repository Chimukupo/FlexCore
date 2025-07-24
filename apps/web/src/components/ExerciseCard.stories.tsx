import type { Meta, StoryObj } from '@storybook/react';
import ExerciseCard from './ExerciseCard';

const meta: Meta<typeof ExerciseCard> = {
  component: ExerciseCard,
  title: 'Components/ExerciseCard',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExerciseCard>;

// Default story with a complete exercise
export const Default: Story = {
  args: {
    exercise: {
      id: '0001',
      name: '3/4 sit-up',
      bodyPart: 'waist',
      equipment: 'body weight',
      gifUrl: 'https://v2.exercisedb.io/image/ByNV8nfLN3PKYL',
      target: 'abs',
      secondaryMuscles: ['hip flexors', 'obliques'],
      instructions: [
        'Lie flat on your back with your knees bent and feet flat on the ground.',
        'Place your hands behind your head with your elbows pointing outward.',
        'Engaging your core, lift your upper body towards your knees.',
        'Stop when your torso is at about a 45-degree angle.',
        'Lower your upper body back down with control.',
        'Repeat for the desired number of repetitions.'
      ],
    },
  },
};

// Exercise with long name
export const LongName: Story = {
  args: {
    exercise: {
      id: '0002',
      name: 'Barbell Romanian Deadlift with Deficit',
      bodyPart: 'upper legs',
      equipment: 'barbell',
      gifUrl: 'https://v2.exercisedb.io/image/VyOgGzfLdVckqZ',
      target: 'hamstrings',
      secondaryMuscles: ['glutes', 'erector spinae', 'traps'],
      instructions: [
        'Stand on a raised platform or step with feet hip-width apart.',
        'Hold a barbell with an overhand grip, hands shoulder-width apart.',
        'Keep your knees slightly bent and your back straight.',
        'Hinge at the hips and lower the barbell towards the ground.',
        'Feel the stretch in your hamstrings and glutes.',
        'Drive your hips forward to return to the starting position.',
        'Squeeze your glutes at the top of the movement.'
      ],
    },
  },
};

// Exercise with minimal secondary muscles
export const MinimalSecondaryMuscles: Story = {
  args: {
    exercise: {
      id: '0003',
      name: 'Bicep Curl',
      bodyPart: 'upper arms',
      equipment: 'dumbbell',
      gifUrl: 'https://v2.exercisedb.io/image/nOHV8QfL5XPKVL',
      target: 'biceps',
      secondaryMuscles: ['forearms'],
      instructions: [
        'Stand with feet shoulder-width apart, holding dumbbells at your sides.',
        'Keep your elbows close to your torso.',
        'Curl the weights up towards your shoulders.',
        'Squeeze your biceps at the top.',
        'Lower the weights back down with control.'
      ],
    },
  },
};

// Exercise with no secondary muscles (edge case)
export const NoSecondaryMuscles: Story = {
  args: {
    exercise: {
      id: '0004',
      name: 'Calf Raise',
      bodyPart: 'lower legs',
      equipment: 'body weight',
      gifUrl: 'https://v2.exercisedb.io/image/MyOHV8QfL5XPKVL',
      target: 'calves',
      secondaryMuscles: [],
      instructions: [
        'Stand with your feet hip-width apart.',
        'Rise up onto your toes as high as possible.',
        'Hold for a moment at the top.',
        'Lower your heels back down slowly.',
        'Repeat for desired repetitions.'
      ],
    },
  },
};

// Exercise with many instructions (showing truncation)
export const ManyInstructions: Story = {
  args: {
    exercise: {
      id: '0005',
      name: 'Turkish Get-Up',
      bodyPart: 'waist',
      equipment: 'kettlebell',
      gifUrl: 'https://v2.exercisedb.io/image/BzNV8nfLN3PKYL',
      target: 'abs',
      secondaryMuscles: ['shoulders', 'glutes', 'hip flexors', 'quadriceps', 'traps'],
      instructions: [
        'Start lying on your back with a kettlebell in your right hand.',
        'Press the kettlebell straight up towards the ceiling.',
        'Bend your right knee and place your right foot flat on the ground.',
        'Roll onto your left elbow, then up to your left hand.',
        'Lift your hips off the ground, creating a bridge.',
        'Thread your left leg under your body and back into a lunge position.',
        'Stand up from the lunge position while keeping the kettlebell overhead.',
        'Reverse the movement to return to the starting position.',
        'Complete all reps on one side before switching sides.',
        'Keep your eyes on the kettlebell throughout the entire movement.'
      ],
    },
  },
};

// Loading state simulation (with placeholder image)
export const LoadingImage: Story = {
  args: {
    exercise: {
      id: '0006',
      name: 'Push-up',
      bodyPart: 'chest',
      equipment: 'body weight',
      gifUrl: 'invalid-url-to-trigger-placeholder',
      target: 'pectorals',
      secondaryMuscles: ['triceps', 'anterior deltoid'],
      instructions: [
        'Start in a plank position with hands slightly wider than shoulders.',
        'Lower your body until your chest nearly touches the ground.',
        'Push back up to the starting position.',
        'Keep your body in a straight line throughout.'
      ],
    },
  },
}; 