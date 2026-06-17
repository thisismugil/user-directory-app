'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Compass } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface User {
  id: string;
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

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-44 bg-slate-200 rounded-t-xl animate-pulse" />
        <div className="bg-white border border-slate-200 rounded-b-xl p-8 relative flex flex-col gap-6 animate-pulse">
          <div className="w-32 h-32 bg-slate-300 rounded-full border-4 border-white absolute -top-16 left-8" />
          <div className="pt-16 flex flex-col gap-4">
            <div className="h-7 bg-slate-200 rounded w-1/3" />
            <div className="h-5 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
          </div>
          <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="h-20 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-red-600">Profile Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            The profile with ID &quot;{userId}&quot; does not exist or access was blocked.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white rounded-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
        {/* Banner cover */}
        <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 relative">
          <span className="absolute right-4 top-4 bg-white/20 backdrop-blur text-white border border-white/20 text-xs font-semibold px-2.5 py-1 rounded">
            Public Profile ID: {user.id}
          </span>
        </div>
        
        {/* Content Container */}
        <div className="px-8 pb-8 pt-2 relative">
          {/* Avatar floating */}
          <div className="absolute -top-16 left-8">
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>
          
          {/* Header Info */}
          <div className="pt-20 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-700 font-medium mt-1">{user.headline}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {user.jobTitle} at {user.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {user.location}
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-600 font-medium">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Company</p>
              <p className="text-sm font-bold text-slate-900">{user.company}</p>
              <p className="text-slate-500">{user.jobTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Summary / Experience */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Experience card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Professional Experience
            </h3>
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{user.jobTitle}</h4>
                <p className="text-sm font-semibold text-slate-600">{user.company} &bull; Full-time</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Present &bull; {user.experienceYears} Years Experience</span>
                </div>
                <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                  Leading strategic engineering initiatives and collaborating with cross-functional teams to build and scale backend microservices and modern frontend architectures. Focus areas include optimizing cloud resources, containerizing legacy apps, and mentoring junior staff.
                </p>
              </div>
            </div>
          </div>

          {/* Education card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Education
            </h3>
            
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{user.education.split(',')[0]}</h4>
                <p className="text-sm text-slate-600 mt-0.5">{user.education.split(',')[1]?.trim() || user.education}</p>
                <p className="text-xs text-slate-400 mt-1">Graduated with Honors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Contact & Skills */}
        <div className="flex flex-col gap-6">
          {/* Contact Details Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Contact Information
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="text-slate-400 hover:text-blue-600 transition-colors">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                  <a href={`mailto:${user.email}`} className="text-sm font-semibold text-blue-600 hover:underline">
                    {user.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-slate-400 hover:text-blue-600 transition-colors">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                  <p className="text-sm font-semibold text-slate-800">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-slate-400">
                  <Compass className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Joined System</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 leading-relaxed">
              <strong>Exposure Notice:</strong> This profile details card shows personal contact credentials (email, phone) openly exposed. An attacker exploiting automated API querying can pull this data from all 100 professionals in seconds.
            </div>
          </div>

          {/* Skills Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Featured Skills
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200/50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
