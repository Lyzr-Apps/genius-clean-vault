'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Loader2, BarChart3, Zap, Package, Code2, Database } from 'lucide-react'

interface Architecture {
  architecture_pattern: string
  pattern_rationale: string
  components: {
    agents: number
    knowledge_bases: number
    tools: number
    has_manager: boolean
    memory_requirements: string
  }
  agents_list: Array<{
    name: string
    role: string
    description: string
    tools_needed: string[]
    knowledge_base_needed: boolean
  }>
  tools_needed: string[]
  knowledge_bases: Array<{
    name: string
    purpose: string
  }>
  estimated_token_usage: {
    per_session_input_tokens: number
    per_session_output_tokens: number
    reasoning: string
  }
  complexity_score: number
  implementation_summary: string
}

interface CostBreakdown {
  setup_costs: {
    agents: { count: number; unit_cost: number; total: number }
    knowledge_bases: { count: number; unit_cost: number; total: number }
    tools: { count: number; unit_cost: number; total: number }
    setup_subtotal: number
  }
  monthly_costs: {
    retrieval_operations: { count: number; unit_cost: number; total: number }
    agent_executions: { count: number; unit_cost: number; total: number }
    token_costs: {
      input_tokens: { count: number; price_per_million: number; total: number }
      output_tokens: { count: number; price_per_million: number; total: number }
      subtotal: number
    }
    monthly_subtotal: number
  }
  summary: {
    setup_total: number
    monthly_total: number
    annual_projection: number
    per_session_cost: number
    model_used: string
  }
  cost_breakdown_detailed: Array<{
    item: string
    quantity: number
    unit_cost: number
    total: number
  }>
}

interface CalculationResult {
  architecture: Architecture
  costs: CostBreakdown
  summary: {
    total_monthly_cost: number
    total_annual_cost: number
    per_session_cost: number
    complexity: string
    recommendation: string
  }
}

const SAMPLE_PROBLEMS = [
  {
    title: 'Customer Support Chatbot',
    description: 'AI assistant that searches company docs, creates tickets, and sends email summaries'
  },
  {
    title: 'Content Analysis Tool',
    description: 'Analyzes user-submitted content across multiple domains with automated categorization'
  },
  {
    title: 'Sales Intelligence Platform',
    description: 'Processes leads, ranks by priority, sends automated follow-ups via email and Slack'
  }
]

export default function HomePage() {
  const [problemStatement, setProblemStatement] = useState('')
  const [selectedModel, setSelectedModel] = useState<'gpt-41' | 'gpt-4-mini' | 'gpt-4-nano'>('gpt-4-mini')
  const [monthlySessions, setMonthlySessions] = useState<number>(1000)
  const [queriesPerSession, setQueriesPerSession] = useState<number>(3)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const modelLabels = {
    'gpt-41': 'GPT-4.1',
    'gpt-4-mini': 'GPT-4 Mini',
    'gpt-4-nano': 'GPT-4 Nano'
  }

  const handleCalculate = async () => {
    if (!problemStatement.trim()) {
      setError('Please describe your app idea')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze this problem and calculate costs:
Problem Statement: ${problemStatement}
Selected Model: ${modelLabels[selectedModel]}
Monthly Sessions: ${monthlySessions}
Queries Per Session: ${queriesPerSession}`,
          agent_id: '693a5b99bc73a1ed4a58e89d'
        })
      })

      const data = await response.json()

      if (data.success && data.response) {
        const parsed =
          typeof data.response === 'string' ? JSON.parse(data.response) : data.response
        setResult(parsed)
      } else if (data.raw_response) {
        try {
          const parsed = JSON.parse(data.raw_response)
          setResult(parsed)
        } catch {
          setError('Unable to parse response. Please try again.')
        }
      } else {
        setError('No response received from the calculation service')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSampleClick = (sample: (typeof SAMPLE_PROBLEMS)[0]) => {
    setProblemStatement(sample.description)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1f36' }}>
      {/* Header */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-7 h-7" style={{ color: '#4F46E5' }} />
            <h1 className="text-3xl font-bold text-white">Lyzr Credit Calculator</h1>
          </div>
          <p className="text-gray-400">Transform your idea into architecture and cost estimates</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" style={{ color: '#4F46E5' }} />
                  Describe Your Application
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Provide details about what you want to build
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Problem Statement
                  </label>
                  <Textarea
                    placeholder="e.g., AI assistant that searches company docs, creates tickets, and sends email summaries"
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    className="bg-slate-700 border-gray-600 text-white placeholder-gray-500 min-h-32"
                  />
                </div>

                {/* Quick Start Samples */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Or try a sample:</p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROBLEMS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSampleClick(sample)}
                        className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition"
                      >
                        {sample.title}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Section */}
            <Card className="bg-slate-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5" style={{ color: '#4F46E5' }} />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AI Model
                    </label>
                    <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as any)}>
                      <SelectTrigger className="bg-slate-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-gray-600">
                        <SelectItem value="gpt-41" className="text-white">
                          GPT-4.1 (Premium)
                        </SelectItem>
                        <SelectItem value="gpt-4-mini" className="text-white">
                          GPT-4 Mini (Standard)
                        </SelectItem>
                        <SelectItem value="gpt-4-nano" className="text-white">
                          GPT-4 Nano (Economy)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Monthly Sessions
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={monthlySessions}
                      onChange={(e) => setMonthlySessions(parseInt(e.target.value) || 0)}
                      className="bg-slate-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Avg Queries/Session
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={queriesPerSession}
                      onChange={(e) => setQueriesPerSession(parseInt(e.target.value) || 1)}
                      className="bg-slate-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculate Button */}
            <Button
              onClick={handleCalculate}
              disabled={loading || !problemStatement.trim()}
              className="w-full h-11 text-base font-semibold"
              style={{
                backgroundColor: '#4F46E5',
                color: 'white',
                opacity: loading || !problemStatement.trim() ? 0.6 : 1
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Calculate Credits
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 rounded bg-red-900 border border-red-700">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-gray-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-300">
                <div>
                  <p className="font-semibold text-white mb-1">1. Describe</p>
                  <p>Tell us what application you want to build</p>
                </div>
                <Separator className="bg-gray-700" />
                <div>
                  <p className="font-semibold text-white mb-1">2. Analyze</p>
                  <p>AI generates optimal architecture and components</p>
                </div>
                <Separator className="bg-gray-700" />
                <div>
                  <p className="font-semibold text-white mb-1">3. Estimate</p>
                  <p>Get detailed cost breakdown with monthly projections</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-16 space-y-8">
            <h2 className="text-2xl font-bold text-white">Calculation Results</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-gray-400 text-sm mb-1">Setup Cost</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(result.costs.summary.setup_total)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-gray-400 text-sm mb-1">Monthly Cost</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(result.costs.summary.monthly_total)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-gray-400 text-sm mb-1">Annual Projection</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(result.costs.summary.annual_projection)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-gray-400 text-sm mb-1">Per Session</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(result.costs.summary.per_session_cost)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Architecture & Costs Tabs */}
            <Tabs defaultValue="architecture" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-gray-700">
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
                <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
              </TabsList>

              {/* Architecture Tab */}
              <TabsContent value="architecture" className="space-y-6 mt-6">
                <Card className="bg-slate-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Architecture Pattern</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Pattern</p>
                      <Badge
                        style={{ backgroundColor: '#4F46E5', color: 'white' }}
                        className="text-base"
                      >
                        {result.architecture.architecture_pattern}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Rationale</p>
                      <p className="text-white">{result.architecture.pattern_rationale}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Summary</p>
                      <p className="text-white">{result.architecture.implementation_summary}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Components Overview */}
                <Card className="bg-slate-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Components Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-700 rounded border border-gray-600">
                        <p className="text-gray-400 text-sm">Agents</p>
                        <p className="text-2xl font-bold text-white">
                          {result.architecture.components.agents}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-700 rounded border border-gray-600">
                        <p className="text-gray-400 text-sm">Knowledge Bases</p>
                        <p className="text-2xl font-bold text-white">
                          {result.architecture.components.knowledge_bases}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-700 rounded border border-gray-600">
                        <p className="text-gray-400 text-sm">Tools</p>
                        <p className="text-2xl font-bold text-white">
                          {result.architecture.components.tools}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-700 rounded border border-gray-600">
                        <p className="text-gray-400 text-sm">Complexity</p>
                        <p className="text-2xl font-bold text-white">
                          {result.architecture.complexity_score}/10
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Agents List */}
                {result.architecture.agents_list.length > 0 && (
                  <Card className="bg-slate-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Agents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.architecture.agents_list.map((agent, idx) => (
                        <div key={idx} className="p-4 bg-slate-700 rounded border border-gray-600">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-white">{agent.name}</p>
                              <p className="text-sm text-gray-400">{agent.role}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{agent.description}</p>
                          {agent.tools_needed.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {agent.tools_needed.map((tool, tidx) => (
                                <Badge key={tidx} variant="outline" className="text-gray-300">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Cost Breakdown Tab */}
              <TabsContent value="costs" className="space-y-6 mt-6">
                {/* Setup Costs */}
                <Card className="bg-slate-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Setup Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">
                          Agent Creation ({result.costs.setup_costs.agents.count} agents)
                        </span>
                        <span className="text-white font-semibold">
                          {formatCurrency(result.costs.setup_costs.agents.total)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">
                          Knowledge Bases ({result.costs.setup_costs.knowledge_bases.count} KB)
                        </span>
                        <span className="text-white font-semibold">
                          {formatCurrency(result.costs.setup_costs.knowledge_bases.total)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">
                          Tools ({result.costs.setup_costs.tools.count} tools)
                        </span>
                        <span className="text-white font-semibold">
                          {formatCurrency(result.costs.setup_costs.tools.total)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 bg-slate-700 px-3 rounded font-semibold">
                        <span className="text-white">Setup Subtotal</span>
                        <span className="text-white">
                          {formatCurrency(result.costs.setup_costs.setup_subtotal)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Costs */}
                <Card className="bg-slate-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Monthly Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">
                          Retrieval Operations (
                          {result.costs.monthly_costs.retrieval_operations.count})
                        </span>
                        <span className="text-white font-semibold">
                          {formatCurrency(result.costs.monthly_costs.retrieval_operations.total)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">
                          Agent Executions ({result.costs.monthly_costs.agent_executions.count})
                        </span>
                        <span className="text-white font-semibold">
                          {formatCurrency(result.costs.monthly_costs.agent_executions.total)}
                        </span>
                      </div>

                      {/* Token Costs */}
                      <div className="mt-4 pt-2 border-t border-gray-700">
                        <p className="text-gray-400 text-xs font-semibold mb-2">Token Costs</p>
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-gray-400">
                            Input Tokens (
                            {(
                              result.costs.monthly_costs.token_costs.input_tokens.count /
                              1000000
                            ).toFixed(2)}
                            M)
                          </span>
                          <span className="text-white">
                            {formatCurrency(
                              result.costs.monthly_costs.token_costs.input_tokens.total
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-gray-400">
                            Output Tokens (
                            {(
                              result.costs.monthly_costs.token_costs.output_tokens.count /
                              1000000
                            ).toFixed(2)}
                            M)
                          </span>
                          <span className="text-white">
                            {formatCurrency(
                              result.costs.monthly_costs.token_costs.output_tokens.total
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between py-3 bg-slate-700 px-3 rounded font-semibold mt-4">
                        <span className="text-white">Monthly Total</span>
                        <span className="text-white">
                          {formatCurrency(result.costs.monthly_costs.monthly_subtotal)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Summary */}
                <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-gray-600 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Cost Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Setup</span>
                      <span className="text-xl font-bold text-white">
                        {formatCurrency(result.costs.summary.setup_total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Monthly</span>
                      <span className="text-xl font-bold text-white">
                        {formatCurrency(result.costs.summary.monthly_total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Annual</span>
                      <span className="text-xl font-bold text-white">
                        {formatCurrency(result.costs.summary.annual_projection)}
                      </span>
                    </div>
                    <Separator className="bg-gray-600 my-2" />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400 text-sm">Per Session</span>
                      <span className="text-lg font-bold" style={{ color: '#4F46E5' }}>
                        {formatCurrency(result.costs.summary.per_session_cost)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
