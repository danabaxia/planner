import { Calendar, CheckCircle, Clock, Plus } from 'lucide-react'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Daily Activity Planner
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Beautiful Notion-powered planning with Motion-inspired design
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Connect Notion
            </button>
            <button className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-xl border border-border bg-card card-hover animate-slide-up">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-muted-foreground">
              AI-powered scheduling that adapts to your workflow and priorities.
            </p>
          </div>

          <div
            className="p-6 rounded-xl border border-border bg-card card-hover animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Notion Integration</h3>
            <p className="text-muted-foreground">
              Seamlessly sync with your existing Notion databases and workflows.
            </p>
          </div>

          <div
            className="p-6 rounded-xl border border-border bg-card card-hover animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
            <p className="text-muted-foreground">
              Track time spent on activities and get insights into your
              productivity.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="bg-muted/50 rounded-xl p-8 text-center animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Connect your Notion workspace and start planning your day with
            beautiful, intuitive tools.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Get Started
          </button>
        </div>
      </div>
    </main>
  )
}
