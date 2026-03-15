// Local date helpers to avoid timezone issues
const parseLocalDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatLocalDate = (dt: Date) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, PenLine, MessageSquare, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import TripChatbot from "@/components/build-trip/TripChatbot";
import { SIMULATED_DELAY, FORM_REQUIRED_FIELDS } from "@/config/site";
import type { GatheredTripDetails } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────────

type FormState = {
  source: string;
  destination: string[];
  budget: string;
  spots: string[];
  notes: string;
  start_date: string;
  end_date: string;
  days: string;
  kids: string;
  adults: string;
  transport_type: string;
};

const INITIAL_FORM: FormState = {
  source: "",
  destination: [],
  budget: "",
  spots: [],
  notes: "",
  start_date: "",
  end_date: "",
  days: "",
  kids: "",
  adults: "",
  transport_type: "",
};

// ── BuildTripPage ─────────────────────────────────────────────────────────────

export default function BuildTripPage() {
  const router = useRouter();
  const [inputMethod, setInputMethod] = useState<"form" | "chat">("form");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [spotInput, setSpotInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [chatDetails, setChatDetails] = useState<GatheredTripDetails | null>(null);
  // Track last edited field for date logic
  const [lastDateField, setLastDateField] = useState<'days' | 'end_date' | null>(null);

  // Single handler for all form inputs — relies on `id` matching the field key
  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { id, value } = e.target;
      if (id === "spots") {
        setSpotInput(value);
      } else if (id === "destination") {
        setDestinationInput(value);
      } else if (id === "days") {
        setLastDateField('days');
        setFormData((prev) => {
          const newDays = value;
          let newEndDate = prev.end_date;
          if (prev.start_date && newDays && !isNaN(Number(newDays))) {
            const start = parseLocalDate(prev.start_date);
            if (!isNaN(start.getTime())) {
              const end = new Date(start);
              end.setDate(start.getDate() + Number(newDays) - 1);
              newEndDate = formatLocalDate(end);
            }
          }
          return { ...prev, days: newDays, end_date: newEndDate };
        });
      } else if (id === "end_date") {
        setLastDateField('end_date');
        setFormData((prev) => {
          let newDays = prev.days;
          if (prev.start_date && value) {
            const start = new Date(prev.start_date);
            const end = new Date(value);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
              const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              newDays = diff > 0 ? String(diff) : "";
            }
          }
          return { ...prev, end_date: value, days: newDays };
        });
      } else if (id === "start_date") {
        setFormData((prev) => {
          let newEndDate = prev.end_date;
          let newDays = prev.days;
          if (lastDateField === 'days' && value && prev.days && !isNaN(Number(prev.days))) {
            const start = parseLocalDate(value);
            if (!isNaN(start.getTime())) {
              const end = new Date(start);
              end.setDate(start.getDate() + Number(prev.days) - 1);
              newEndDate = formatLocalDate(end);
            }
          } else if (lastDateField === 'end_date' && value && prev.end_date) {
            const start = parseLocalDate(value);
            const end = parseLocalDate(prev.end_date);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
              const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              newDays = diff > 0 ? String(diff) : "";
            }
          }
          return { ...prev, start_date: value, end_date: newEndDate, days: newDays };
        });
      } else {
        setFormData((prev) => ({ ...prev, [id]: value }));
      }
    },
    [lastDateField]
  );

  // Add destination to array
  const handleAddDestination = useCallback(() => {
    const trimmed = destinationInput.trim();
    if (trimmed && !formData.destination.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, destination: [...prev.destination, trimmed] }));
      setDestinationInput("");
    }
  }, [destinationInput, formData.destination]);

  // Remove destination from array
  const handleRemoveDestination = useCallback((dest: string) => {
    setFormData((prev) => ({ ...prev, destination: prev.destination.filter((d: string) => d !== dest) }));
  }, []);

  // Add spot to array
  const handleAddSpot = useCallback(() => {
    const trimmed = spotInput.trim();
    if (trimmed && !formData.spots.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, spots: [...prev.spots, trimmed] }));
      setSpotInput("");
    }
  }, [spotInput, formData.spots]);

  // Remove spot from array
  const handleRemoveSpot = useCallback((spot: string) => {
    setFormData((prev) => ({ ...prev, spots: prev.spots.filter((s: string) => s !== spot) }));
  }, []);

  const handleInputMethodChange = useCallback((value: string) => {
    setInputMethod(value as "form" | "chat");
  }, []);

  // Button is enabled only when all required fields are satisfied
  const isComplete = useMemo(() => {
    if (inputMethod === "form") {
      return (FORM_REQUIRED_FIELDS as readonly string[]).every((f) => {
        if (f === "destination") {
          return Array.isArray(formData.destination) && formData.destination.length > 0;
        }
        if (f === "spots") {
          return Array.isArray(formData.spots) && formData.spots.length > 0;
        }
        const val = formData[f as keyof FormState];
        return typeof val === "string" ? val.trim().length > 0 : !!val;
      });
    }
    return (
      chatDetails !== null &&
      Array.isArray(chatDetails.destination) &&
      chatDetails.destination.length > 0 &&
      Array.isArray(chatDetails.spots) &&
      chatDetails.source.trim().length > 0 &&
      chatDetails.adults.trim().length > 0 &&
      chatDetails.kids.trim().length > 0 &&
      chatDetails.start_date.trim().length > 0 &&
      chatDetails.end_date.trim().length > 0 &&
      chatDetails.days.trim().length > 0
    );
  }, [inputMethod, formData, chatDetails]);

  const handleGenerate = useCallback(async () => {
    if (!isComplete || loading) return;
    setLoading(true);
    try {
   await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
   if (inputMethod === "form") {
     localStorage.setItem("tripDetails", JSON.stringify(formData));
   } else if (chatDetails) {
     localStorage.setItem("tripDetails", JSON.stringify(chatDetails));
   }
   router.push("/itinerary");
 } finally {
   setLoading(false);
 }
  }, [isComplete, loading, router, inputMethod, formData, chatDetails]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Page Header */}
          <div className="text-center mb-12 bg-gradient-to-b from-emerald-50 to-white py-12 rounded-3xl border border-emerald-100/50">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Build Your Trip
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create a personalized trip by providing your trip details. Let AI
              handle the planning.
            </p>
          </div>

          {/* Input Method Selection */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
              How would you like to build your trip?
            </h2>

            <div className="flex justify-center">
              <RadioGroup
                defaultValue="form"
                value={inputMethod}
                onValueChange={handleInputMethodChange}
                className="grid grid-cols-2 gap-4 w-full max-w-md"
              >
                <div>
                  <RadioGroupItem
                    value="form"
                    id="method-form"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="method-form"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer transition-all"
                  >
                    <PenLine className="mb-2 h-6 w-6 text-gray-600" />
                    <span className="font-semibold">Use Form</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="chat"
                    id="method-chat"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="method-chat"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer transition-all"
                  >
                    <MessageSquare className="mb-2 h-6 w-6 text-gray-600" />
                    <span className="font-semibold">Chat with AI</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Input sections */}
          <AnimatePresence mode="wait">
            {inputMethod === "form" ? (
              <motion.div
                key="form-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-8 rounded-2xl border shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="adults">Number of Adults <span className="text-red-500">*</span></Label>
                    <Input
                      id="adults"
                      type="number"
                      placeholder="e.g., 2"
                      className="focus-visible:ring-emerald-500"
                      value={formData.adults}
                      min={1}
                      step={1}
                      inputMode="numeric"
                      pattern="\\d+"
                      onChange={e => {
                        const val = e.target.value;
                        if (!/^\d*$/.test(val) || val === "0") return;
                        handleFormChange(e);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kids">Number of Kids <span className="text-red-500">*</span></Label>
                    <Input
                      id="kids"
                      type="number"
                      placeholder="e.g., 1"
                      className="focus-visible:ring-emerald-500"
                      value={formData.kids}
                      min={0}
                      step={1}
                      inputMode="numeric"
                      pattern="\\d+"
                      onChange={e => {
                        const val = e.target.value;
                        if (!/^\d*$/.test(val)) return;
                        handleFormChange(e);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (PKR)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 50000"
                      className="focus-visible:ring-emerald-500"
                      value={formData.budget}
                      min={5000}
                      onChange={handleFormChange}
                      onBlur={e => {
                        const val = e.target.value;
                        if (val && Number(val) < 5000) {
                          // Optionally, show an error or reset to 5000
                          setFormData(prev => ({ ...prev, budget: "5000" }));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Starting Point <span className="text-red-500">*</span></Label>
                    <Input
                      id="source"
                      placeholder="e.g., Lahore"
                      className="focus-visible:ring-emerald-500"
                      value={formData.source}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="destination">Destinations <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                      <Input
                        id="destination"
                        placeholder="e.g., Skardu"
                        className="focus-visible:ring-emerald-500"
                        value={destinationInput}
                        onChange={handleFormChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDestination(); } }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddDestination}
                        disabled={!destinationInput.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md px-4 py-2 rounded-md transition-colors"
                      >
                        Add
                      </Button>
                    </div>
                    {/* List of added destinations */}
                    {formData.destination.length > 0 && (
                      <ul className="flex flex-wrap gap-2 mt-2">
                        {formData.destination.map((dest: string) => (
                          <li
                            key={dest}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-emerald-200 border border-emerald-200 rounded-full px-4 py-1 shadow-sm hover:shadow-md transition-all"
                          >
                            <span className="font-medium text-emerald-900 truncate max-w-[120px]">{dest}</span>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              className="ml-1 text-emerald-600 hover:text-red-600 hover:bg-red-50 rounded-full p-1"
                              onClick={() => handleRemoveDestination(dest)}
                              aria-label="Remove destination"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="start_date"
                      type="date"
                      className="focus-visible:ring-emerald-500"
                      value={formData.start_date}
                      onChange={handleFormChange}
                      min={formatLocalDate(new Date())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="end_date"
                      type="date"
                      className="focus-visible:ring-emerald-500"
                      value={formData.end_date}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Number of Days <span className="text-red-500">*</span></Label>
                    <Input
                      id="days"
                      type="number"
                      placeholder="e.g., 5"
                      className="focus-visible:ring-emerald-500"
                      value={formData.days}
                      min={1}
                      step={1}
                      inputMode="numeric"
                      pattern="\\d+"
                      onChange={e => {
                        const val = e.target.value;
                        if (!/^\d*$/.test(val) || val === "0") return;
                        handleFormChange(e);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transport_type">Transport Type</Label>
                    <select
                      id="transport_type"
                      className="focus-visible:ring-emerald-500 w-full border rounded-md px-3 py-2"
                      value={formData.transport_type}
                      onChange={handleFormChange}
                    >
                      <option value="">Select transport</option>
                      <option value="car">Car</option>
                      <option value="bus">Bus</option>
                      <option value="train">Train</option>
                      <option value="plane">Plane</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="spots">Favorite Spots</Label>
                    <div className="flex gap-2">
                      <Input
                        id="spots"
                        placeholder="e.g., Shangrila Resort"
                        className="focus-visible:ring-emerald-500"
                        value={spotInput}
                        onChange={handleFormChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpot(); } }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddSpot}
                        disabled={!spotInput.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md px-4 py-2 rounded-md transition-colors"
                      >
                        Add
                      </Button>
                    </div>
                    {/* List of added spots */}
                    {formData.spots.length > 0 && (
                      <ul className="flex flex-wrap gap-2 mt-2">
                        {formData.spots.map((spot: string) => (
                          <li
                            key={spot}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-emerald-200 border border-emerald-200 rounded-full px-4 py-1 shadow-sm hover:shadow-md transition-all"
                          >
                            <span className="font-medium text-emerald-900 truncate max-w-[120px]">{spot}</span>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              className="ml-1 text-emerald-600 hover:text-red-600 hover:bg-red-50 rounded-full p-1"
                              onClick={() => handleRemoveSpot(spot)}
                              aria-label="Remove spot"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific preferences or requirements?"
                      className="min-h-[100px] focus-visible:ring-emerald-500"
                      value={formData.notes}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TripChatbot onDetailsGathered={setChatDetails} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <div className="mt-12 text-center space-y-3">
            <motion.div
              whileHover={isComplete ? { scale: 1.05 } : {}}
              whileTap={isComplete ? { scale: 0.95 } : {}}
            >
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!isComplete || loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all min-w-[250px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate My Itinerary"
                )}
              </Button>
            </motion.div>
            {!isComplete && !loading && (
              <p className="text-sm text-gray-400">
                {inputMethod === "form"
                  ? "Fill in all required fields to continue."
                  : "Complete the chat with the AI assistant to continue."}
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
