import React, { useState } from 'react';
import { CreditCard, QrCode, Wallet, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { api } from '../services/api.js';
import { Project, Payment } from '../types.js';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onPaymentSuccess: (payment: Payment) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  project,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [method, setMethod] = useState<'Card' | 'UPI' | 'Wallet'>('UPI');
  const [upiId, setUpiId] = useState('demo.client@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate real bank latency (750ms)
      await new Promise((r) => setTimeout(r, 750));

      const res = await api.payments.processDemoPayment({
        projectId: project.id,
        method,
      });

      if (res.payment) {
        setCompletedPayment(res.payment);
        onPaymentSuccess(res.payment);
      }
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative inline-block w-full max-w-lg p-6 sm:p-8 my-8 text-left bg-white rounded-2xl shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Simulated Escrow Release
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Project Payment Release</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {completedPayment ? (
            /* Success Receipt View */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Payment Completed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Simulated transaction successfully processed & released to {project.freelancerName}.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-200 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Transaction ID:</span>
                  <span className="font-bold text-slate-900">{completedPayment.transactionId}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount Released:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    ${completedPayment.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Gateway:</span>
                  <span className="text-slate-900">{completedPayment.method} (Demo Simulated)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Beneficiary:</span>
                  <span className="text-slate-900">{completedPayment.freelancerName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Project:</span>
                  <span className="text-slate-900 truncate max-w-[200px]">{project.title}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close & Return to Workspace
              </button>
            </div>
          ) : (
            /* Payment Input View */
            <div className="mt-4 space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Total Agreed Deliverable Budget:</span>
                  <p className="text-2xl font-black text-slate-900 tabular-nums font-mono">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Beneficiary:</span>
                  <p className="text-xs font-semibold text-slate-800">{project.freelancerName}</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Simulated Payment Channel:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('UPI')}
                    className={`py-3 px-2 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                      method === 'UPI'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <span>UPI Demo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('Card')}
                    className={`py-3 px-2 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                      method === 'Card'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span>Card Demo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('Wallet')}
                    className={`py-3 px-2 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                      method === 'Wallet'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-indigo-600" />
                    <span>Wallet Demo</span>
                  </button>
                </div>
              </div>

              {/* Method Specific Fields */}
              {method === 'UPI' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Simulated VPA / UPI ID:</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600 font-mono"
                  />
                </div>
              )}

              {method === 'Card' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Simulated Card Number:</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 font-mono"
                    />
                    <input
                      type="text"
                      defaultValue="888"
                      className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 font-mono"
                    />
                  </div>
                </div>
              )}

              {method === 'Wallet' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <span>TalentTrade Escrow Wallet Balance: </span>
                  <strong className="text-slate-900">$25,000.00 (Simulated Demo Credits)</strong>
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Academic / Demo Notice:</strong> No real payment is charged. This executes an instant full-lifecycle simulated transaction.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? 'Processing Transaction...' : `Release $${project.budget.toLocaleString()} Now`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
