export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
    isEditing: boolean;
    deleteError?: string | null; // Optional property for error handling
  }