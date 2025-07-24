import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { searchSchema, type SearchFormData } from '@flexcore/shared';
import { useExercises } from '../hooks/useExercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, User, LogOut, Dumbbell, Target, Wrench } from 'lucide-react';
import ExerciseCard from './ExerciseCard';

// Updated to match real ExerciseDB API options
const muscleGroups = ['abductors', 'abs', 'adductors', 'biceps', 'calves', 'cardiovascular system', 'delts', 'forearms', 'glutes', 'hamstrings', 'lats', 'levator scapulae', 'pectorals', 'quads', 'serratus anterior', 'spine', 'traps', 'triceps', 'upper back'];

const equipmentList = ['assisted', 'band', 'barbell', 'body weight', 'bosu ball', 'cable', 'dumbbell', 'elliptical machine', 'ez barbell', 'hammer', 'kettlebell', 'leverage machine', 'medicine ball', 'olympic barbell', 'resistance band', 'roller', 'rope', 'skierg machine', 'sled machine', 'smith machine', 'stability ball', 'stationary bike', 'stepmill machine', 'tire', 'trap bar', 'upper body ergometer', 'weighted', 'wheel roller'];

const SearchScreen = () => {
  const { user } = useAuth();
  const { register, handleSubmit, setValue, reset, watch } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });
  const [searchParams, setSearchParams] = useState<SearchFormData>({});
  
  // Watch form values for controlled components
  const targetValue = watch('target');
  const equipmentValue = watch('equipment');
  const { data: exercises, isLoading, error } = useExercises(
    searchParams.query,
    searchParams.target,
    searchParams.equipment,
  );

  const onSubmit = (data: SearchFormData) => {
    setSearchParams(data);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearFilters = () => {
    reset();
    setValue('target', '');
    setValue('equipment', '');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FlexCore</h1>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Search className="h-3 w-3" />
                Exercise Search
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Welcome, {user?.email}</span>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold">Search Exercises</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  {...register('query')} 
                  placeholder="Search by exercise name" 
                  className="pl-10 w-full"
                />
              </div>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={targetValue || ''} onValueChange={(value) => setValue('target', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select target muscle" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((muscle) => (
                      <SelectItem key={muscle} value={muscle}>
                        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={equipmentValue || ''} onValueChange={(value) => setValue('equipment', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentList.map((equip) => (
                      <SelectItem key={equip} value={equip}>
                        {equip.charAt(0).toUpperCase() + equip.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2">Loading exercises...</span>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">Error: {error.message}</p>
              <p className="text-sm text-gray-600">
                {localStorage.getItem('exercises') ? 'Showing cached results' : 'No cached data available'}
              </p>
            </div>
          )}
          
          {exercises && exercises.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold mb-4">
                Found {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </>
          ) : !isLoading && !error && (
            <div className="text-center py-8">
              <p className="text-gray-500">No exercises found. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchScreen; 