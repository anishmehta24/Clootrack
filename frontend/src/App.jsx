import React from "react";
import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("low");

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loadingLLM, setLoadingLLM] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---------------- FETCH TICKETS ----------------
  const fetchTickets = async () => {
    let url = `${API_BASE}/tickets/?search=${search}`;
    if (statusFilter) url += `&status=${statusFilter}`;

    const res = await fetch(url);
    const data = await res.json();
    setTickets(data);
  };

  // ---------------- FETCH STATS ----------------
  const fetchStats = async () => {
    const res = await fetch(`${API_BASE}/tickets/stats/`);
    const data = await res.json();
    setStats(data);
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [search, statusFilter]);

  // ---------------- AI CLASSIFY ----------------
  const classify = async () => {
    if (!description) return;

    setLoadingLLM(true);

    try {
      const res = await fetch(`${API_BASE}/tickets/classify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();
      setCategory(data.suggested_category || "general");
      setPriority(data.suggested_priority || "low");
    } catch (err) {
      console.error("LLM error:", err);
    }

    setLoadingLLM(false);
  };

  // ---------------- SUBMIT TICKET ----------------
  const submitTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    await fetch(`${API_BASE}/tickets/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, priority }),
    });

    setTitle("");
    setDescription("");
    setCategory("general");
    setPriority("low");

    setSubmitting(false);
    fetchTickets();
    fetchStats();
  };

  // ---------------- UPDATE STATUS ----------------
  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/tickets/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    fetchTickets();
    fetchStats();
  };

  // Helper functions for badge styling
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "billing": return "bg-purple-100 text-purple-800 border-purple-300";
      case "technical": return "bg-blue-100 text-blue-800 border-blue-300";
      case "account": return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "general": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800 border-blue-300";
      case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "resolved": return "bg-green-100 text-green-800 border-green-300";
      case "closed": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎫 Support Ticket System
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">AI-Powered Ticket Management</p>
        </div>

        {/* ---------------- FORM ---------------- */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">✨</span>
            <h2 className="text-2xl font-bold text-gray-800">Create New Ticket</h2>
          </div>

          <form onSubmit={submitTicket} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Title
              </label>
              <input
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="Brief description of your issue..."
                maxLength={200}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                className="w-full border-2 border-gray-200 p-3 rounded-lg h-32 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                placeholder="Provide detailed information about your issue..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={classify}
              />
              {loadingLLM && (
                <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span className="font-medium">🤖 AI is analyzing your ticket...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="billing">💰 Billing</option>
                  <option value="technical">🔧 Technical</option>
                  <option value="account">👤 Account</option>
                  <option value="general">📋 General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "✉️ Submit Ticket"
              )}
            </button>
          </form>
        </div>

        {/* ---------------- STATS DASHBOARD ---------------- */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total_tickets}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🔓</span>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">Open Tickets</p>
              <p className="text-3xl font-bold text-blue-600">{stats.open_tickets}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📈</span>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">Avg per Day</p>
              <p className="text-3xl font-bold text-purple-600">{stats.avg_tickets_per_day}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🚨</span>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">Critical Priority</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.priority_breakdown?.critical || 0}
              </p>
            </div>
          </div>
        )}

        {/* ---------------- FILTERS ---------------- */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔍</span>
            <h3 className="text-lg font-semibold text-gray-800">Search & Filter</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="🔎 Search tickets by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white sm:w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">📋 All Status</option>
              <option value="open">🔓 Open</option>
              <option value="in_progress">⚙️ In Progress</option>
              <option value="resolved">✅ Resolved</option>
              <option value="closed">🔒 Closed</option>
            </select>
          </div>
        </div>

        {/* ---------------- TICKET LIST ---------------- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎫</span>
            <h3 className="text-xl font-bold text-gray-800">
              Tickets {tickets.length > 0 && `(${tickets.length})`}
            </h3>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets found</h3>
              <p className="text-gray-500">Create your first ticket or adjust your filters</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all hover:border-blue-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                  <h3 className="font-bold text-xl text-gray-800 flex-1">{t.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(t.category)}`}>
                      {t.category.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(t.priority)}`}>
                      {t.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">{t.description}</p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">Status:</span>
                    <select
                      className={`border-2 px-3 py-1.5 rounded-lg text-sm font-semibold outline-none transition-all cursor-pointer ${getStatusColor(t.status)}`}
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                    >
                      <option value="open">🔓 Open</option>
                      <option value="in_progress">⚙️ In Progress</option>
                      <option value="resolved">✅ Resolved</option>
                      <option value="closed">🔒 Closed</option>
                    </select>
                  </div>

                  <div className="text-xs text-gray-400 font-medium">
                    Ticket #{t.id}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
