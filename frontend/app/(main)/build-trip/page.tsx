"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, PenLine, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SIMULATED_DELAY } from "@/config/site";

export default function BuildTripPage() {
  const [inputMethod, setInputMethod] = useState<"form" | "text">("form");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    people: "",
    source: "",
    destination: "",
    budget: "",
    spots: "",
    notes: "",
  });

  const [textInput, setTextInput] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
    setLoading(false);
  };

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
                onValueChange={(value) =>
                  setInputMethod(value as "form" | "text")
                }
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
                    <PenLine className="mb-2 h-6 w-6 text-gray-600 peer-data-[state=checked]:text-emerald-600" />
                    <span className="font-semibold">Use Form</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="text"
                    id="method-text"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="method-text"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer transition-all"
                  >
                    <FileText className="mb-2 h-6 w-6 text-gray-600 peer-data-[state=checked]:text-emerald-600" />
                    <span className="font-semibold">Write Details</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid md:grid-cols-1 gap-8 relative">
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
                      <Label htmlFor="people">Number of People</Label>
                      <Input
                        id="people"
                        type="number"
                        placeholder="e.g., 2"
                        className="focus-visible:ring-emerald-500"
                        value={formData.people}
                        onChange={(e) =>
                          setFormData({ ...formData, people: e.target.value })
                        }
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
                        onChange={(e) =>
                          setFormData({ ...formData, budget: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Starting Point</Label>
                      <Input
                        id="source"
                        placeholder="e.g., Lahore"
                        className="focus-visible:ring-emerald-500"
                        value={formData.source}
                        onChange={(e) =>
                          setFormData({ ...formData, source: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        placeholder="e.g., Skardu"
                        className="focus-visible:ring-emerald-500"
                        value={formData.destination}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            destination: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="spots">
                        Favorite Spots (Comma separated)
                      </Label>
                      <Input
                        id="spots"
                        placeholder="e.g., Shangrila Resort, Deosai Plains"
                        className="focus-visible:ring-emerald-500"
                        value={formData.spots}
                        onChange={(e) =>
                          setFormData({ ...formData, spots: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any specific preferences or requirements?"
                        className="min-h-[100px] focus-visible:ring-emerald-500"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="text-section"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-8 rounded-2xl border shadow-sm"
                >
                  <div className="space-y-4">
                    <Label htmlFor="trip-details" className="text-lg">
                      Describe your trip details
                    </Label>
                    <Textarea
                      id="trip-details"
                      placeholder="Share your destination, budget, spots you want to visit, and more. For example: I want to visit Hunza with 3 friends for 5 days. Our budget is 100k PKR. We want to see Attabad Lake and Altit Fort."
                      className="min-h-[300px] text-lg p-6 focus-visible:ring-emerald-500 resize-y shadow-inner"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Button */}
          <div className="mt-12 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all min-w-[250px]"
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
          </div>
        </motion.div>
      </main>
    </div>
  );
}
