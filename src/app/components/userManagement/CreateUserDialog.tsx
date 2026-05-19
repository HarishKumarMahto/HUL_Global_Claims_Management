import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Mail, User, Briefcase, MapPin, Globe, Clock, Check, AlertCircle } from 'lucide-react';
import { type UserRecord, type FunctionArea, FUNCTIONS, BUSINESS_GROUPS, TIME_ZONES } from './userManagementData';
import { MultiSelectDropdown } from '../MultiSelectDropdown';

// Generic mockup data for BU, Categories, and Geographies
const BU_OPTIONS = ['Global', 'North America', 'Indonesia', 'PTAB', 'Greater Asia', 'North Asia', 'India', 'Europe', 'LATAM', '1 UL Africa', '1UL EU'];
const CATEGORY_OPTIONS = ['Skin Care', 'Hair Care', 'Deodorants', 'Fabric Cleaning', 'Home & Hygiene', 'Dressings', 'Ice Cream'];
const GEOGRAPHY_OPTIONS = ['Global', 'North America', 'Europe', 'LATAM', 'SEAA', 'South Asia', 'Africa'];

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (user: UserRecord) => void;
  existingUsers: UserRecord[];
}

export default function CreateUserDialog({ isOpen, onClose, onCreate, existingUsers }: CreateUserDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [functionArea, setFunctionArea] = useState<FunctionArea | ''>('');
  const [businessGroups, setBusinessGroups] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [bu, setBu] = useState('');
  const [geographies, setGeographies] = useState<string[]>([]);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [timeZone, setTimeZone] = useState('');

  const [notifySummary, setNotifySummary] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'Required';
    if (!lastName.trim()) newErrors.lastName = 'Required';
    if (!email.trim()) {
      newErrors.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    } else if (existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      newErrors.email = 'Email already exists';
    }

    if (!functionArea) newErrors.functionArea = 'Required';
    if (businessGroups.length === 0) newErrors.businessGroups = 'Required';
    if (categories.length === 0) newErrors.categories = 'Required';
    if (!bu) newErrors.bu = 'Required';
    if (geographies.length === 0) newErrors.geographies = 'Required';

    // Mock validation: "User cannot be created with invalid geography/BG combinations"
    if (businessGroups.includes('Ice Cream') && !geographies.includes('Global')) {
      newErrors.geographies = 'Ice Cream requires Global geography';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const newUser: UserRecord = {
      id: `U${Math.floor(Math.random() * 10000)}`,
      employeeId: `EMP-${Math.floor(Math.random() * 100000)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      functionArea: functionArea as FunctionArea,
      department: functionArea, // Using function as department for legacy display
      businessGroups,
      categories,
      bu,
      geographies,
      roleCodes: [], // Users created without roles assigned initially
      status,
      timeZone,
      notifications: {
        summaryEmail: notifySummary,
        inApp: notifyInApp
      },
      lastActive: new Date().toISOString(),
      createdBy: 'System Admin',
      createdDate: new Date().toISOString()
    };

    onCreate(newUser);
    // Note: Success confirmation is handled by the parent/toast normally. 
    alert(`Success: User ${firstName} ${lastName} created successfully.`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#F6F7F0] flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b border-[#DEDED7] bg-white flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-[#133062]">Create New User</DialogTitle>
          <p className="text-xs text-gray-500 mt-1">Create a user profile to enable platform access and role assignment.</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 ">

          {/* Section 1: Personal Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[#133062] border-b border-[#DEDED7] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0066CC]" /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#133062] mb-1">First Name *</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none ${errors.firstName ? 'border-red-500' : 'border-[#DEDED7]'}`}
                  placeholder="e.g. Jane" />
                {errors.firstName && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.firstName}</span>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#133062] mb-1">Last Name *</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none ${errors.lastName ? 'border-red-500' : 'border-[#DEDED7]'}`}
                  placeholder="e.g. Doe" />
                {errors.lastName && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.lastName}</span>}
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#133062] mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                    className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none ${errors.email ? 'border-red-500' : 'border-[#DEDED7]'}`}
                    placeholder="jane.doe@unilever.com" />
                </div>
                {errors.email && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.email}</span>}
              </div>
            </div>
          </section>

          {/* Section 2: Organization Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[#133062] border-b border-[#DEDED7] pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0066CC]" /> Organization & Assignment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#133062] mb-1">Function *</label>
                <select value={functionArea} onChange={e => setFunctionArea(e.target.value as FunctionArea)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none bg-white ${errors.functionArea ? 'border-red-500' : 'border-[#DEDED7]'}`}>
                  <option value="" disabled>Select Function</option>
                  {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                {errors.functionArea && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.functionArea}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#133062] mb-1">Business Unit (BU) *</label>
                <select value={bu} onChange={e => setBu(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none bg-white ${errors.bu ? 'border-red-500' : 'border-[#DEDED7]'}`}>
                  <option value="" disabled>Select BU</option>
                  {BU_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.bu && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.bu}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#133062] mb-1">Business Group(s) *</label>
                <MultiSelectDropdown options={BUSINESS_GROUPS} selected={businessGroups} onChange={setBusinessGroups} placeholder="Select BGs" />
                {errors.businessGroups && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.businessGroups}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#133062] mb-1">Categories *</label>
                <MultiSelectDropdown options={CATEGORY_OPTIONS} selected={categories} onChange={setCategories} placeholder="Select Categories" />
                {errors.categories && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.categories}</span>}
              </div>
            </div>
          </section>

          {/* Section 3: Location & Preferences */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[#133062] border-b border-[#DEDED7] pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0066CC]" /> Geography & Preferences
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#133062] mb-1">Geography(s) *</label>
                <MultiSelectDropdown options={GEOGRAPHY_OPTIONS} selected={geographies} onChange={setGeographies} placeholder="Select Geographies" />
                {errors.geographies && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.geographies}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#133062] mb-1">Time Zone</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select value={timeZone} onChange={e => setTimeZone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#DEDED7] rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none bg-white">
                    <option value="">Select Time Zone</option>
                    {TIME_ZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#133062] mb-1">Status *</label>
                <select value={status} onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full px-3 py-2 border border-[#DEDED7] rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none bg-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {status === 'Inactive' && <p className="text-[10px] text-gray-500 mt-1">Inactive users cannot log in.</p>}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white border border-[#DEDED7] rounded-xl p-4 mt-4">
              <label className="block text-xs font-bold text-[#133062] mb-3">Notification Preferences</label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${notifySummary ? 'bg-[#0066CC] border-[#0066CC]' : 'border-gray-300'}`}>
                    {notifySummary && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={notifySummary} onChange={e => setNotifySummary(e.target.checked)} />
                  <div>
                    <div className="text-sm font-semibold text-[#133062]">Email Summary Reports</div>
                    <div className="text-[10px] text-gray-500">Receive periodic email digests</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${notifyInApp ? 'bg-[#0066CC] border-[#0066CC]' : 'border-gray-300'}`}>
                    {notifyInApp && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={notifyInApp} onChange={e => setNotifyInApp(e.target.checked)} />
                  <div>
                    <div className="text-sm font-semibold text-[#133062]">In-App Notifications</div>
                    <div className="text-[10px] text-gray-500">Receive alerts within the platform</div>
                  </div>
                </label>
              </div>
            </div>
          </section>

        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#DEDED7] bg-white flex-shrink-0 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-[#F6F7F0] rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#0066CC] hover:bg-[#004D99] rounded-xl shadow-lg shadow-[#0066CC]/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
            Create User
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
