import React, { useState } from 'react';
import { Search, Info, PieChart as PieChartIcon, BarChart3, Loader2, Apple, Citrus, Grape, Banana } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { getFruitNutrition, FruitNutrition } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#FF6B35', '#F7C548', '#1B998B', '#E84855', '#702632', '#A23E48', '#FF9F1C', '#2EC4B6'];

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FruitNutrition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await getFruitNutrition(query);
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Could not find nutrition data for that fruit. Please try another one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-vibrant-orange/30">
      {/* Header Section */}
      <header className="vibrant-gradient pt-16 pb-32 px-6 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 animate-bounce"><Apple size={48} /></div>
          <div className="absolute top-20 right-20 animate-pulse"><Citrus size={64} /></div>
          <div className="absolute bottom-10 left-1/4 animate-spin-slow"><Grape size={40} /></div>
          <div className="absolute top-1/2 right-1/3 animate-bounce-slow"><Banana size={56} /></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-4 drop-shadow-sm">
            FruitNutri
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 mb-12 max-w-xl mx-auto">
            Discover the vibrant science behind your favorite fruits.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a fruit name (e.g., Mango, Kiwi)..."
              className="w-full px-8 py-6 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 text-white placeholder:text-white/60 text-xl focus:outline-none focus:ring-4 focus:ring-white/20 transition-all shadow-2xl"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 px-8 rounded-full bg-white text-vibrant-orange font-bold hover:bg-stone-100 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              <span className="hidden md:inline">Analyze</span>
            </button>
          </form>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 -mt-16 pb-24 relative z-20">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-2 border-vibrant-pink text-vibrant-pink p-6 rounded-3xl text-center font-bold text-lg mb-8 shadow-xl"
            >
              {error}
            </motion.div>
          )}

          {!data && !loading && !error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex p-8 rounded-full bg-vibrant-yellow/20 text-vibrant-yellow mb-6">
                <Info size={48} />
              </div>
              <h2 className="text-3xl font-bold text-stone-400">Search for a fruit to see its nutritional profile</h2>
            </motion.div>
          )}

          {data && (
            <motion.div
              key={data.fruitName}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Summary Card */}
              <div className="vibrant-card p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-1 rounded-full bg-vibrant-green/10 text-vibrant-green font-bold text-sm uppercase tracking-widest">
                      Analysis Result
                    </span>
                    <span className="text-stone-400 font-medium">Serving: {data.servingSize}</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-stone-900 mb-6 capitalize tracking-tight">
                    {data.fruitName}
                  </h2>
                  <p className="text-xl text-stone-600 leading-relaxed italic">
                    "{data.summary}"
                  </p>
                </div>
                
                <div className="w-full md:w-80 h-80 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.nutrients.filter(n => n.percentage > 1)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="percentage"
                        nameKey="name"
                      >
                        {data.nutrients.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <PieChartIcon className="text-vibrant-orange mb-1" size={32} />
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Proportions</span>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Gram-wise Breakdown */}
                <div className="vibrant-card p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-vibrant-orange/10 text-vibrant-orange">
                      <BarChart3 size={24} />
                    </div>
                    <h3 className="text-2xl font-bold">Gram-wise Breakdown</h3>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.nutrients.filter(n => n.unit === 'g')}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <RechartsTooltip 
                          cursor={{ fill: '#f8f8f8' }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                          {data.nutrients.filter(n => n.unit === 'g').map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Proportion-wise List */}
                <div className="vibrant-card p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-vibrant-green/10 text-vibrant-green">
                      <PieChartIcon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold">Proportion-wise (%)</h3>
                  </div>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {data.nutrients.sort((a, b) => b.percentage - a.percentage).map((nutrient, idx) => (
                      <div key={nutrient.name} className="group">
                        <div className="flex justify-between items-end mb-1">
                          <span className="font-bold text-stone-700 group-hover:text-vibrant-orange transition-colors">
                            {nutrient.name}
                          </span>
                          <span className="text-sm font-medium text-stone-400">
                            {nutrient.amount}{nutrient.unit} • {nutrient.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${nutrient.percentage}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="text-center text-stone-400 text-sm font-medium">
                Data provided by Gemini AI. Nutritional values are approximate per 100g serving.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
