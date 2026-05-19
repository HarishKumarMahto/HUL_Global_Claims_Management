import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown, Check, Eye, EyeOff, Mail } from 'lucide-react';
import { ROLES, DEPARTMENTS, MOCK_USERS, type UserRecord, type RoleCode } from './userManagementData';

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (user: UserRecord) => void;
  existingUsers: UserRecord[];
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  department: string;
  roleCode: string;
  status: 'Active' | 'Inactive';
  phone: string;
  manager: string;
  inviteMethod: 'email' | 'password';
  tempPassword: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  employeeId?: string;
  department?: string;
  roleCode?: string;
  tempPassword?: string;
}

const EMPTY_FORM: FormState = {
  firstName: '', lastName: '', email: '', employeeId: '',
  department: '', roleCode: '', status: 'Active',
  phone: '', manager: '', inviteMethod: 'email', tempPassword: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
      {label} {required && <span className="text-red-500 normal-case">*</span>}
    </label>
  );
}

function FormField({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel label={label} required={required} />
      {children}
      {error && (
        <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  `w-full px-3 py-2.5 border rounded-lg text-sm text-[#133062] focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-white transition-colors ${hasError ? 'border-red-400 focus:ring-red-400' : 'border-[#DEDED7] hover:border-[#0066CC]/40'
  }`;

const selectCls = (hasError?: boolean) =>
  `w-full px-3 py-2.5 border rounded-lg text-sm text-[#133062] focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-white appearance-none transition-colors ${hasError ? 'border-red-400 focus:ring-red-400' : 'border-[#DEDED7] hover:border-[#0066CC]/40'
  }`;

export default function CreateUserDialog({ isOpen, onClose, onCreate, existingUsers }: CreateUserDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitted(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (submitted) validate({ ...form, [field]: value });
  };

  const validate = (data: FormState = form): boolean => {
    const e: FieldErrors = {};
    if (!data.firstName.trim()) e.firstName = 'First name is required';
    if (!data.lastName.trim()) e.lastName = 'Last name is required';
    if (!data.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_REGEX.test(data.email)) e.email = 'Enter a valid email address';
    else if (existingUsers.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      e.email = 'A user with this email already exists';
    }
    if (!data.employeeId.trim()) e.employeeId = 'Employee ID is required';
    if (!data.department) e.department = 'Department is required';
    if (!data.roleCode) e.roleCode = 'Role assignment is required';
    if (data.inviteMethod === 'password' && !data.tempPassword.trim()) {
      e.tempPassword = 'Temporary password is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!validate()) return;

    const newUser: UserRecord = {
      id: `U${String(MOCK_USERS.length + Date.now()).slice(-4)}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      employeeId: form.employeeId.trim(),
      department: form.department,
      roleCode: form.roleCode as RoleCode,
      status: form.status,
      lastActive: new Date().toISOString(),
      phone: form.phone.trim() || undefined,
      manager: form.manager.trim() || undefined,
    };
    onCreate(newUser);
    onClose();
  };

  const selectedRole = ROLES.find(r => r.code === form.roleCode);
  const allManagers = existingUsers.map(u => `${u.firstName} ${u.lastName}`);
  const isFormValid = !submitted || Object.keys(errors).length === 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-[#133062]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEDED7] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C2E0FF] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[#133062] font-bold text-lg leading-tight">Create New User</h2>
              <p className="text-xs text-gray-500 mt-0.5">Fill in the required fields to provision a new user account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F6F7F0] rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Basic Info */}
          <section>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-[#DEDED7] mb-4">
              Basic Information
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" required error={errors.firstName}>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  placeholder="e.g. Sarah"
                  className={inputCls(!!errors.firstName)}
                />
              </FormField>
              <FormField label="Last Name" required error={errors.lastName}>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                  placeholder="e.g. Johnson"
                  className={inputCls(!!errors.lastName)}
                />
              </FormField>
              <FormField label="Email Address" required error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="user@unilever.com"
                  className={inputCls(!!errors.email)}
                />
              </FormField>
              <FormField label="Employee ID" required error={errors.employeeId}>
                <input
                  type="text"
                  value={form.employeeId}
                  onChange={e => set('employeeId', e.target.value)}
                  placeholder="e.g. EMP-12345"
                  className={inputCls(!!errors.employeeId)}
                />
              </FormField>
            </div>
          </section>

          {/* Role & Department */}
          <section>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-[#DEDED7] mb-4">
              Role & Organization
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Department" required error={errors.department}>
                <div className="relative">
                  <select
                    value={form.department}
                    onChange={e => set('department', e.target.value)}
                    className={selectCls(!!errors.department)}
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </FormField>

              <FormField label="Role Assignment" required error={errors.roleCode}>
                <div className="relative">
                  <select
                    value={form.roleCode}
                    onChange={e => set('roleCode', e.target.value)}
                    className={selectCls(!!errors.roleCode)}
                  >
                    <option value="">Select role...</option>
                    {ROLES.map(r => (
                      <option key={r.code} value={r.code}>
                        [{r.id}] {r.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </FormField>

              {selectedRole && (
                <div className="col-span-2 flex items-start gap-3 p-3 bg-[#F6F7F0] rounded-xl border border-[#DEDED7]">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: selectedRole.color }}
                  >
                    {selectedRole.id}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#133062]">{selectedRole.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{selectedRole.description}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Scope: {selectedRole.scope}</div>
                  </div>
                </div>
              )}

              <FormField label="Status">
                <div className="flex items-center gap-3 pt-1">
                  {(['Active', 'Inactive'] as const).map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => set('status', s)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${form.status === s ? 'border-[#0066CC]' : 'border-gray-300'}`}
                      >
                        {form.status === s && <div className="w-2 h-2 rounded-full bg-[#0066CC]" />}
                      </div>
                      <span className="text-sm text-[#133062]">{s}</span>
                    </label>
                  ))}
                </div>
              </FormField>

              <FormField label="Manager (Optional)">
                <div className="relative">
                  <select
                    value={form.manager}
                    onChange={e => set('manager', e.target.value)}
                    className={selectCls()}
                  >
                    <option value="">No manager assigned</option>
                    {allManagers.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </FormField>
            </div>
          </section>

          {/* Optional */}
          <section>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-[#DEDED7] mb-4">
              Contact (Optional)
            </div>
            <FormField label="Phone Number">
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+44 20 7946 0000"
                className={inputCls()}
              />
            </FormField>
          </section>

          {/* Invite Method */}
          <section>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-[#DEDED7] mb-4">
              Account Setup
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                {[
                  { value: 'email', label: 'Send Email Invite', icon: <Mail className="w-4 h-4" />, desc: 'User receives a link to set their own password' },
                  { value: 'password', label: 'Set Temporary Password', icon: <Eye className="w-4 h-4" />, desc: 'Admin sets a password; user must change on first login' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('inviteMethod', opt.value)}
                    className={`flex-1 flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${form.inviteMethod === opt.value
                      ? 'border-[#0066CC] bg-[#C2E0FF]/20'
                      : 'border-[#DEDED7] hover:border-[#0066CC]/30'
                      }`}
                  >
                    <span className={`mt-0.5 flex-shrink-0 ${form.inviteMethod === opt.value ? 'text-[#0066CC]' : 'text-gray-400'}`}>
                      {opt.icon}
                    </span>
                    <div>
                      <div className={`text-xs font-semibold ${form.inviteMethod === opt.value ? 'text-[#0066CC]' : 'text-[#133062]'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</div>
                    </div>
                    {form.inviteMethod === opt.value && (
                      <Check className="w-4 h-4 text-[#0066CC] ml-auto flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>

              {form.inviteMethod === 'password' && (
                <FormField label="Temporary Password" required error={errors.tempPassword}>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.tempPassword}
                      onChange={e => set('tempPassword', e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={inputCls(!!errors.tempPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormField>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#DEDED7] flex-shrink-0 bg-[#F6F7F0]/50">
          <p className="text-xs text-gray-400">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-[#DEDED7] text-[#133062] rounded-lg text-sm font-semibold hover:bg-[#F6F7F0] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${isFormValid
                ? 'bg-[#0066CC] text-white hover:bg-[#004D99] shadow-lg shadow-[#0066CC]/20'
                : 'bg-[#0066CC] text-white hover:bg-[#004D99] shadow-lg shadow-[#0066CC]/20'
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
