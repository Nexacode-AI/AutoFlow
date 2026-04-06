import { useState } from 'react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { Plus, Edit2, Package, Tag, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import type { PartType } from '../types';

// ── Add Category modal state
type CategoryForm = { name: string; description: string };
const emptyCategoryForm = (): CategoryForm => ({ name: '', description: '' });

// ── Add Part modal state
type PartForm = {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  partType: PartType;
  isActive: boolean;
};
const emptyPartForm = (): PartForm => ({
  categoryId: '',
  name: '',
  description: '',
  price: '',
  partType: 'ORI',
  isActive: true,
});

const WARRANTY: Record<PartType, string> = {
  ORI: '1 Year',
  OM: '6 Months',
};

const TYPE_LABEL: Record<PartType, { label: string; desc: string; badge: string }> = {
  ORI: {
    label: 'ORI',
    desc: 'Original manufacturer part',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  OM: {
    label: 'OM',
    desc: 'Other manufacturer part',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
};

export default function PartsManagement() {
  const { categories, parts } = useWorkflow();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // local state so we can add without real backend
  const [localCategories, setLocalCategories] = useState(categories);
  const [localParts, setLocalParts] = useState(parts);

  // modal state
  const [showCatModal, setShowCatModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCategoryForm());
  const [partForm, setPartForm] = useState<PartForm>(emptyPartForm());
  const [catError, setCatError] = useState('');
  const [partError, setPartError] = useState('');

  // type filter
  const [typeFilter, setTypeFilter] = useState<'all' | PartType>('all');

  const filteredParts = localParts
    .filter(p => selectedCategory === 'all' || p.categoryId === selectedCategory)
    .filter(p => typeFilter === 'all' || p.partType === typeFilter);

  const activeParts = localParts.filter(p => p.isActive).length;
  const oriCount    = localParts.filter(p => p.partType === 'ORI').length;
  const omCount     = localParts.filter(p => p.partType === 'OM').length;

  const handleAddCategory = () => {
    if (!catForm.name.trim()) { setCatError('Category name is required.'); return; }
    const newCat = {
      id: `cat-${Date.now()}`,
      name: catForm.name.trim(),
      description: catForm.description.trim() || undefined,
    };
    setLocalCategories(prev => [...prev, newCat]);
    setShowCatModal(false);
    setCatForm(emptyCategoryForm());
    setCatError('');
  };

  const handleAddPart = () => {
    if (!partForm.name.trim())    { setPartError('Part name is required.'); return; }
    if (!partForm.categoryId)     { setPartError('Please select a category.'); return; }
    const price = parseFloat(partForm.price);
    if (!partForm.price || isNaN(price) || price < 0) { setPartError('Enter a valid price.'); return; }
    const newPart = {
      id: `part-${Date.now()}`,
      categoryId: partForm.categoryId,
      name: partForm.name.trim(),
      description: partForm.description.trim() || undefined,
      price,
      partType: partForm.partType,
      isActive: partForm.isActive,
    };
    setLocalParts(prev => [...prev, newPart]);
    setShowPartModal(false);
    setPartForm(emptyPartForm());
    setPartError('');
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Parts Management</h2>
          <p className="text-gray-600 mt-1">Manage parts categories and inventory</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setCatForm(emptyCategoryForm()); setCatError(''); setShowCatModal(true); }}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
          <button
            onClick={() => { setPartForm(emptyPartForm()); setPartError(''); setShowPartModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Part
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Tag className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-indigo-600">{localCategories.length}</div>
          </div>
          <div className="text-sm text-gray-600">Total Categories</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{activeParts}</div>
          </div>
          <div className="text-sm text-gray-600">Active Parts</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{oriCount}</div>
          </div>
          <div className="text-sm text-gray-600">ORI Parts</div>
          <div className="text-xs text-gray-400 mt-1">1-year warranty</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">{omCount}</div>
          </div>
          <div className="text-sm text-gray-600">OM Parts</div>
          <div className="text-xs text-gray-400 mt-1">6-month warranty</div>
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold mb-4">Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`p-3 rounded-lg border-2 transition-colors text-left ${
              selectedCategory === 'all'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">All Parts</div>
            <div className="text-sm text-gray-600">{localParts.length} parts</div>
          </button>
          {localCategories.map(cat => {
            const count = localParts.filter(p => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-lg border-2 transition-colors text-left ${
                  selectedCategory === cat.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{cat.name}</div>
                <div className="text-sm text-gray-600">{count} parts</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Package className="w-4 h-4" />
            Filter by type:
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as 'all' | PartType)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="ORI">ORI — Original (1-year warranty)</option>
            <option value="OM">OM — Other Manufacturer (6-month warranty)</option>
          </select>
          <div className="ml-auto text-sm text-gray-500">
            {filteredParts.length} part{filteredParts.length !== 1 ? 's' : ''} shown
          </div>
        </div>
      </div>

      {/* ── Parts Table ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold">
            {selectedCategory === 'all'
              ? 'All Parts'
              : localCategories.find(c => c.id === selectedCategory)?.name}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (RM)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No parts found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredParts.map(part => {
                  const cat      = localCategories.find(c => c.id === part.categoryId);
                  const typeInfo = TYPE_LABEL[part.partType];
                  return (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cat?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{part.description || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {part.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full border ${typeInfo.badge}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {WARRANTY[part.partType]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          part.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {part.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Category Modal ── */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Category</h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {catError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {catError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Engine Parts"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={catForm.description}
                  onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of this category"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowCatModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Part Modal ── */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Part</h3>
              <button onClick={() => setShowPartModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {partError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {partError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Part Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={partForm.name}
                  onChange={e => setPartForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Engine Oil Filter"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={partForm.categoryId}
                  onChange={e => setPartForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a category…</option>
                  {localCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={partForm.description}
                  onChange={e => setPartForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Brief description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (RM) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={partForm.price}
                  onChange={e => setPartForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['ORI', 'OM'] as PartType[]).map(t => {
                    const info     = TYPE_LABEL[t];
                    const selected = partForm.partType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPartForm(f => ({ ...f, partType: t }))}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${info.badge}`}>
                            {info.label}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-gray-700">{info.desc}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Warranty: {WARRANTY[t]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPartForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    partForm.isActive ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    partForm.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6 border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowPartModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPart}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Add Part
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

