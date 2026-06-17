'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, MapPin, Briefcase, Award, Users, ChevronRight, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface User {
  id: str;
  name: string;
  headline: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  experienceYears: number;
  skills: string[];
  profileImage: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalCompanies: number;
  totalLocations: number;
  totalSkills: number;
}

export default function DirectoryHome() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  // Fetch profiles
  const { data: users = [], isLoading: isUsersLoading, error: usersError } = useQuery<User[]>({
    queryKey: ['users-details'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/users/details`);
      return res.data;
    },
  });

  // Fetch stats
  const { data: stats, isLoading: isStatsLoading } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/stats`);
      return res.data;
    },
  });

  // Get unique locations and companies for filter dropdowns
  const uniqueLocations = Array.from(new Set(users.map(u => u.location.split(',')[1]?.trim() || u.location))).filter(Boolean).sort();
  const uniqueCompanies = Array.from(new Set(users.map(u => u.company))).filter(Boolean).sort();

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !selectedLocation || user.location.includes(selectedLocation);
    const matchesCompany = !selectedCompany || user.company === selectedCompany;

    return matchesSearch && matchesLocation && matchesCompany;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl text-white shadow-lg mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Professional Network Directory
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-blue-100">
          100 Public Professional Profiles
        </p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {isStatsLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Companies</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalCompanies || 0}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Locations</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalLocations || 0}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-lg">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Unique Skills</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalSkills || 0}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters & Search Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, job title, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-slate-800"
            />
          </div>
          
          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            
            {(searchTerm || selectedCompany || selectedLocation) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCompany('');
                  setSelectedLocation('');
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 self-center px-2 py-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Listing Grid */}
      {isUsersLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="h-72 bg-white border border-slate-200 rounded-xl p-5 animate-pulse flex flex-col gap-4">
              <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto" />
              <div className="h-5 bg-slate-200 rounded w-2/3 mx-auto" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
              <div className="mt-auto h-9 bg-slate-200 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : usersError ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <p className="text-lg font-medium text-red-600">Database Connection Failed</p>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Ensure the MongoDB database is running, the target backend is active, and you have executed the seed script:
          </p>
          <code className="block mt-4 bg-slate-100 p-3 rounded font-mono text-sm max-w-sm mx-auto text-slate-800">
            python generate_users.py
          </code>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-lg font-medium text-slate-600">No profiles match your filters.</p>
          <p className="text-sm text-slate-400 mt-1">Try resetting the search or filter options.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              variants={itemVariants}
              whileHover={{ y: -5, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden group"
            >
              {/* Profile image with border */}
              <div className="relative mb-4">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 group-hover:border-blue-100 transition-colors"
                />
              </div>

              {/* Details */}
              <h2 className="text-lg font-bold text-slate-950 group-hover:text-blue-600 transition-colors line-clamp-1">
                {user.name}
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">
                {user.company}
              </p>
              <p className="text-sm text-slate-700 font-medium mt-2 line-clamp-1">
                {user.jobTitle}
              </p>
              
              <div className="flex items-center gap-1 mt-3 text-xs text-slate-400 font-medium">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="line-clamp-1">{user.location}</span>
              </div>

              {/* Skills badges */}
              <div className="flex flex-wrap justify-center gap-1 mt-4">
                {user.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
                {user.skills.length > 3 && (
                  <span className="bg-slate-100 text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded">
                    +{user.skills.length - 3} more
                  </span>
                )}
              </div>

              {/* View Profile CTA */}
              <div className="mt-6 w-full pt-4 border-t border-slate-100">
                <Link
                  href={`/user/${user.id}`}
                  className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 border border-slate-200 hover:border-blue-500 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-lg hover:bg-blue-50/30 transition-all"
                >
                  View Full Profile
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
