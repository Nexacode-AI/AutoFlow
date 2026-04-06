import { useState } from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { Plus, X, ShieldCheck } from 'lucide-react';
import type { PartType } from '../../types';

interface PartsSelectionStepProps {
  workflowId: string;
}

const WARRANTY: Record<PartType, string> = { ORI: '1 Year', OM: '6 Months' };

const TYPE_BADGE: Record<PartType, string> = {
  ORI: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  OM:  'bg-amber-100 text-amber-800 border-amber-200',
};

export default function PartsSelectionStep({ workflowId }: PartsSelectionStepProps) {
  const { categories, parts, addWorkflowParts } = useWorkflow();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | PartType>('all');
  const [selectedParts, setSelectedParts] = useState<{ partId: string; quantity: number }[]>([]);

  // Parts in selected category filtered by type
  const categoryParts = parts.filter(
    p => p.categoryId === selectedCategory && p.isActive &&
         (typeFilter === 'all' || p.partType === typeFilter)
  );

  // Group parts by name so ORI/OM of the same part sit together
  const grouped = categoryParts.reduce<Record<string, typeof categoryParts>>((acc, p) => {
    (acc[p.name] = acc[p.name] || []).push(p);
    return acc;
  }, {});

  const addPart = (partId: string) => {
    if (!selectedParts.find(p => p.partId === partId)) {
      setSelectedParts(prev => [...prev, { partId, quantity: 1 }]);
    }
  };

  const removePart = (partId: string) => {
    setSelectedParts(prev => prev.filter(p => p.partId !== partId));
  };

  const updateQuantity = (partId: string, quantity: number) => {
    setSelectedParts(prev =>
      prev.map(p => p.partId === partId ? { ...p, quantity } : p)
    );
  };

  const handleSubmit = () => {
    if (selectedParts.length === 0) {
      alert('Please select at least one part');
      return;
    }
    addWorkflowParts(workflowId, selectedParts.map(p => p.partId), selectedParts.map(p => p.quantity));
    setSelectedParts([]);
  };

  const getPartDetails = (partId: string) => {
    const part = parts.find(p => p.id === partId);
    const category = categories.find(c => c.id === part?.categoryId);
    return { part, category };
  };

  const isAdded = (partId: string) => !!selectedParts.find(p => p.partId === partId);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold mb-1">Step 10: Spare Parts Selection</h3>
      <p className="text-gray-600 mb-5 text-sm">
        Select required parts. Where both{' '}
        <span className="font-medium text-indigo-700">ORI</span> and{' '}
        <span className="font-medium text-amber-700">OM</span> options are available,
        compare prices and warranty before choosing.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Left: Selection ── */}
        <div>
          <h4 className="font-medium mb-3">Select Parts</h4>

          {/* Category */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setTypeFilter('all'); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">Select a category…</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          {selectedCategory && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as 'all' | PartType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Types — show both ORI &amp; OM</option>
                <option value="ORI">ORI only — Original (1-year warranty)</option>
                <option value="OM">OM only — Other Manufacturer (6-month warranty)</option>
              </select>
            </div>
          )}

          {/* Parts list */}
          {selectedCategory && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {Object.keys(grouped).length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No parts in this category</p>
              ) : (
                Object.entries(grouped).map(([name, variants]) => {
                  const hasMultiple = variants.length > 1;
                  return (
                    <div
                      key={name}
                      className={`rounded-lg border overflow-hidden ${
                        hasMultiple ? 'border-indigo-200 bg-indigo-50/40' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {hasMultiple && (
                        <div className="px-3 py-1.5 bg-indigo-100 border-b border-indigo-200 flex items-center gap-2">
                          <span className="text-xs font-semibold text-indigo-700">{name}</span>
                          <span className="text-xs text-indigo-500">— ORI &amp; OM available</span>
                        </div>
                      )}
                      {variants.map(part => (
                        <div
                          key={part.id}
                          className="flex items-center justify-between px-3 py-2.5 hover:bg-white transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            {!hasMultiple && (
                              <div className="text-sm font-medium text-gray-900 truncate">{part.name}</div>
                            )}
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full border ${TYPE_BADGE[part.partType]}`}>
                                {part.partType}
                              </span>
                              <span className="text-xs font-semibold text-gray-800">RM {part.price.toFixed(2)}</span>
                              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3" />{WARRANTY[part.partType]}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => addPart(part.id)}
                            disabled={isAdded(part.id)}
                            className="ml-3 p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── Right: Selected Parts ── */}
        <div>
          <h4 className="font-medium mb-3">Selected Parts ({selectedParts.length})</h4>
          <div className="space-y-3">
            {selectedParts.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No parts selected yet</p>
            ) : (
              selectedParts.map(({ partId, quantity }) => {
                const { part, category } = getPartDetails(partId);
                if (!part) return null;
                return (
                  <div key={partId} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{part.name}</div>
                        <div className="text-xs text-gray-500">{category?.name}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full border ${TYPE_BADGE[part.partType]}`}>
                            {part.partType}
                          </span>
                          <span className="text-xs font-semibold text-gray-700">
                            RM {part.price.toFixed(2)} / unit
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" />{WARRANTY[part.partType]}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removePart(partId)}
                        className="text-red-500 hover:bg-red-50 rounded p-1 ml-2 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={e => updateQuantity(partId, parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-gray-500 ml-auto">
                        = RM {(part.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedParts.length > 0 && (
            <>
              <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg flex justify-between text-sm font-medium">
                <span className="text-gray-700">Catalogue Total</span>
                <span className="text-indigo-600">
                  RM {selectedParts.reduce((sum, { partId, quantity }) => {
                    const part = parts.find(p => p.id === partId);
                    return sum + (part?.price || 0) * quantity;
                  }, 0).toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full mt-3 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Add Parts to Workflow
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

