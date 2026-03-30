-- Supabase SQL Schema for doddl PM

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task TEXT NOT NULL,
  project TEXT,
  task_group TEXT,
  status TEXT DEFAULT '⬜ To Do',
  priority TEXT DEFAULT '⚡ Medium',
  owner TEXT,
  due_date DATE,
  dependencies TEXT,
  notes TEXT,
  source TEXT DEFAULT 'Manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
CREATE POLICY "Enable read access for all users" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON projects
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON projects
  FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON tasks
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON tasks
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_tasks_project ON tasks(project);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
