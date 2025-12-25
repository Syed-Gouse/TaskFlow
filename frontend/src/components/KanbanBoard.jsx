import { useState } from 'react';
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { TaskCard } from './TaskCard';

const COLUMNS = [
    { 
        id: 'todo', 
        title: 'To Do', 
        icon: Circle,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/30'
    },
    { 
        id: 'in_progress', 
        title: 'In Progress', 
        icon: Clock,
        color: 'text-warning',
        bgColor: 'bg-warning/10'
    },
    { 
        id: 'done', 
        title: 'Done', 
        icon: CheckCircle2,
        color: 'text-success',
        bgColor: 'bg-success/10'
    },
];

export function KanbanBoard({ 
    tasks, 
    categories, 
    onAddTask, 
    onEditTask, 
    onDeleteTask,
    onStatusChange 
}) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const getCategoryById = (categoryId) => {
        return categories.find(cat => cat.id === categoryId);
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        if (draggedTask && draggedTask.status !== newStatus) {
            onStatusChange(draggedTask.id, newStatus);
        }
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    return (
        <div className="kanban-board" data-testid="kanban-board">
            {COLUMNS.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                const Icon = column.icon;
                
                return (
                    <div 
                        key={column.id}
                        className={`kanban-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                        data-testid={`column-${column.id}`}
                    >
                        <div className="kanban-column-header">
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-md ${column.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-4 h-4 ${column.color}`} />
                                </div>
                                <h2 className="font-semibold text-sm">{column.title}</h2>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    {columnTasks.length}
                                </span>
                            </div>
                            {column.id === 'todo' && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={onAddTask}
                                    data-testid="add-task-btn"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        
                        <ScrollArea className="kanban-column-content">
                            <div className="space-y-3 stagger-children">
                                {columnTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task)}
                                    >
                                        <TaskCard
                                            task={task}
                                            category={getCategoryById(task.category_id)}
                                            onEdit={onEditTask}
                                            onDelete={onDeleteTask}
                                            onStatusChange={onStatusChange}
                                        />
                                    </div>
                                ))}
                                
                                {columnTasks.length === 0 && (
                                    <div className="empty-state py-8">
                                        <div className="empty-state-icon">
                                            <Icon className={`w-6 h-6 ${column.color}`} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            No tasks here
                                        </p>
                                        {column.id === 'todo' && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="mt-2"
                                                onClick={onAddTask}
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add task
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                );
            })}
        </div>
    );
}
