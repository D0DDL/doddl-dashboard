import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  // Enable CORS for Power Automate
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      // Get all tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      // Create new task (from Power Automate or manual)
      const { task, project, taskGroup, status, priority, owner, dueDate, dependencies, notes, source } = req.body

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          task,
          project,
          task_group: taskGroup,
          status: status || '⬜ To Do',
          priority: priority || '⚡ Medium',
          owner,
          due_date: dueDate,
          dependencies,
          notes,
          source: source || 'Manual'
        }])
        .select()

      if (error) throw error
      return res.status(201).json(data[0])
    }

    if (req.method === 'PUT') {
      // Update task
      const { id, ...updates } = req.body

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      return res.status(200).json(data[0])
    }

    if (req.method === 'DELETE') {
      // Delete task
      const { id } = req.query

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      return res.status(204).end()
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
