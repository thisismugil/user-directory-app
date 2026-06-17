'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  Bell,
  MessageSquare,
  Home,
  Grid3X3,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Calendar,
  BookOpen,
  TrendingUp,
  ChevronDown,
  Star,
  Award,
  Bookmark,
  Plus,
  UserCheck,
} from 'lucide-react';

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

interface Stats {
  totalUsers: number;
  totalCompanies: number;
  totalLocations: number;
  totalSkills: number;
}

const SAMPLE_POSTS_TEMPLATES = [
  {
    action: 'shared an article',
    content: `🚀 Excited to share that I've just been promoted to {jobTitle} at {company}! It's been an incredible journey, and I couldn't have done it without the support of my amazing team.\n\nIf you're looking to break into {field}, here are my top 3 tips:\n1. Never stop learning — invest in your skills\n2. Build genuine relationships, not just a network\n3. Embrace failure as your best teacher\n\n#CareerGrowth #Grateful #Leadership`,
    likes: 247,
    comments: 38,
    reposts: 15,
    timeAgo: '2h',
    imageUrl: null,
  },
  {
    action: 'is celebrating a work anniversary',
    content: `Today marks my {years} year anniversary at {company}! 🎉\n\nI joined as a junior {field} and today I lead a team of passionate professionals. Every year has been a new chapter of growth, challenges, and incredible memories.\n\nThank you to everyone who has been part of this journey. The best is yet to come! 💪\n\n#{company}Anniversary #MilestoneMoment`,
    likes: 512,
    comments: 91,
    reposts: 22,
    timeAgo: '5h',
    imageUrl: null,
  },
  {
    action: 'posted',
    content: `Hot take: The most underrated skill in {field} is NOT {skill1} or {skill2}.\n\nIt's communication.\n\nYou can be the best technical person in the room, but if you can't explain your ideas clearly, opportunities will pass you by.\n\nInvest in learning how to communicate your value. It will change your career.\n\nAgree or disagree? Drop your thoughts below 👇\n\n#ProfessionalDevelopment #{field}`,
    likes: 1842,
    comments: 203,
    reposts: 147,
    timeAgo: '8h',
    imageUrl: null,
  },
  {
    action: 'shared a post',
    content: `Just wrapped up an amazing workshop on {skill1} at {company}! 🧠\n\n100+ professionals came together to learn, network, and grow. The energy in the room was electric!\n\nKey takeaway: The future belongs to those who are willing to upskill continuously.\n\nWhat skill are YOU working on right now? Let me know in the comments!\n\n#LifelongLearning #Upskilling #Tech`,
    likes: 389,
    comments: 57,
    reposts: 31,
    timeAgo: '1d',
    imageUrl: null,
  },
];

const TRENDING_TOPICS = [
  { title: 'AI & Machine Learning', followers: '2.4M followers', trend: '+12%' },
  { title: 'Remote Work Culture', followers: '1.8M followers', trend: '+8%' },
  { title: 'Tech Layoffs 2025', followers: '3.1M followers', trend: '+24%' },
  { title: 'Web Development', followers: '2.9M followers', trend: '+5%' },
  { title: 'Leadership & Management', followers: '1.2M followers', trend: '+3%' },
];

function formatPostContent(template: string, user: User): string {
  const field = user.skills[0]?.split(' ')[0] || 'Tech';
  return template
    .replace(/{jobTitle}/g, user.jobTitle)
    .replace(/{company}/g, user.company)
    .replace(/{years}/g, String(user.experienceYears))
    .replace(/{skill1}/g, user.skills[0] || 'Python')
    .replace(/{skill2}/g, user.skills[1] || 'JavaScript')
    .replace(/{field}/g, field);
}

function PostCard({ user, postIndex }: { user: User; postIndex: number }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    SAMPLE_POSTS_TEMPLATES[postIndex % SAMPLE_POSTS_TEMPLATES.length].likes
  );
  const [expanded, setExpanded] = useState(false);
  const template = SAMPLE_POSTS_TEMPLATES[postIndex % SAMPLE_POSTS_TEMPLATES.length];
  const content = formatPostContent(template.content, user);
  const previewLength = 200;
  const isLong = content.length > previewLength;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: postIndex * 0.05 }}
      className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
    >
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link href={`/user/${user.id}`}>
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0 hover:opacity-90 transition-opacity"
            />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link href={`/user/${user.id}`} className="font-semibold text-sm text-slate-900 hover:text-blue-600 hover:underline">
                {user.name}
              </Link>
              <span className="text-xs text-slate-400">• {template.action}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.jobTitle} at {user.company}</p>
            <p className="text-xs text-slate-400 mt-0.5">{template.timeAgo} • 🌐</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="text-blue-600 text-xs font-semibold hover:bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Follow
          </button>
          <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {isLong && !expanded ? content.slice(0, previewLength) + '...' : content}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 font-medium ml-1 hover:underline"
            >
              {expanded ? 'see less' : 'see more'}
            </button>
          )}
        </p>
      </div>

      {/* Skills badges as hashtag accent */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {user.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="text-blue-500 text-xs hover:underline cursor-pointer">
            #{skill.replace(/\s+/g, '')}
          </span>
        ))}
      </div>

      {/* Reaction count bar */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-[8px]">👍</span>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[8px]">❤️</span>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-400 text-[8px]">😮</span>
          </span>
          <span>{liked ? likeCount : likeCount - (liked ? 0 : 0)}</span>
        </div>
        <div className="flex gap-3">
          <span>{template.comments} comments</span>
          <span>{template.reposts} reposts</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-4 py-1 border-t border-slate-100 flex items-center gap-1">
        {[
          {
            icon: <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-blue-600 text-blue-600' : ''}`} />,
            label: 'Like',
            active: liked,
            action: () => {
              setLiked(!liked);
              setLikeCount((c) => (liked ? c - 1 : c + 1));
            },
          },
          { icon: <MessageCircle className="h-4 w-4" />, label: 'Comment', active: false, action: undefined },
          { icon: <Share2 className="h-4 w-4" />, label: 'Repost', active: false, action: undefined },
          { icon: <Send className="h-4 w-4" />, label: 'Send', active: false, action: undefined },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors
              ${btn.active ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          >
            {btn.icon}
            <span className="hidden sm:inline">{btn.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function DirectoryHome() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users-details'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/users/details`);
      return res.data;
    },
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/stats`);
      return res.data;
    },
  });

  // Pick up to 8 users as "feed posts"
  const feedUsers = users.slice(0, 8);
  // Suggested connections (next 5 users)
  const suggestions = users.slice(8, 13);
  // The "logged-in" profile user (first user as demo)
  const profileUser = users[0];

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {/* LinkedIn-style top nav (full-width bar on page) */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 h-12">
          {/* Search */}
          <div className="relative w-64 mr-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#edf3f8] text-sm text-slate-700 rounded-full border border-transparent focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          {/* Nav items */}
          {[
            { icon: <Home className="h-5 w-5" />, label: 'Home', active: true },
            { icon: <Users className="h-5 w-5" />, label: 'Network', active: false },
            { icon: <Briefcase className="h-5 w-5" />, label: 'Jobs', active: false },
            { icon: <MessageSquare className="h-5 w-5" />, label: 'Messaging', active: false },
            { icon: <Bell className="h-5 w-5" />, label: 'Notifications', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`flex flex-col items-center px-3 py-1 text-xs font-medium border-b-2 transition-colors
                ${item.active
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-400'}`}
            >
              {item.icon}
              <span className="mt-0.5 hidden sm:block">{item.label}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <button className="flex flex-col items-center px-3 py-1 text-xs text-slate-500 hover:text-slate-800">
              <Grid3X3 className="h-5 w-5" />
              <span className="mt-0.5 hidden sm:block">Work</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-5">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="space-y-3">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="h-16 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 relative" />
            {isLoading || !profileUser ? (
              <div className="px-4 pt-2 pb-4 flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-slate-200 -mt-10 border-4 border-white animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
              </div>
            ) : (
              <div className="px-4 pt-2 pb-4">
                <div className="flex justify-center -mt-10 mb-2">
                  <img
                    src={profileUser.profileImage}
                    alt={profileUser.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow"
                  />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-slate-900">{profileUser.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{profileUser.headline}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  {[
                    { label: 'Profile viewers', value: '143' },
                    { label: 'Post impressions', value: '2,841' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center text-xs hover:bg-slate-50 rounded px-1 py-0.5 cursor-pointer">
                      <span className="text-slate-500">{stat.label}</span>
                      <span className="font-semibold text-blue-600">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Connections</p>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                    {stats?.totalUsers || '500'}+ connections
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent</p>
            {[
              { icon: <Users className="h-4 w-4 text-blue-500" />, label: 'My Network' },
              { icon: <Bookmark className="h-4 w-4 text-amber-500" />, label: 'Saved Posts' },
              { icon: <BookOpen className="h-4 w-4 text-indigo-500" />, label: 'Learning' },
              { icon: <Briefcase className="h-4 w-4 text-emerald-500" />, label: 'Jobs Applied' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                {item.icon}
                <span className="text-sm text-slate-700 font-medium">{item.label}</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Groups</p>
              {['AI Engineers Network', 'Remote Work Community', 'JS Developers'].map((g) => (
                <div key={g} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <div className="w-4 h-4 bg-slate-200 rounded" />
                  <span className="text-sm text-slate-700">{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium promo */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <Star className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Try Premium for free</p>
            <p className="text-xs text-slate-500 mt-1">Get AI-powered insights to grow faster</p>
            <button className="mt-3 w-full py-1.5 rounded-full border border-amber-400 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors">
              1-month free trial
            </button>
          </div>
        </aside>

        {/* ── CENTER FEED ── */}
        <main className="space-y-4 min-w-0">
          {/* Create Post Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
            <div className="flex items-center gap-3 mb-3">
              {profileUser ? (
                <img src={profileUser.profileImage} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
              )}
              <button className="flex-1 text-left text-sm text-slate-500 border border-slate-300 rounded-full px-4 py-2 hover:bg-slate-50 transition-colors">
                Start a post, try writing with AI
              </button>
            </div>
            <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
              {[
                { icon: <ImageIcon className="h-4 w-4 text-blue-500" />, label: 'Media' },
                { icon: <Video className="h-4 w-4 text-emerald-500" />, label: 'Video' },
                { icon: <Calendar className="h-4 w-4 text-amber-500" />, label: 'Event' },
                { icon: <BookOpen className="h-4 w-4 text-rose-500" />, label: 'Article' },
              ].map((item) => (
                <button key={item.label} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">Sort by:</p>
            <button className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:underline">
              Top <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Feed Posts */}
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                  <div className="h-3 bg-slate-200 rounded w-4/6" />
                </div>
              </div>
            ))
          ) : feedUsers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No profiles yet</p>
              <p className="text-xs text-slate-400 mt-1">Run the seed script to populate the database</p>
            </div>
          ) : (
            feedUsers.map((user, idx) => (
              <PostCard key={user.id} user={user} postIndex={idx} />
            ))
          )}

          {feedUsers.length > 0 && (
            <div className="text-center py-4">
              <Link href="/analytics" className="text-blue-600 text-sm font-semibold hover:underline">
                View all {stats?.totalUsers || users.length} profiles →
              </Link>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="space-y-4">
          {/* People You May Know */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-800">People you may know</p>
              <button className="text-xs text-slate-500 hover:underline">See all</button>
            </div>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-2 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              suggestions.map((user) => (
                <div key={user.id} className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate hover:text-blue-600 cursor-pointer">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.jobTitle}</p>
                    <p className="text-xs text-slate-400 truncate">{user.company}</p>
                    <button className="mt-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-full px-3 py-0.5 hover:bg-blue-50 transition-colors flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Connect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Trending Topics */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-800">LinkedIn News</p>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            {TRENDING_TOPICS.map((topic, idx) => (
              <div key={topic.title} className="py-2.5 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 rounded-lg px-1 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{topic.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{topic.followers} • <span className="text-emerald-600">{topic.trend}</span></p>
                  </div>
                </div>
              </div>
            ))}
            <button className="mt-2 text-xs text-slate-500 hover:underline flex items-center gap-1">
              Show more <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Stats Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" /> Directory Stats
            </p>
            {[
              { label: 'Total Profiles', value: stats?.totalUsers || '—', color: 'text-blue-600' },
              { label: 'Companies', value: stats?.totalCompanies || '—', color: 'text-indigo-600' },
              { label: 'Locations', value: stats?.totalLocations || '—', color: 'text-emerald-600' },
              { label: 'Unique Skills', value: stats?.totalSkills || '—', color: 'text-rose-600' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-500">{s.label}</span>
                <span className={`font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Footer links */}
          <div className="px-1">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              About · Help · Privacy · Terms · Advertising · More
            </p>
            <p className="text-[11px] text-slate-400 mt-2">LinkedIn Corp © 2025</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
