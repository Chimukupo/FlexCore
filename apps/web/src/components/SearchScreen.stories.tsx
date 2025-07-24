import type { Meta, StoryObj } from '@storybook/react';

// Simple mock component for Storybook documentation
const MockSearchScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FlexCore</h1>
              <p className="text-sm text-gray-600">Exercise Search</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, user@example.com</span>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm">Sign Out</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Search Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input 
              placeholder="Search by exercise name" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option>Select target muscle</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option>Select equipment</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">Search</button>
            <button className="px-4 py-2 border border-gray-300 rounded-md">Clear Filters</button>
          </div>
        </div>

        {/* Mock Results */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Found 3 exercises</h3>
          <div className="text-gray-600 text-center py-8">
            <p>📝 This is a mock version for Storybook documentation.</p>
            <p>The actual SearchScreen requires authentication and API connections.</p>
            <p>See the live app at localhost:5173 for full functionality.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

const meta: Meta<typeof MockSearchScreen> = {
  component: MockSearchScreen,
  title: 'Components/SearchScreen',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The SearchScreen component provides the main exercise search interface for FlexCore.

**Features:**
- Search exercises by name
- Filter by target muscle group  
- Filter by equipment type
- Responsive grid layout for results
- Integrated with ExerciseDB API
- Offline support with localStorage caching

**Dependencies:**
- Requires authentication context
- Uses TanStack Query for data fetching
- Integrates with Firebase Auth

**Note:** This Storybook story shows a static mockup. 
For full functionality, run the development server and navigate to the authenticated app.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MockSearchScreen>;

// Default mock showing the search interface
export const Default: Story = {}; 