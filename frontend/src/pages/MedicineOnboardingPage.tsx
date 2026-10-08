import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { medicines } from '../lib/api';

interface Medicine {
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'thrice' | 'custom';
  timings: string[];
  beforeAfterFood: 'before' | 'after' | 'anytime';
  instructions?: string;
}

export default function MedicineOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      name: '',
      dosage: '',
      frequency: 'once',
      timings: ['08:00'],
      beforeAfterFood: 'after',
    },
  ]);

  const saveMedicinesMutation = useMutation({
    mutationFn: async (medicinesList: Medicine[]) => {
      const promises = medicinesList.map((medicine) =>
        medicines.addMedicine(medicine)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      navigate('/today');
    },
  });

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '',
        frequency: 'once',
        timings: ['08:00'],
        beforeAfterFood: 'after',
      },
    ]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: any) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-adjust timings based on frequency
    if (field === 'frequency') {
      if (value === 'once') {
        updated[index].timings = ['08:00'];
      } else if (value === 'twice') {
        updated[index].timings = ['08:00', '20:00'];
      } else if (value === 'thrice') {
        updated[index].timings = ['08:00', '14:00', '20:00'];
      }
    }
    
    setMedicines(updated);
  };

  const handleSubmit = () => {
    const validMedicines = medicines.filter((m) => m.name && m.dosage);
    if (validMedicines.length > 0) {
      saveMedicinesMutation.mutate(validMedicines);
    }
  };

  const canProceed = medicines.some((m) => m.name && m.dosage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Setup Progress</span>
            <span className="text-sm font-medium text-primary-600">Step {step} of 2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Add Medicines */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Medicines</h1>
              <p className="text-gray-600">Let's add the medicines you take regularly</p>
            </div>

            {medicines.map((medicine, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900">Medicine {index + 1}</h3>
                  {medicines.length > 1 && (
                    <button
                      onClick={() => removeMedicine(index)}
                      className="text-danger-600 hover:text-danger-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Medicine Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      value={medicine.name}
                      onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      placeholder="e.g., Metformin"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                    />
                  </div>

                  {/* Dosage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={medicine.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How many times per day? *
                    </label>
                    <select
                      value={medicine.frequency}
                      onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                    >
                      <option value="once">Once daily</option>
                      <option value="twice">Twice daily</option>
                      <option value="thrice">Three times daily</option>
                    </select>
                  </div>

                  {/* Before/After Food */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When to take? *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['before', 'after', 'anytime'].map((option) => (
                        <button
                          key={option}
                          onClick={() => updateMedicine(index, 'beforeAfterFood', option)}
                          className={`py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all ${
                            medicine.beforeAfterFood === option
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                          }`}
                        >
                          {option === 'before' && '☕ Before food'}
                          {option === 'after' && '🍽️ After food'}
                          {option === 'anytime' && '⏰ Anytime'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {medicines.length < 5 && (
              <button
                onClick={addMedicine}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-600 font-medium flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Another Medicine
              </button>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {/* Step 2: Set Timings */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Timings</h1>
              <p className="text-gray-600">When do you usually take these medicines?</p>
            </div>

            {medicines
              .filter((m) => m.name && m.dosage)
              .map((medicine, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    {medicine.name} {medicine.dosage}
                  </h3>

                  <div className="space-y-3">
                    {medicine.timings.map((time, timeIndex) => (
                      <div key={timeIndex}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {medicine.frequency === 'once' && 'Time'}
                          {medicine.frequency === 'twice' && (timeIndex === 0 ? 'Morning' : 'Evening')}
                          {medicine.frequency === 'thrice' &&
                            (timeIndex === 0 ? 'Morning' : timeIndex === 1 ? 'Afternoon' : 'Evening')}
                        </label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => {
                            const updated = [...medicines];
                            updated[index].timings[timeIndex] = e.target.value;
                            setMedicines(updated);
                          }}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl text-lg flex items-center justify-center border-2 border-gray-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={saveMedicinesMutation.isPending}
                className="flex-1 bg-success-600 hover:bg-success-700 text-white font-semibold py-4 px-6 rounded-xl text-lg flex items-center justify-center disabled:opacity-50 transition-colors"
              >
                {saveMedicinesMutation.isPending ? (
                  'Saving...'
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Setup
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
