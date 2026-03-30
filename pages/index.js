'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DoddlPM() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState('all')
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [newTask, setNewTask] = useState({
    task: '', project: '', taskGroup: '', status: '⬜ To Do',
    priority: '⚡ Medium', owner: '', dueDate: '', dependencies: '', notes: '', source: 'Manual'
  })
  const [newProject, setNewProject] = useState({ name: '', description: '' })

  // Load data on mount
  useEffect(() => {
    loadData()
    
    // Set up real-time subscriptions
    const tasksSubscription = supabase
      .channel('tasks_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      tasksSubscription.unsubscribe()
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError
      setProjects(projectsData || [])

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError
      setTasks(tasksData || [])
    } catch (error) {
      console.error('Load error:', error)
    }
    setLoading(false)
  }

  const createProject = async () => {
    if (!newProject.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: newProject.name, description: newProject.description }])
        .select()

      if (error) throw error
      
      setProjects([data[0], ...projects])
      setNewProject({ name: '', description: '' })
      setShowAddProject(false)
    } catch (error) {
      console.error('Create project error:', error)
    }
  }

  const createTask = async () => {
    if (!newTask.task.trim()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          task: newTask.task,
          project: newTask.project,
          task_group: newTask.taskGroup,
          status: newTask.status,
          priority: newTask.priority,
          owner: newTask.owner,
          due_date: newTask.dueDate,
          dependencies: newTask.dependencies,
          notes: newTask.notes,
          source: newTask.source
        }])
        .select()

      if (error) throw error

      setTasks([data[0], ...tasks])
      setNewTask({
        task: '', project: '', taskGroup: '', status: '⬜ To Do',
        priority: '⚡ Medium', owner: '', dueDate: '', dependencies: '', notes: '', source: 'Manual'
      })
      setShowAddTask(false)
    } catch (error) {
      console.error('Create task error:', error)
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (error) {
      console.error('Update task error:', error)
    }
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Delete task error:', error)
    }
  }

  const filteredTasks = selectedProject === 'all' 
    ? tasks 
    : tasks.filter(t => t.project === selectedProject)

  const statusColumns = ['⬜ To Do', '🔵 In Progress', '🟢 Done', '🔴 Blocked']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading doddl PM...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎯 doddl Project Management</h1>
          <p className="text-gray-600 mt-1">Real-time collaboration. Power Automate integrated.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddProject(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            + New Project
          </button>
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter(t => t.status === '🔵 In Progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter(t => t.status === '🟢 Done').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
          <div className="text-sm text-gray-600">Projects</div>
        </div>
      </div>

      {/* Project Filter */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-gray-700 font-medium">Filter:</span>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Projects ({tasks.length} tasks)</option>
          {projects.map(p => (
            <option key={p.id} value={p.name}>
              {p.name} ({tasks.filter(t => t.project === p.name).length} tasks)
            </option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {statusColumns.map(status => {
          const tasksInStatus = filteredTasks.filter(t => t.status === status)
          
          return (
            <div key={status} className="bg-white rounded-lg shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg">{status}</h3>
                <span className="text-sm text-gray-500">{tasksInStatus.length} tasks</span>
              </div>
              
              <div className="p-4 space-y-3 min-h-[400px]">
                {tasksInStatus.map(task => (
                  <div
                    key={task.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const draggedTaskId = e.dataTransfer.getData('taskId')
                      if (draggedTaskId && draggedTaskId !== task.id) {
                        updateTaskStatus(draggedTaskId, status)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 flex-1">{task.task}</div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {task.project && (
                      <div className="text-xs text-blue-600 font-medium mb-1">
                        📁 {task.project}
                      </div>
                    )}
                    
                    {task.task_group && (
                      <div className="text-xs text-gray-600 mb-2">
                        📂 {task.task_group}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      <span className="text-xs px-2 py-1 bg-white rounded border border-gray-300">
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-gray-600">📅 {task.due_date}</span>
                      )}
                      {task.source !== 'Manual' && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {task.source}
                        </span>
                      )}
                    </div>
                    
                    {task.owner && (
                      <div className="text-xs text-gray-600 mt-2">👤 {task.owner}</div>
                    )}
                    
                    {task.dependencies && (
                      <div className="text-xs text-orange-600 mt-2">
                        🔗 {task.dependencies}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Drop zone for empty column */}
                {tasksInStatus.length === 0 && (
                  <div
                    className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-400"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const taskId = e.dataTransfer.getData('taskId')
                      if (taskId) updateTaskStatus(taskId, status)
                    }}
                  >
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bundle Boxes, Marketing Campaign, etc."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Project description"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddProject(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                disabled={!newProject.name.trim()}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  value={newTask.task}
                  onChange={(e) => setNewTask({...newTask, task: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task name"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project
                  </label>
                  <select
                    value={newTask.project}
                    onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No Project</option>
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Group
                  </label>
                  <input
                    type="text"
                    value={newTask.taskGroup}
                    onChange={(e) => setNewTask({...newTask, taskGroup: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Marketing, Finance, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusColumns.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="🔥 High">🔥 High</option>
                    <option value="⚡ Medium">⚡ Medium</option>
                    <option value="📌 Low">📌 Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={newTask.owner}
                    onChange={(e) => setNewTask({...newTask, owner: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Assigned to"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dependencies / Blocked By
                </label>
                <input
                  type="text"
                  value={newTask.dependencies}
                  onChange={(e) => setNewTask({...newTask, dependencies: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Task names this depends on"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Additional details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={newTask.source}
                  onChange={(e) => setNewTask({...newTask, source: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Manual">Manual</option>
                  <option value="Email">Email</option>
                  <option value="Teams">Teams</option>
                  <option value="TeamsMAestro">TeamsMAestro</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                disabled={!newTask.task.trim()}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
