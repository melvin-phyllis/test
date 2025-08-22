# Prompts v0 pour Global AI Prospecting Platform 🚀

## 🎯 Prompt Principal - Dashboard

```
Create a modern React dashboard for an international AI prospecting platform. 

REQUIREMENTS:
- **Header**: "Global AI Prospecting Platform" with connection status indicator
- **KPI Cards**: Total campaigns (142), Active campaigns (8), Total prospects (2,847), Success rate (94.2%)
- **Real-time activity feed** showing AI agents working: "Market Researcher analyzing German automotive sector", "Content Writer creating personalized outreach for 15 French fintech companies"
- **Interactive world map** showing targeted countries with prospect counts
- **Recent campaigns table** with country flags, progress bars, and action buttons
- **Agent status panel** with 3 AI agents: Global Market Researcher (Working), International Prospecting Specialist (Completed), Global Content Writer (Idle)

DESIGN: Clean, modern, blue (#3B82F6) color scheme, shadcn/ui components, responsive grid layout

DATA EXAMPLES:
- Campaigns: "Tech Expansion Germany" (🇩🇪, Running, 67%), "FinTech Canada" (🇨🇦, Completed, 100%)
- Countries: Germany (234 prospects), France (189), Canada (156), UK (98)
- Agents working in real-time with progress indicators
```

## 🌍 Prompt Création Campagne - Modal Avancé

```
Design an advanced campaign creation modal for international prospecting.

COMPONENTS NEEDED:
1. **Country Selector** with grouped options:
   - 🇪🇺 Europe: France, Germany, UK, Spain, Italy, Netherlands
   - 🇺🇸 North America: USA, Canada, Mexico  
   - 🌏 Asia-Pacific: Japan, Singapore, Australia, India
   - 🌍 Africa: South Africa, Nigeria, Kenya, Morocco
   - 🌎 Latin America: Brazil, Argentina, Chile

2. **Modern Sectors** with icons:
   - 🚀 Technology, 💰 FinTech, 🏥 MedTech, 🛒 E-commerce
   - ☁️ SaaS, 🏭 Industry 4.0, 🚗 Automotive, 🏠 PropTech
   - ⚡ EnergyTech, 📚 EdTech, 🌱 AgTech, 🔐 CyberSecurity

3. **Form Fields**:
   - Campaign name (text input)
   - Product description (rich textarea)  
   - Country selection (grouped dropdown)
   - Sector selection (checkbox grid)
   - Prospect count (slider 1-100)
   - AI agent configuration (toggles)

4. **Preview Panel**: Shows selected countries with flags, estimated timeline, agent workflow

INTERACTION: Multi-step form with smooth transitions, real-time validation, smart defaults (France selected), contextual help text "AI agents will adapt to local market culture"

DESIGN: Large modal (800px), clean layout, progress indicator, primary blue actions
```

## 📊 Prompt Page Prospects Internationale

```
Create a comprehensive international prospects management page.

FEATURES REQUIRED:

1. **Header Section**:
   - Title: "International Prospects" 
   - Subtitle: "2,847 prospects found worldwide"
   - Export buttons: CSV, Excel, PDF
   - Bulk actions dropdown

2. **Advanced Filters Bar**:
   - Country autocomplete with flags
   - Sector multi-select chips  
   - Quality score range slider (0-10)
   - Status badges filter
   - Date range picker
   - Clear all filters button

3. **Prospects Table** with columns:
   - Company logo + name
   - Country flag + location
   - Sector badge
   - Contact (name, position)
   - Email + LinkedIn links
   - Quality score (colored gauge)
   - Status badge
   - Actions menu

4. **Sample Data**:
   - SAP Deutschland (🇩🇪 Walldorf, Enterprise Software, Klaus Mueller - Sales Manager, 9.2/10)
   - Microsoft France (🇫🇷 Paris, Technology, Marie Dubois - Partnerships Director, 8.8/10)
   - Shopify Canada (🇨🇦 Ottawa, E-commerce, James Thompson - Enterprise Sales, 9.5/10)

5. **Interactions**:
   - Row hover effects
   - Sortable columns
   - Expandable row details
   - Quick actions (email, LinkedIn)
   - Bulk selection
   - Real-time search

DESIGN: Clean table design, international business feel, quality indicators, smooth interactions
```

## 🤖 Prompt Monitoring Agents Temps Réel

```
Design a real-time AI agents monitoring interface for campaign tracking.

AGENTS TO DISPLAY:
1. **Global Market Researcher**
   - Avatar: 🔍 Robot with magnifying glass
   - Status: Working (animated pulse)
   - Current task: "Analyzing automotive companies in Germany"
   - Progress: 67% (animated progress ring)
   - Last activity: "Found 15 potential leads in Stuttgart"

2. **International Prospecting Specialist**  
   - Avatar: 🌐 Robot with globe
   - Status: Completed (green checkmark)
   - Current task: "Contact research for 23 French fintech companies"
   - Progress: 100%
   - Last activity: "Successfully extracted 89 verified contacts"

3. **Global Content Writer**
   - Avatar: ✍️ Robot with pen
   - Status: Idle (gray, sleeping icon)
   - Current task: "Waiting for prospects data"
   - Progress: 0%
   - Last activity: "Ready to create personalized content"

COMPONENTS:
- **Agent Status Cards**: Large cards with avatars, status indicators, progress rings
- **Activity Timeline**: Live feed of agent actions with timestamps
- **Performance Metrics**: Success rates, speed indicators, quality scores
- **Task Queue**: Upcoming tasks for each agent

REAL-TIME FEATURES:
- WebSocket live updates
- Smooth animations for status changes
- Progress bar animations
- Notification badges for new activities
- Auto-refresh indicators

DESIGN: Modern card layout, agent personalities with unique avatars, live status indicators, engaging animations
```

## 📈 Prompt Analytics Géographique

```
Create an international analytics dashboard with geographic insights.

MAIN COMPONENTS:

1. **Interactive World Map**:
   - Color-coded countries by prospect density
   - Clickable regions showing detailed stats
   - Hover tooltips with metrics
   - Zoom functionality for regions
   - Heat map overlay option

2. **Geographic Metrics Cards**:
   - Total countries targeted: 23
   - Top performing region: Europe (94.2% success)
   - Highest prospect density: Germany (234 prospects)
   - Recent expansion: Added 5 new countries this month

3. **Country Performance Table**:
   - Columns: Country flag, name, prospects found, quality score, success rate, trend
   - Sample data:
     🇩🇪 Germany: 234 prospects, 8.9 quality, 96% success, ↗️ trending up
     🇫🇷 France: 189 prospects, 8.7 quality, 94% success, ↗️ trending up  
     🇨🇦 Canada: 156 prospects, 9.1 quality, 98% success, ↗️ trending up

4. **Sector Distribution by Region**:
   - Bar charts showing popular sectors per region
   - Europe: Technology 35%, FinTech 28%, Industry 4.0 20%
   - North America: SaaS 42%, FinTech 25%, Technology 18%
   - Asia-Pacific: Technology 38%, E-commerce 22%, Manufacturing 15%

5. **Trend Analysis**:
   - Time series charts for prospects over time by region
   - Seasonal patterns by geography
   - Growth projections

INTERACTIONS: Clickable map regions, filterable charts, drill-down capabilities, export options

DESIGN: Professional analytics look, clear data visualization, international business theme
```

## 🔄 Prompt WebSocket Temps Réel

```
Create a real-time monitoring interface using WebSocket connections for live campaign updates.

REAL-TIME FEATURES:

1. **Live Campaign Status**:
   - Campaign progress bars updating in real-time
   - Status changes (pending → running → completed)
   - Live prospect counters incrementing
   - Agent activity indicators

2. **Activity Feed**:
   - Streaming log of agent actions
   - Messages: "Market Researcher found 5 new companies in automotive sector"
   - Timestamps and agent avatars
   - Auto-scroll with pause option
   - Filter by agent or campaign

3. **Notification System**:
   - Toast notifications for important events
   - Campaign completion alerts
   - Error notifications with retry options
   - Success celebrations

4. **Connection Status**:
   - WebSocket connection indicator (green=connected, red=disconnected)
   - Reconnection attempts with progress
   - Offline mode indicators

5. **Live Data Updates**:
   - Dashboard metrics updating without refresh
   - New prospects appearing in tables
   - Quality scores recalculating
   - Geographic data refreshing

SAMPLE WEBSOCKET MESSAGES:
```json
{
  "type": "agent_activity",
  "campaign_id": 123,
  "agent_name": "market_researcher",
  "message": "Analyzing German automotive companies",
  "progress": 67,
  "timestamp": "2025-08-22T11:30:00Z"
}
```

DESIGN: Smooth animations, live indicators, connection status UI, real-time feel
```

## 🎨 Prompt Design System Complet

```
Create a cohesive design system for an international AI prospecting platform.

COLOR PALETTE:
- Primary: #3B82F6 (Blue-500) - Trust, technology, global
- Success: #10B981 (Emerald-500) - Completed campaigns, success metrics  
- Warning: #F59E0B (Amber-500) - Pending actions, cautions
- Error: #EF4444 (Red-500) - Failed campaigns, errors
- Gray scale: #F9FAFB, #F3F4F6, #E5E7EB, #9CA3AF, #6B7280, #374151

TYPOGRAPHY:
- Headings: Inter Bold (international, clean)
- Body: Inter Regular (readable, professional)
- Monospace: JetBrains Mono (data, codes)

COMPONENT LIBRARY:

1. **Cards**: Clean shadows, rounded corners, hover effects
2. **Buttons**: Primary (blue), Secondary (gray), Success (green), Danger (red)
3. **Tables**: Striped rows, sortable headers, hover states
4. **Forms**: Floating labels, validation states, helper text
5. **Badges**: Status indicators with appropriate colors
6. **Progress**: Rings, bars, with smooth animations
7. **Navigation**: Clean sidebar, breadcrumbs, active states

INTERNATIONAL ELEMENTS:
- Country flags integration
- RTL layout support preparation  
- Currency symbols handling
- Date/time localization
- Professional business aesthetics

ICONS: Lucide React for consistency, custom agent avatars, flag icons library

RESPONSIVE: Mobile-first design, tablet optimizations, desktop excellence
```

## 🌟 Prompt Complet - Landing Dashboard

```
Create the complete main dashboard for "Global AI Prospecting Platform" - a sophisticated international business prospecting application.

FULL LAYOUT REQUIREMENTS:

**Header Bar**:
- Logo: Robot icon + "Global AI Prospecting Platform"
- Navigation: Dashboard, Campaigns, Prospects, Agents, Analytics
- Right side: Connection status (🟢 Connected), notifications bell, user avatar

**Main Dashboard Grid**:

Row 1 - KPI Metrics (4 cards):
- Total Campaigns: 142 (↗️ +12 this month)
- Active Campaigns: 8 (🔄 Running now)  
- Total Prospects: 2,847 (↗️ +234 this week)
- Success Rate: 94.2% (↗️ +2.1% vs last month)

Row 2 - Split Layout:
Left (60%): Interactive world map showing:
- 🇩🇪 Germany: 234 prospects (hotspot)
- 🇫🇷 France: 189 prospects  
- 🇨🇦 Canada: 156 prospects
- 🇬🇧 UK: 98 prospects
- 🇪🇸 Spain: 76 prospects

Right (40%): AI Agents Status Panel:
- Global Market Researcher: ⚙️ Working (67% progress)
  "Analyzing automotive companies in Stuttgart"
- International Prospecting Specialist: ✅ Completed (100%)
  "Found 89 verified contacts in French fintech sector"  
- Global Content Writer: ⏸️ Idle
  "Ready to create personalized outreach content"

Row 3 - Recent Activity:
- Live activity feed showing agent actions with timestamps
- "Market Researcher identified 5 new prospects in BMW supplier network"
- "Content Writer completed personalized emails for 15 French startups"
- "Prospecting Specialist verified contact details for Schneider Electric"

Row 4 - Recent Campaigns Table:
- Tech Expansion Germany 🇩🇪 (Running, 67% complete, 45 prospects)
- FinTech Canada 🇨🇦 (Completed, 100%, 28 prospects)  
- SaaS UK 🇬🇧 (Pending, 0%, 0 prospects)
- Industry 4.0 France 🇫🇷 (Running, 89%, 67 prospects)

REAL-TIME FEATURES:
- WebSocket connection for live updates
- Progress bars that animate
- Live prospect counters
- Agent status changes
- New activity notifications

DESIGN: Modern, clean, international business aesthetic, blue primary color, responsive grid, smooth animations, professional UI components
```

---

## 🎯 Instructions d'utilisation

### Pour v0.dev:
1. Copiez le prompt souhaité
2. Collez dans v0.dev 
3. Ajustez les détails selon vos besoins
4. Itérez avec des prompts de refinement

### Prompts de Refinement:
- "Make the map more interactive with zoom and country details"
- "Add more sophisticated filtering options to the prospects table"
- "Enhance the real-time animations for agent status updates"
- "Create mobile-responsive versions of all components"

Ces prompts sont optimisés pour créer une interface complète et professionnelle avec v0.dev ! 🚀