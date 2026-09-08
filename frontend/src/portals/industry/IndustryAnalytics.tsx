import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { api } from '../../services/api';
import type { SkillDemandResponse } from '../../types';

export const IndustryAnalytics: React.FC = () => {
  const [demandData, setDemandData] = useState<SkillDemandResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getSkillDemandAnalytics()
      .then(res => setDemandData(res))
      .catch(() => setDemandData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Industry Skill Demand Analytics</h1>
        <p className="text-xs text-slate-500">Market Skill Demand & Internship vs. Placement Distribution</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading market demand analytics...
        </div>
      ) : demandData ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Top Skill Demand Across Postings ({demandData.total_opportunities} total postings)</span>
            </h3>

            <div className="space-y-3">
              {demandData.skills.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{item.skill_name} ({item.category})</span>
                    <span className="text-emerald-700">{item.opportunity_count} Postings ({item.percentage}%)</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          No demand analytics available.
        </div>
      )}
    </div>
  );
};
