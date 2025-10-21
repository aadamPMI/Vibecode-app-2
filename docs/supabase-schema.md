# Supabase Schema for Workout System

This document outlines the proposed database schema for future Supabase integration. The current implementation uses local storage (AsyncStorage), but is designed to be easily migrated to Supabase.

## Overview

The workout system requires syncing user data across devices and optionally sharing workout programs with other users. This schema supports:

- User workout programs and splits
- Workout session history
- Individual exercise set logs
- Personal records (PRs)
- Profile visibility settings
- E1RM (Estimated 1-Rep Max) tracking
- AI-generated progression suggestions

## Tables

### 1. `user_profiles`

Stores user profile information and privacy settings.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  workout_visibility BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by all"
  ON user_profiles FOR SELECT
  USING (workout_visibility = true);
```

### 2. `programs`

Stores workout programs/splits created by users.

```sql
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  days_per_week INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_programs_user_id ON programs(user_id);
CREATE INDEX idx_programs_is_public ON programs(is_public);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own programs"
  ON programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create programs"
  ON programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
  ON programs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own programs"
  ON programs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public programs are viewable by all"
  ON programs FOR SELECT
  USING (is_public = true);
```

### 3. `workout_templates`

Stores workout day templates within a program.

```sql
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_order INTEGER NOT NULL,
  muscle_groups TEXT[] NOT NULL, -- Array of muscle group strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_program_id ON workout_templates(program_id);

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates from their programs"
  ON workout_templates FOR SELECT
  USING (
    program_id IN (
      SELECT id FROM programs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage templates in their programs"
  ON workout_templates FOR ALL
  USING (
    program_id IN (
      SELECT id FROM programs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public program templates are viewable"
  ON workout_templates FOR SELECT
  USING (
    program_id IN (
      SELECT id FROM programs WHERE is_public = true
    )
  );
```

### 4. `exercise_targets`

Stores exercises within workout templates.

```sql
CREATE TABLE exercise_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL, -- References exercise from exercise database
  exercise_name TEXT NOT NULL,
  exercise_order INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  set_scheme TEXT NOT NULL, -- 'fixed-reps' | 'rep-range' | 'amrap'
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exercise_targets_template_id ON exercise_targets(template_id);

ALTER TABLE exercise_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exercises from their templates"
  ON exercise_targets FOR SELECT
  USING (
    template_id IN (
      SELECT wt.id FROM workout_templates wt
      JOIN programs p ON wt.program_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage exercises in their templates"
  ON exercise_targets FOR ALL
  USING (
    template_id IN (
      SELECT wt.id FROM workout_templates wt
      JOIN programs p ON wt.program_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
```

### 5. `sessions`

Stores completed workout sessions.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  workout_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'cancelled'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in minutes
  total_sets INTEGER DEFAULT 0,
  total_volume REAL DEFAULT 0, -- Total weight × reps
  notes TEXT,
  ai_coach_tip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_program_id ON sessions(program_id);
CREATE INDEX idx_sessions_completed_at ON sessions(completed_at);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);
```

### 6. `set_logs`

Stores individual set logs for each exercise in a session.

```sql
CREATE TABLE set_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  rpe REAL, -- Rate of Perceived Exertion (optional)
  tempo TEXT, -- Tempo notation (optional)
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_set_logs_session_id ON set_logs(session_id);
CREATE INDEX idx_set_logs_exercise_id ON set_logs(exercise_id);

ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sets from their sessions"
  ON set_logs FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage sets in their sessions"
  ON set_logs FOR ALL
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );
```

### 7. `e1rm_history`

Tracks estimated 1-rep max history for exercises.

```sql
CREATE TABLE e1rm_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  e1rm REAL NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_e1rm_user_id ON e1rm_history(user_id);
CREATE INDEX idx_e1rm_exercise_id ON e1rm_history(exercise_id);
CREATE INDEX idx_e1rm_recorded_at ON e1rm_history(recorded_at);

ALTER TABLE e1rm_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own e1rm history"
  ON e1rm_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own e1rm records"
  ON e1rm_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 8. `pr_events`

Tracks personal records achieved during workouts.

```sql
CREATE TABLE pr_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  pr_type TEXT NOT NULL, -- 'weight' | 'reps' | 'volume' | 'e1rm'
  previous_value REAL,
  new_value REAL NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pr_events_user_id ON pr_events(user_id);
CREATE INDEX idx_pr_events_exercise_id ON pr_events(exercise_id);

ALTER TABLE pr_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PRs"
  ON pr_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PRs"
  ON pr_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 9. `progression_suggestions`

Stores AI-generated progressive overload suggestions (cached).

```sql
CREATE TABLE progression_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  suggestion_text TEXT NOT NULL,
  recommended_sets JSONB, -- Array of {weight, reps} objects
  reasoning TEXT,
  confidence REAL, -- 0-1 confidence score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_progression_user_id ON progression_suggestions(user_id);
CREATE INDEX idx_progression_exercise_id ON progression_suggestions(exercise_id);

ALTER TABLE progression_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suggestions"
  ON progression_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions"
  ON progression_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Sync Strategy

### Local-First Approach

1. **All operations happen locally first** using AsyncStorage
2. **Background sync** pushes changes to Supabase when online
3. **Conflict resolution** uses "last write wins" with timestamp comparison
4. **Offline queue** stores pending mutations when offline

### Sync Flow

```typescript
// Pseudo-code for sync strategy
async function syncToSupabase() {
  if (!isOnline || !isAuthenticated) return;

  const localData = await getLocalData();
  const lastSyncTimestamp = await getLastSyncTimestamp();

  // 1. Push local changes to Supabase
  const pendingChanges = localData.filter(item => item.updatedAt > lastSyncTimestamp);
  await supabase.from('table').upsert(pendingChanges);

  // 2. Pull remote changes
  const { data: remoteChanges } = await supabase
    .from('table')
    .select('*')
    .gt('updated_at', lastSyncTimestamp);

  // 3. Merge remote changes into local storage
  await mergeRemoteChanges(remoteChanges);

  // 4. Update last sync timestamp
  await setLastSyncTimestamp(Date.now());
}
```

### Real-Time Subscriptions

For collaborative features (future):

```typescript
// Subscribe to program changes
const subscription = supabase
  .channel('programs')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'programs', filter: `user_id=eq.${userId}` },
    (payload) => {
      handleRemoteChange(payload);
    }
  )
  .subscribe();
```

## Migration Plan

### Phase 1: Schema Setup
1. Create all tables in Supabase
2. Set up Row Level Security policies
3. Test with sample data

### Phase 2: Sync Implementation
1. Implement background sync service
2. Add offline queue for mutations
3. Handle conflict resolution
4. Test sync with poor network conditions

### Phase 3: Migration
1. Export existing local data
2. Bulk upload to Supabase
3. Switch to hybrid local + cloud storage
4. Monitor sync performance

### Phase 4: Enhanced Features
1. Enable public program sharing
2. Implement social features (follow, like programs)
3. Add workout template marketplace
4. Community leaderboards

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for consistent time handling
- UUIDs are used for primary keys to avoid conflicts in distributed system
- JSON/JSONB columns are used for flexible data (e.g., AI suggestions)
- Indexes are added on foreign keys and commonly queried fields
- RLS policies ensure users can only access their own data (except public programs)
- The schema is designed to minimize joins for common queries
- Soft deletes can be added if needed (add `deleted_at` column)

## Future Enhancements

### 1. Workout Templates Marketplace
```sql
CREATE TABLE template_marketplace (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id),
  author_id UUID REFERENCES auth.users(id),
  price DECIMAL(10, 2),
  downloads_count INTEGER DEFAULT 0,
  rating REAL,
  tags TEXT[]
);
```

### 2. Social Features
```sql
CREATE TABLE program_likes (
  user_id UUID REFERENCES auth.users(id),
  program_id UUID REFERENCES programs(id),
  PRIMARY KEY (user_id, program_id)
);

CREATE TABLE program_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  program_id UUID REFERENCES programs(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Coaching Features
```sql
CREATE TABLE coach_client_relationships (
  coach_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL, -- 'pending' | 'active' | 'inactive'
  PRIMARY KEY (coach_id, client_id)
);
```

## Security Considerations

1. **Authentication**: All tables are protected by RLS and reference `auth.users`
2. **Data Privacy**: Only workout programs marked `is_public` are visible to others
3. **Rate Limiting**: Implement rate limiting on sync operations
4. **Data Validation**: Use Postgres constraints and app-level validation
5. **Audit Logs**: Consider adding audit table for sensitive operations
6. **Encryption**: Sensitive data (e.g., notes) can be encrypted at rest

## Performance Optimization

1. **Indexes**: Added on all foreign keys and commonly queried fields
2. **Materialized Views**: Consider for complex aggregations (e.g., leaderboards)
3. **Partitioning**: Partition `set_logs` by date for better performance
4. **Caching**: Cache frequently accessed data (e.g., active program)
5. **Batch Operations**: Use batch inserts for set logs during sync

## Backup Strategy

1. **Automated Backups**: Use Supabase's built-in daily backups
2. **Point-in-Time Recovery**: Enable PITR for critical data
3. **Export Functionality**: Allow users to export their data as JSON
4. **Disaster Recovery**: Document recovery procedures

