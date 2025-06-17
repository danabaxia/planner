import { Bell, Database, Palette, Shield, User } from 'lucide-react'

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and application preferences
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Settings Navigation */}
            <div className="md:col-span-1">
              <nav className="space-y-2">
                <a
                  href="#profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
                >
                  <User className="w-4 h-4" />
                  Profile
                </a>
                <a
                  href="#notion"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Notion Integration
                </a>
                <a
                  href="#notifications"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </a>
                <a
                  href="#appearance"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Palette className="w-4 h-4" />
                  Appearance
                </a>
                <a
                  href="#privacy"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Privacy & Security
                </a>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Profile Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your name"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="your.email@example.com"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notion Integration */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      Notion Integration
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center py-8">
                        <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">
                          Connect your Notion workspace
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Sync your activities and planning data with Notion
                        </p>
                        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                          Connect Notion
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="border-t border-border pt-6">
                    <div className="flex justify-end gap-4">
                      <button className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors">
                        Cancel
                      </button>
                      <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
