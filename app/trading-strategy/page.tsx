"use client";

import { useState } from "react";
import {
  TrendingUp, BarChart2, ShieldCheck, Radar, Layers,
  Settings, PieChart, Crosshair, Shuffle, TrendingDown,
  Zap, Calendar, Copy, Check, ChevronDown, ChevronUp
} from "lucide-react";

interface StrategyField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "select" | "textarea";
  options?: string[];
}

interface StrategyTemplate {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  fields: StrategyField[];
  buildPrompt: (values: Record<string, string>) => string;
}

const templates: StrategyTemplate[] = [
  {
    id: 1,
    title: "Strategy Generation",
    description: "Generate 3 profitable trading strategies tailored to your market and constraints.",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "from-turquoise-500 to-teal-500",
    fields: [
      { key: "market", label: "Market", placeholder: "e.g. crypto, stocks, forex", type: "select", options: ["crypto", "stocks", "forex", "commodities", "indices"] },
      { key: "timeframe", label: "Timeframe", placeholder: "e.g. 1D or 1H", type: "text" },
      { key: "capital", label: "Capital ($)", placeholder: "e.g. 10000", type: "text" },
      { key: "risk", label: "Risk per trade (%)", placeholder: "e.g. 1-2", type: "text" },
      { key: "extra", label: "Additional constraints (optional)", placeholder: "e.g. no leverage, long only...", type: "textarea" },
    ],
    buildPrompt: (v) =>
      `Act as a hedge fund quant. Generate 3 profitable trading strategies for the ${v.market} market.\n\nConstraints:\n- Timeframe: ${v.timeframe}\n- Capital: $${v.capital}\n- Risk per trade: ${v.risk}%${v.extra ? `\n- ${v.extra}` : ""}\n\nFor each strategy provide:\n1. Indicators used (with exact settings)\n2. Entry & exit rules (step-by-step)\n3. Stop-loss & take-profit logic\n4. Market conditions where it works best\n5. Why this strategy has an edge`,
  },
  {
    id: 2,
    title: "Backtesting",
    description: "Backtest any strategy using historical data with key performance metrics.",
    icon: <BarChart2 className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-500",
    fields: [
      { key: "strategy", label: "Strategy rules", placeholder: "Paste your strategy rules here...", type: "textarea" },
      { key: "period", label: "Time period", placeholder: "e.g. last 10 years", type: "text" },
      { key: "metrics", label: "Metrics to include", placeholder: "e.g. CAGR, Sharpe ratio, max drawdown, win rate", type: "text" },
    ],
    buildPrompt: (v) =>
      `Backtest this trading strategy using historical data:\n${v.strategy}\n\nRequirements:\n- Time period: ${v.period}\n- Metrics: ${v.metrics}\n- Output: table + summary\n\nAlso explain:\n- When it performs best/worst\n- What market conditions break it`,
  },
  {
    id: 3,
    title: "Risk-Reward Analysis",
    description: "Analyze a strategy's risk-reward profile and get improvement suggestions.",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "from-orange-500 to-red-500",
    fields: [
      { key: "strategy", label: "Strategy", placeholder: "Paste your strategy here...", type: "textarea" },
    ],
    buildPrompt: (v) =>
      `Analyze this strategy's risk-reward profile:\n${v.strategy}\n\nBreak down:\n- Risk per trade\n- Reward-to-risk ratio\n- Drawdown patterns\n\nThen:\n- Suggest 3 improvements to reduce risk\n- Suggest 2 ways to increase returns without increasing risk`,
  },
  {
    id: 4,
    title: "Market Regime Detection",
    description: "Identify current market conditions and get strategy recommendations for the environment.",
    icon: <Radar className="w-5 h-5" />,
    color: "from-purple-500 to-violet-500",
    fields: [
      { key: "asset", label: "Asset", placeholder: "e.g. BTC/USD, SPY, EUR/USD", type: "text" },
    ],
    buildPrompt: (v) =>
      `Analyze current market conditions for ${v.asset}.\n\nIdentify:\n- Trend (bull/bear/sideways)\n- Volatility level\n- Volume behavior\n\nThen recommend:\n- Best strategy type for this environment\n- What to avoid right now`,
  },
  {
    id: 5,
    title: "Multi-Factor Strategy",
    description: "Create a systematic multi-factor strategy with exact formulas and weight allocation.",
    icon: <Layers className="w-5 h-5" />,
    color: "from-teal-500 to-cyan-500",
    fields: [
      { key: "rebalance", label: "Rebalancing frequency", placeholder: "Select frequency", type: "select", options: ["daily", "weekly", "monthly", "quarterly"] },
    ],
    buildPrompt: (v) =>
      `Create a multi-factor strategy using:\n- Momentum\n- Value\n- Volatility\n- Trend\n\nInclude:\n1. Exact formula/logic for each factor\n2. Weight allocation (%)\n3. Rebalancing frequency: ${v.rebalance}\n4. Example portfolio`,
  },
  {
    id: 6,
    title: "Strategy Optimization",
    description: "Optimize an existing strategy to increase Sharpe ratio and reduce drawdown.",
    icon: <Settings className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
    fields: [
      { key: "strategy", label: "Strategy rules", placeholder: "Paste your strategy rules here...", type: "textarea" },
    ],
    buildPrompt: (v) =>
      `Optimize this trading strategy:\n${v.strategy}\n\nGoals:\n- Increase Sharpe ratio\n- Reduce drawdown\n\nImprove:\n- Indicator settings\n- Entry/exit timing\n- Filters (trend/volume/volatility)\n\nShow before vs after comparison`,
  },
  {
    id: 7,
    title: "Portfolio Construction",
    description: "Build a diversified portfolio with allocation, expected return, and risk breakdown.",
    icon: <PieChart className="w-5 h-5" />,
    color: "from-pink-500 to-rose-500",
    fields: [
      { key: "assets", label: "Assets list", placeholder: "e.g. BTC, ETH, AAPL, GLD, TLT", type: "text" },
      { key: "riskTolerance", label: "Risk tolerance", placeholder: "Select risk tolerance", type: "select", options: ["low", "medium", "high"] },
      { key: "horizon", label: "Time horizon", placeholder: "e.g. 1-3 years", type: "text" },
    ],
    buildPrompt: (v) =>
      `Build a diversified portfolio with these assets: ${v.assets}\n\nConstraints:\n- Risk tolerance: ${v.riskTolerance}\n- Time horizon: ${v.horizon}\n\nOutput:\n- Allocation %\n- Expected return\n- Risk (volatility, drawdown)\n\nAlso explain why each asset is included`,
  },
  {
    id: 8,
    title: "Trade Setup Generation",
    description: "Generate 3 high-probability trade setups with entry, stop-loss, and take-profit.",
    icon: <Crosshair className="w-5 h-5" />,
    color: "from-yellow-500 to-amber-500",
    fields: [
      { key: "market", label: "Market", placeholder: "e.g. crypto, stocks, forex", type: "select", options: ["crypto", "stocks", "forex", "commodities", "indices"] },
    ],
    buildPrompt: (v) =>
      `Based on current data, generate 3 high-probability trades for the ${v.market} market.\n\nFor each trade include:\n- Entry price\n- Stop-loss\n- Take-profit\n- Risk/reward ratio\n- Reasoning (technical + macro)`,
  },
  {
    id: 9,
    title: "Monte Carlo Simulation",
    description: "Run a Monte Carlo simulation to assess the robustness of a trading strategy.",
    icon: <Shuffle className="w-5 h-5" />,
    color: "from-slate-500 to-gray-600",
    fields: [
      { key: "strategy", label: "Strategy", placeholder: "Paste your strategy here...", type: "textarea" },
    ],
    buildPrompt: (v) =>
      `Run a Monte Carlo simulation on this strategy:\n${v.strategy}\n\nShow:\n- Probability of loss\n- Return distribution\n- Worst-case scenarios\n\nExplain if strategy is robust or fragile`,
  },
  {
    id: 10,
    title: "Drawdown Analysis",
    description: "Analyze strategy drawdowns and get suggestions to reduce them.",
    icon: <TrendingDown className="w-5 h-5" />,
    color: "from-red-500 to-rose-600",
    fields: [
      { key: "strategy", label: "Strategy", placeholder: "Paste your strategy here...", type: "textarea" },
    ],
    buildPrompt: (v) =>
      `Analyze drawdowns of this strategy:\n${v.strategy}\n\nProvide:\n- Max drawdown\n- Average recovery time\n\nThen suggest:\n- 3 ways to reduce drawdowns\n- Position sizing improvements`,
  },
  {
    id: 11,
    title: "Macro-Based Strategy",
    description: "Create a trading strategy driven by macro indicators: interest rates, inflation, and economic growth.",
    icon: <Zap className="w-5 h-5" />,
    color: "from-violet-500 to-purple-600",
    fields: [
      { key: "asset", label: "Asset / Market", placeholder: "e.g. EUR/USD, Gold, S&P 500", type: "text" },
    ],
    buildPrompt: (v) =>
      `Create a trading strategy for ${v.asset} using macro indicators:\n- Interest rates\n- Inflation\n- Economic growth\n\nExplain:\n- How each factor affects trades\n- Entry/exit signals based on macro shifts\n- Example trades for each macro scenario`,
  },
  {
    id: 12,
    title: "Alpha / Edge Detection",
    description: "Identify underexploited market opportunities and get 2 unique strategies most traders miss.",
    icon: <Calendar className="w-5 h-5" />,
    color: "from-cyan-500 to-blue-500",
    fields: [
      { key: "market", label: "Market", placeholder: "e.g. crypto, stocks, forex", type: "select", options: ["crypto", "stocks", "forex", "commodities", "indices"] },
    ],
    buildPrompt: (v) =>
      `Identify underexploited opportunities in the ${v.market} market.\n\nFocus on:\n- Behavioral inefficiencies\n- Market structure gaps\n\nThen propose:\n- 2 unique strategies\n- Why most traders miss them\n- How to execute them step-by-step`,
  },
];

export default function TradingStrategyPage() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [values, setValues] = useState<Record<number, Record<string, string>>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const setValue = (templateId: number, key: string, val: string) => {
    setValues((prev) => ({
      ...prev,
      [templateId]: { ...(prev[templateId] ?? {}), [key]: val },
    }));
  };

  const getPrompt = (t: StrategyTemplate) => {
    const v = values[t.id] ?? {};
    const filled: Record<string, string> = {};
    t.fields.forEach((f) => { filled[f.key] = v[f.key] ?? ""; });
    return t.buildPrompt(filled);
  };

  const copyPrompt = async (t: StrategyTemplate) => {
    await navigator.clipboard.writeText(getPrompt(t));
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isComplete = (t: StrategyTemplate) => {
    const v = values[t.id] ?? {};
    return t.fields
      .filter((f) => !f.placeholder.toLowerCase().includes("optional"))
      .every((f) => (v[f.key] ?? "").trim() !== "");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-turquoise-600 via-turquoise-500 to-teal-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            AI Trading Prompt Generator
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Trading Strategy Builder
          </h1>
          <p className="text-turquoise-100 text-lg max-w-2xl mx-auto">
            Fill in the parameters for any of the 12 strategy templates below and get a
            ready-to-use AI prompt — copy it straight into Claude or ChatGPT.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/70 inline-block" />12 Templates</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/70 inline-block" />Instant Copy</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/70 inline-block" />No login required</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {templates.map((t) => {
          const open = activeId === t.id;
          const done = isComplete(t);
          return (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
              {/* Card header */}
              <button
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setActiveId(open ? null : t.id)}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">#{t.id}</span>
                    <h2 className="font-bold text-gray-900 text-base">{t.title}</h2>
                    {done && (
                      <span className="ml-auto mr-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{t.description}</p>
                </div>
                <div className="text-gray-400 shrink-0">
                  {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expanded form */}
              {open && (
                <div className="border-t border-gray-100 px-6 py-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {t.fields.map((f) => (
                      <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                        <label className="label">{f.label}</label>
                        {f.type === "select" ? (
                          <select
                            className="input"
                            value={(values[t.id] ?? {})[f.key] ?? ""}
                            onChange={(e) => setValue(t.id, f.key, e.target.value)}
                          >
                            <option value="">Select…</option>
                            {f.options?.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        ) : f.type === "textarea" ? (
                          <textarea
                            rows={4}
                            className="input resize-none"
                            placeholder={f.placeholder}
                            value={(values[t.id] ?? {})[f.key] ?? ""}
                            onChange={(e) => setValue(t.id, f.key, e.target.value)}
                          />
                        ) : (
                          <input
                            type="text"
                            className="input"
                            placeholder={f.placeholder}
                            value={(values[t.id] ?? {})[f.key] ?? ""}
                            onChange={(e) => setValue(t.id, f.key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Prompt preview */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Generated Prompt</span>
                      <button
                        onClick={() => copyPrompt(t)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          copiedId === t.id
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-turquoise-50 text-turquoise-700 hover:bg-turquoise-100"
                        }`}
                      >
                        {copiedId === t.id ? (
                          <><Check className="w-3.5 h-3.5" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy prompt</>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                      {getPrompt(t)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16 text-center text-sm text-gray-400">
        Copy the prompt and paste it into Claude, ChatGPT, or any AI assistant for instant strategy analysis.
      </div>
    </div>
  );
}
