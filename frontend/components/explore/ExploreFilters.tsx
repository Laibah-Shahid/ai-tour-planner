"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, MapPin, Calendar, Wallet } from "lucide-react";
import { categories, budgets, seasons, distances } from "@/data/filters";

export default function ExploreFilters() {
  const [selectedCategory, setSelectedCategory] = useState("Nature");

  return (
    <section
      id="explore-filters"
      className="py-12 bg-gray-50 border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Filter className="w-6 h-6 text-emerald-500" />
            Refine Your Search
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <label
                htmlFor="filter-category"
                className="text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >
                Category
              </label>
              <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                <select
                  id="filter-category"
                  className="w-full bg-transparent p-2 outline-none text-gray-700 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="filter-budget"
                className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" /> Budget
              </label>
              <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                <select
                  id="filter-budget"
                  className="w-full bg-transparent p-2 outline-none text-gray-700 cursor-pointer"
                >
                  {budgets.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="filter-season"
                className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Season
              </label>
              <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                <select
                  id="filter-season"
                  className="w-full bg-transparent p-2 outline-none text-gray-700 cursor-pointer"
                >
                  {seasons.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="filter-distance"
                className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Distance
              </label>
              <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                <select
                  id="filter-distance"
                  className="w-full bg-transparent p-2 outline-none text-gray-700 cursor-pointer"
                >
                  {distances.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mt-4"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
