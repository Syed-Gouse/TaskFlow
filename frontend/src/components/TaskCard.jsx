import { format, isPast, isToday, parseISO } from 'date-fns';
import { Calendar, MoreVertical, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

const PRIORITY_STYLES = {
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low',
};

const PRIORITY_LABELS = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

export function TaskCard({ task, category, onEdit, onDelete, onStatusChange }) {
    const dueDate = task.due_date ? parseISO(task.due_date) : null;
    const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'done';
    const isDueToday = dueDate && isToday(dueDate);

    const getDueDateClass = () => {
        if (isOverdue) return 'overdue';
        if (isDueToday) return 'today';
        return '';
    };

    return (
        <div 
            className="task-card group animate-fade-in-up"
            data-testid={`task-card-${task.id}`}
        >
            <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className={`font-medium text-sm leading-tight ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                </h3>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`task-menu-${task.id}`}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" data-testid={`task-dropdown-${task.id}`}>
                        <DropdownMenuItem onClick={() => onEdit(task)} data-testid={`edit-task-${task.id}`}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        {task.status !== 'done' && (
                            <DropdownMenuItem 
                                onClick={() => onStatusChange(task.id, 'done')}
                                data-testid={`complete-task-${task.id}`}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => onDelete(task.id)}
                            className="text-destructive focus:text-destructive"
                            data-testid={`delete-task-${task.id}`}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {task.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${PRIORITY_STYLES[task.priority]}`}>
                    {PRIORITY_LABELS[task.priority]}
                </span>

                {category && (
                    <span 
                        className="category-badge"
                        style={{ borderColor: category.color + '40', color: category.color }}
                    >
                        <span 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                    </span>
                )}

                {dueDate && (
                    <span className={`due-date-badge ${getDueDateClass()}`}>
                        <Calendar className="w-3 h-3" />
                        {isOverdue ? 'Overdue' : isDueToday ? 'Today' : format(dueDate, 'MMM d')}
                    </span>
                )}
            </div>
        </div>
    );
}
