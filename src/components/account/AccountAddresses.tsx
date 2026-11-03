import * as React from 'react';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import {
  getDemoAddresses,
  saveDemoAddress,
  deleteDemoAddress,
  UserAddress
} from '../../data/accountMockData';
import './AccountStyles.css';

export default function AccountAddresses() {
  const [addresses, setAddresses] = React.useState<UserAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<UserAddress | null>(null);

  // Form state
  const [label, setLabel] = React.useState('Home');
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [street, setStreet] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [isDefault, setIsDefault] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');

  const loadAddresses = () => {
    setAddresses(getDemoAddresses());
  };

  React.useEffect(() => {
    loadAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setLabel('Home');
    setFullName('Arjun Mehta');
    setPhone('+91 98765 43210');
    setStreet('');
    setCity('Mumbai');
    setState('Maharashtra');
    setPincode('400050');
    setIsDefault(false);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: UserAddress) => {
    setEditingAddress(addr);
    setLabel(addr.label);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setIsDefault(addr.isDefault);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this address?')) {
      deleteDemoAddress(id);
      loadAddresses();
      setSuccessMsg('Address removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDemoAddress({
      id: editingAddress ? editingAddress.id : undefined,
      label,
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      country: 'India',
      isDefault
    });

    loadAddresses();
    setIsModalOpen(false);
    setSuccessMsg(editingAddress ? 'Address updated.' : 'New address saved.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-ink">
            Saved Addresses ({addresses.length})
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Manage doorstep delivery destinations for rapid 1-click checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus size={14} /> Add Address
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`rounded-xl border p-5 bg-white relative flex flex-col justify-between shadow-xs transition-all ${
              addr.isDefault ? 'border-[#E87535] ring-1 ring-[#E87535]/30' : 'border-[#E8E5DF] hover:border-neutral-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-ink bg-[#FAF9F6] border border-[#E8E5DF] px-2.5 py-0.5 rounded-md">
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E87535] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                    Default Destination
                  </span>
                )}
              </div>

              <div className="text-xs text-neutral-600 space-y-1 mt-3">
                <p className="font-bold text-sm text-ink">{addr.fullName}</p>
                <p className="text-neutral-500">{addr.phone}</p>
                <p className="leading-relaxed mt-1">{addr.street}</p>
                <p>{addr.city}, {addr.state} {addr.pincode}</p>
                <p>{addr.country}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#F0ECE1] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => openEditModal(addr)}
                className="inline-flex items-center gap-1.5 py-2 px-2.5 rounded-lg font-semibold text-neutral-600 hover:text-ink hover:bg-[#FAF7F0] min-h-[38px] touch-manipulation"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                className="inline-flex items-center gap-1.5 py-2 px-2.5 rounded-lg font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[38px] touch-manipulation"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E5DF] max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-display text-lg font-black uppercase text-ink mb-1">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Enter delivery information for standard doorstep logistics.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Address Label (e.g. Home, Studio, Office)
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Street Address & Apartment
                </label>
                <textarea
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-ink focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-fox focus:ring-fox"
                />
                <span className="font-semibold text-neutral-700">Set as my default shipping destination</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0ECE1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-full border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-full bg-ink text-white font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

