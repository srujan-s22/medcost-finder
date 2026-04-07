import { useState, useRef, useEffect } from 'react';

function App() {
  const [drugInput, setDrugInput] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing medicine prices...');
  const [error, setError] = useState('');
  const resultsRef = useRef(null);

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCheckPrice = async (e) => {
    e.preventDefault();
    if (!drugInput.trim()) {
      setError('Please enter at least one medicine');
      return;
    }
    
    const rawDrugs = drugInput.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
    const drugsArray = [...new Set(rawDrugs)];
    
    if (drugsArray.length === 0) {
      setError('Please enter at least one medicine');
      return;
    }

    const formattedInput = drugsArray.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
    setDrugInput(formattedInput);

    setLoading(true);
    setLoadingMessage('Analyzing medicine prices...');
    setError('');
    setResults([]);

    const timeoutId = setTimeout(() => {
      setLoadingMessage('Fetching best available estimates...');
    }, 3000);

    try {
      const response = await fetch('http://localhost:3000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ drugs: drugsArray })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      
      const sortedResults = [...data.results];
      if (sortedResults.length > 1) {
        let bestIndex = 0;
        for (let i = 1; i < sortedResults.length; i++) {
          if (sortedResults[i].yearly_savings > sortedResults[bestIndex].yearly_savings) {
            bestIndex = i;
          }
        }
        const bestOption = sortedResults.splice(bestIndex, 1)[0];
        sortedResults.sort((a, b) => a.generic_price - b.generic_price);
        sortedResults.unshift(bestOption);
      }
      
      setResults(sortedResults);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* LEFT SIDEBAR (30%) */}
      <div className="w-full md:w-[320px] lg:w-[350px] md:fixed md:h-screen md:overflow-y-auto bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 sm:p-8 flex flex-col z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">MedCost Finder</h1>
          <p className="text-sm text-gray-500 mt-2 mb-8 leading-relaxed">
            Find and compare affordable generic alternatives
          </p>
        </div>

        <form onSubmit={handleCheckPrice} className="space-y-5 flex-1 flex flex-col">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Medicines</label>
            <input
              type="text"
              value={drugInput}
              onChange={(e) => setDrugInput(e.target.value)}
              placeholder="e.g. Paracetamol, Ibuprofen"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location (Optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru, 560001"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex justify-center items-center py-3 px-4 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="truncate">{loadingMessage}</span>
              </div>
            ) : (
              "Compare Prices"
            )}
          </button>
          
          {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            This tool provides estimated pricing for educational purposes only. Please consult a healthcare professional before making medical decisions.
          </p>
        </div>
      </div>

      {/* RIGHT MAIN PANEL (70%) */}
      <div className="flex-1 md:ml-[320px] lg:ml-[350px] p-6 sm:p-8 lg:p-10 min-h-screen w-full relative bg-gray-50">
        {loading && (
          <div className="flex flex-col justify-center items-center h-full min-h-[50vh] space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="text-gray-500 font-medium animate-pulse text-sm">{loadingMessage}</p>
          </div>
        )}

        {!loading && results && results.length > 0 && (
          <div ref={resultsRef} className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div>
              <h2 className="text-xl font-bold mb-6 text-gray-900">Pricing Results</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.map((item, index) => {
                  const isBest = results.length > 1 && index === 0;
                  const isVague = item.generic_name.toLowerCase() === item.drug.toLowerCase() || 
                                  item.explanation.toLowerCase().includes('unavailable');

                  return (
                    <div 
                      key={index} 
                      style={{ animationDelay: `${index * 50}ms` }} 
                      className={`card-appear bg-white rounded-lg p-5 flex flex-col transition-all duration-300 ${isBest ? 'border-gray-900 ring-1 ring-gray-900 shadow-md' : 'border border-gray-200 shadow-sm hover:shadow-md'}`}
                    >
                      {/* Top: Drug name + badge inline */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-3">
                          <h3 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2 flex-wrap">
                            {item.drug}
                            {isBest && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-black text-white uppercase tracking-wider">
                                Best
                              </span>
                            )}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1.5 font-medium flex items-center flex-wrap gap-2">
                            <span>Generic: <span className="text-gray-900">{item.generic_name}</span></span>
                            {item.dosage_form && (
                              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">{item.dosage_form}</span>
                            )}
                            {item.availability && (
                              <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 border border-blue-100">{item.availability}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <span title="Data generated using AI-based estimation" className="cursor-help inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-semibold">
                            ✨ {item.confidence_level === 'high' ? 'AI Verified Estimate' : 'AI Estimated'}
                          </span>
                          
                          {item.confidence_level === 'high' ? (
                            <span title="Based on AI-estimated market ranges" className="cursor-help inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 border border-green-100 text-[10px] sm:text-xs font-semibold">
                              High Confidence
                            </span>
                          ) : (
                            <span title="Based on AI-estimated market ranges" className="cursor-help inline-flex items-center px-2 py-1 rounded bg-yellow-50 text-yellow-700 border border-yellow-100 text-[10px] sm:text-xs font-semibold">
                              Estimated Data
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Prices */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-red-50/50 rounded p-2.5 border border-red-50">
                          <p className="text-[10px] text-red-500 uppercase tracking-wider font-semibold mb-1">Brand Price</p>
                          <p className="text-sm sm:text-base font-bold text-red-700">{formatCurrency(item.brand_price)}</p>
                        </div>
                        <div className="bg-green-50/50 rounded p-2.5 border border-green-50">
                          <p className="text-[10px] text-green-600 uppercase tracking-wider font-semibold mb-1">Generic</p>
                          <p className="text-sm sm:text-base font-bold text-green-700">{formatCurrency(item.generic_price)}</p>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="mb-4 space-y-3 pt-1">
                        {Array.isArray(item.uses) && item.uses.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 flex items-center">Uses</p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.uses.map(use => (
                                <span key={use} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded-full font-medium">{use}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {Array.isArray(item.side_effects) && item.side_effects.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 flex items-center">Side Effects</p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.side_effects.map(effect => (
                                <span key={effect} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] rounded-full font-medium">{effect}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {Array.isArray(item.brands) && item.brands.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1 flex items-center">Popular Brands</p>
                            <p className="text-xs text-gray-800 font-medium">{item.brands.join(', ')}</p>
                          </div>
                        )}
                      </div>

                      {/* Bottom: Savings + explanation */}
                      <div className="mt-auto border-t border-gray-100 pt-3">
                        <p className="text-green-600 font-bold mb-1.5 flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Save {formatCurrency(item.yearly_savings)}/yr
                        </p>
                        <p className="text-xs text-gray-600 leading-snug font-medium mb-1">
                          {item.explanation}
                        </p>
                        {item.confidence_note && (
                          <p className="text-[10px] text-gray-400 italic">
                            {item.confidence_note}
                          </p>
                        )}
                        {isVague && (
                          <p className="text-[10px] text-yellow-600 font-medium mt-2 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            Limited data available. Results estimated.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {location && location.trim() !== '' && (
              <div className="card-appear bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8" style={{ animationDelay: `${results.length * 50}ms` }}>
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Nearby Map</h3>
                  <p className="text-sm text-gray-500 font-medium">Find these medicines at nearby Jan Aushadhi stores</p>
                </div>
                <iframe
                  width="100%"
                  height="350"
                  className="w-full bg-gray-50 block"
                  src={`https://www.google.com/maps?q=jan+aushadhi+store+in+${location}&output=embed`}
                  title="Nearby Stores Map"
                ></iframe>
              </div>
            )}
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center border-2 border-dashed border-gray-200 rounded-xl p-8 max-w-lg mx-auto">
            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to compare</h3>
            <p className="text-sm text-gray-500">Enter your medicines in the sidebar to securely find the best generic alternatives.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
