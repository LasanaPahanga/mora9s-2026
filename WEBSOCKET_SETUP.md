# WebSocket Real-Time Updates Setup

This document explains how to set up and use the real-time WebSocket functionality for the Mora 9s 2026 application.

## 🚀 Overview

The application now supports real-time updates using Socket.IO. When an admin makes changes (creates, updates, or deletes matches or results), all connected user-mode clients will automatically receive and display those updates without needing to refresh the page.

## 📦 Installation

### 1. Install Server Dependencies

**User-Mode Server:**
```bash
cd user-mode/server
npm install
```

**Admin-Mode Server:**
```bash
cd admin-mode/server
npm install
```

### 2. Install Client Dependencies

**User-Mode Client:**
```bash
cd user-mode/client
npm install
```

## ⚙️ Configuration

### Environment Variables

Make sure your user-mode server is running on the default port (4000) or update the `USER_SERVER_URL` in the admin server if needed.

**Admin Server** (`admin-mode/server/.env`):
```env
USER_SERVER_URL=http://localhost:4000
```

## 🏃 Running the Application

### Start Order (Important!)

1. **Start User-Mode Server First** (Port 4000):
   ```bash
   cd user-mode/server
   npm run dev
   ```

2. **Start Admin-Mode Server** (Port 3001):
   ```bash
   cd admin-mode/server
   npm run dev
   ```

3. **Start User-Mode Client** (Port 5173):
   ```bash
   cd user-mode/client
   npm run dev
   ```

4. **Start Admin-Mode Client** (Port 5174):
   ```bash
   cd admin-mode/client
   npm run dev
   ```

## 🔄 How It Works

### Architecture

```
Admin Client → Admin Server → User Server → User Clients
                                    ↓
                            Socket.IO broadcasts updates
```

### Event Flow

1. **Admin makes a change** (e.g., creates a match)
2. **Admin server** emits event to user server via Socket.IO client
3. **User server** broadcasts the event to all connected user clients
4. **User clients** receive the event and automatically refresh data

### Supported Real-Time Events

#### Matches
- `match_created` - New match added
- `match_updated` - Match details changed
- `match_deleted` - Match removed

#### Results
- `result_created` - New result recorded
- `result_updated` - Result modified
- `result_deleted` - Result removed

#### Teams
- `team_created` - New team added
- `team_updated` - Team details changed
- `team_deleted` - Team removed

#### Groups
- `group_created` - New group added
- `group_updated` - Group details changed
- `group_deleted` - Group removed

#### Goal Scorers
- `goal_scorer_created` - New goal scorer added
- `goal_scorer_updated` - Goal scorer modified
- `goal_scorer_deleted` - Goal scorer removed

## 📊 Components with Real-Time Updates

### User-Mode (All Components Updated!)
- **Matches** (`/matches`) - Auto-updates when matches change
- **Results** (`/results`) - Auto-updates when results or matches change
- **Teams** (`/teams`) - Auto-updates when teams or groups change
- **Groups** (`/groups`) - Auto-updates when groups change
- **Top Scorers** (`/top-scorers`) - Auto-updates when goal scorers or results change
- **Points Table** (`/points`) - Auto-updates when results, teams, or groups change

### Admin-Mode
All admin operations automatically emit real-time updates to user clients:
- **Manage Matches** - Emits match events
- **Manage Results** - Emits result events
- **Manage Teams** - Emits team events
- **Manage Groups** - Emits group events
- **Goal Scorers** - Emits goal scorer events

Just import `useSocket` and add listeners:
```javascript
import useSocket from "../hooks/useSocket";

// Inside component
useSocket('event_name', () => {
  // Refresh data
  fetchData();
});
```

## 🐛 Troubleshooting

### Connection Issues

1. **Check server order**: User server must start before admin server
2. **Check ports**: Ensure no port conflicts (4000 for user server)
3. **Check console**: Look for connection messages:
   - ✅ "Connected to server for real-time updates"
   - ❌ "Disconnected from server"

### Events Not Firing

1. **Check admin server logs**: Look for emission messages like "📡 Emitted match_created to user clients"
2. **Check user client console**: Should see messages like "🔔 New match created - refreshing..."
3. **Verify Socket.IO connection**: Check browser console for connection status

### Reconnection

The system automatically attempts to reconnect if the connection is lost:
- **Reconnection attempts**: Up to 10 times
- **Reconnection delay**: 1000ms between attempts

## 💡 Tips

1. **Keep servers running**: Don't stop the user server while admin server is connected
2. **Check browser console**: Real-time update messages appear in the console
3. **Multiple tabs**: You can open multiple user-mode tabs to see real-time sync
4. **Admin feedback**: Admin users will see standard success messages, while user-mode updates happen automatically

## 🔧 Extending Real-Time Features

To add real-time updates to other resources (teams, groups, etc.):

### 1. Update Controller
```javascript
import { emitToUsers } from "../utils/socket.js";

export const createTeam = async (req, res) => {
  // ... create team logic
  
  emitToUsers('team_created', newTeam);
  
  res.status(201).json(newTeam);
};
```

### 2. Update User Component
```javascript
useSocket('team_created', () => {
  console.log('🔔 New team created - refreshing...');
  fetchTeams();
});
```

## ✅ Success Indicators

You'll know it's working when:
- Admin server logs show: "✅ Admin server connected to User server for real-time updates"
- User clients log show: "✅ Connected to server for real-time updates"
- Changes in admin mode appear instantly in user mode without refresh
- Console shows emission and broadcast messages for each update

---

**Note**: This is a production-ready implementation with automatic reconnection and error handling. All updates happen seamlessly in the background!
