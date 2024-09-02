<template>
  <div id="app">
    <h1>My To-Do List</h1>

    <!-- Display Error Message -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Task Addition Form -->
    <div>
      <input v-model="newTaskTitle" placeholder="Task Name" />
      <input v-model="newTaskDescription" placeholder="Task Description" />
      <input type="date" v-model="newTaskDueDate" />
      <select v-model="newTaskPriority">
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
      <button @click="addTask">Add Task</button>
    </div>

    <!-- Filters -->
    <div>
      <label>Filter by status:</label>
      <select v-model="filterStatus">
        <option value="">All</option>
        <option value="completed">Completed</option>
        <option value="incomplete">Incomplete</option>
      </select>
      
      <label>Filter by priority:</label>
      <select v-model="filterPriority">
        <option value="">All</option>
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
      
      <label>Filter by due date:</label>
      <select v-model="filterDueDate">
        <option value="">All</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>

    <!-- Task List -->
    <div v-if="filteredTasks.length === 0">No tasks match the filter criteria</div>
    <ul v-else>
      <li v-for="task in filteredTasks" :key="task.id" class="task-item">
        <div v-if="!task.isEditing">
          <h2>{{ task.title }}</h2>
          <p><strong>Description:</strong> {{ task.description }}</p>
          <p><strong>Due Date:</strong> {{ task.dueDate }}</p>
          <p><strong>Priority:</strong> {{ task.priority }}</p>
          <input type="checkbox" v-model="task.completed" /> Completed
          <button @click="toggleEditing(task)">Edit</button>
          <button @click="deleteTask(task.id)">Delete</button>
          <div v-if="task.deleteError" class="error-message">{{ task.deleteError }}</div>
        </div>
        <div v-else>
          <input v-model="task.title" placeholder="Task Name" />
          <input v-model="task.description" placeholder="Task Description" />
          <input type="date" v-model="task.dueDate" />
          <select v-model="task.priority">
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button @click="saveTask(task)">Save</button>
          <button @click="cancelEditing(task)">Cancel</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { Task } from './types';

export default defineComponent({
  name: 'App',
  setup() {
    const tasks = ref<Task[]>([]);
    const newTaskTitle = ref<string>('');
    const newTaskDescription = ref<string>('');
    const newTaskDueDate = ref<string>('');
    const newTaskPriority = ref<'low' | 'medium' | 'high'>('low');

    const filterStatus = ref<string>('');
    const filterPriority = ref<'low' | 'medium' | 'high' | ''>('');
    const filterDueDate = ref<string>('');

    const error = ref<string | null>(null);

    const loadTasks = () => {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        tasks.value = JSON.parse(savedTasks);
      }
    };

    const saveTasks = () => {
      localStorage.setItem('tasks', JSON.stringify(tasks.value));
    };

    const addTask = () => {
      if (!newTaskTitle.value.trim()) {
        error.value = 'Task name cannot be empty.';
        return;
      }

      tasks.value.push({
        id: Date.now(),
        title: newTaskTitle.value,
        description: newTaskDescription.value,
        dueDate: newTaskDueDate.value,
        priority: newTaskPriority.value,
        completed: false,
        isEditing: false,
        deleteError: null,
      });

      saveTasks();
      newTaskTitle.value = '';
      newTaskDescription.value = '';
      newTaskDueDate.value = '';
      newTaskPriority.value = 'low';
      error.value = null; // Clear any existing error messages
    };

    const deleteTask = (taskId: number) => {
      const taskIndex = tasks.value.findIndex(task => task.id === taskId);
      if (taskIndex === -1) {
        error.value = 'Task not found.';
        return;
      }

      try {
        tasks.value.splice(taskIndex, 1);
        saveTasks();
        error.value = null; // Clear any existing error messages
      } catch (e) {
        tasks.value[taskIndex].deleteError = 'Failed to delete task. Please try again.';
      }
    };

    const toggleEditing = (task: Task) => {
      task.isEditing = !task.isEditing;
    };

    const saveTask = (task: Task) => {
      if (!task.title.trim()) {
        error.value = 'Task name cannot be empty.';
        return;
      }

      task.isEditing = false;
      saveTasks();
      error.value = null; // Clear any existing error messages
    };

    const cancelEditing = (task: Task) => {
      task.isEditing = false;
    };

    const filterTasks = (tasks: Task[]) => {
      return tasks.filter(task => {
        // Filter by status
        if (filterStatus.value === 'completed' && !task.completed) return false;
        if (filterStatus.value === 'incomplete' && task.completed) return false;
        
        // Filter by priority
        if (filterPriority.value && filterPriority.value !== task.priority) return false;
        
        // Filter by due date
        const today = new Date();
        const taskDueDate = new Date(task.dueDate || '');
        const oneWeekLater = new Date(today);
        oneWeekLater.setDate(today.getDate() + 7);

        if (filterDueDate.value === 'today' && taskDueDate.toDateString() !== today.toDateString()) return false;
        if (filterDueDate.value === 'week' && (taskDueDate < today || taskDueDate > oneWeekLater)) return false;
        if (filterDueDate.value === 'overdue' && taskDueDate >= today) return false;

        return true;
      });
    };

    const filteredTasks = computed(() => filterTasks(tasks.value));

    onMounted(() => {
      loadTasks();
    });

    return {
      tasks,
      newTaskTitle,
      newTaskDescription,
      newTaskDueDate,
      newTaskPriority,
      filterStatus,
      filterPriority,
      filterDueDate,
      error,
      addTask,
      deleteTask,
      toggleEditing,
      saveTask,
      cancelEditing,
      filteredTasks,
    };
  },
});
</script>

<style scoped>
/* Existing styles */

.error-message {
  color: #e74c3c;
  background-color: #fdd;
  border: 1px solid #e74c3c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>