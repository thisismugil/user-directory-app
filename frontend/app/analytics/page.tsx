'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Terminal, Activity, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AnalyticsData {
  totalViews: number;
  totalApiRequests: number;
  topViewed: { id: string; name: string; views: number }[];
  requestsPerMinute: { time: string; requests: number }[];
}

export default function TargetAnalytics() {
  const { data: analytics, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['target-analytics'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/analytics`);
      return res.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds to show live scrap logs!
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 bg-slate-200 w-1/4 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-80 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-red-600">Analytics Error</h2>
          <p className="text-sm text-slate-500 mt-2">Could not retrieve server audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Audit & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time tracking of public profile requests and API views.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 hover:border-blue-500 bg-white text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-lg hover:bg-blue-50/20 transition-all self-start sm:self-center"
        >
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Profile Views</p>
            <p className="text-3xl font-extrabold text-slate-950 mt-2">{analytics.totalViews}</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl">
            <Eye className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total API Requests</p>
            <p className="text-3xl font-extrabold text-slate-950 mt-2">{analytics.totalApiRequests}</p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-xl">
            <Terminal className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Monitoring</p>
            <p className="text-sm font-semibold text-emerald-600 mt-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Awaiting Scraping Traffic
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* RPM Line Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-blue-600" />
            Backend API Requests Per Minute
          </h3>
          <div className="h-72 w-full">
            {analytics.requestsPerMinute.length === 0 || analytics.requestsPerMinute.every(r => r.requests === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <p className="text-sm font-medium">No active API request logs</p>
                <p className="text-xs max-w-xs mt-1">Once the scraping dashboard begins extracting data, requests will log in real-time.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.requestsPerMinute}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    labelClassName="font-bold text-xs text-slate-800"
                  />
                  <Line type="monotone" dataKey="requests" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Profiles Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
            Most Viewed Professional Profiles
          </h3>
          <div className="h-72 w-full">
            {analytics.topViewed.length === 0 || analytics.topViewed.every(u => u.views === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <p className="text-sm font-medium">No profile view logs yet</p>
                <p className="text-xs max-w-xs mt-1">Click profile cards on the directory home page or scrape detailed views to trigger audits.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topViewed} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={120} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Bar dataKey="views" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Warning */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h4 className="text-sm font-bold tracking-tight text-white">Understanding Logging Audits</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            In standard systems, each individual user profile fetch is logged to a transactional logs table. High volumes of request logs concentrated in short intervals (as visualised in the Requests Per Minute graph) reveal automated crawling operations in progress.
          </p>
        </div>
      </div>
    </div>
  );
}
