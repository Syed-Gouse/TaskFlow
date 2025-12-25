import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Sidebar, MobileMenuButton } from "@/components/Sidebar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDialog } from "@/components/TaskDialog";
import { tasksApi, categoriesApi, statsApi } from "@/lib/api";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function App() {
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState([]);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [tasksRes, categoriesRes, statsRes] = await Promise.all([
                tasksApi.getAll(selectedCategory ? { category_id: selectedCategory } : {}),
                categoriesApi.getAll(),
                statsApi.get(),
            ]);
            setTasks(tasksRes.data);
            setCategories(categoriesRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateCategory = async (data) => {
        try {
            await categoriesApi.create(data);
            toast.success("Category created");
            fetchData();
        } catch (error) {
            console.error("Failed to create category:", error);
            toast.error("Failed to create category");
        }
    };

    const handleSaveTask = async (data, taskId) => {
        try {
            if (taskId) {
                await tasksApi.update(taskId, data);
                toast.success("Task updated");
            } else {
                await tasksApi.create(data);
                toast.success("Task created");
            }
            setEditingTask(null);
            fetchData();
        } catch (error) {
            console.error("Failed to save task:", error);
            toast.error("Failed to save task");
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await tasksApi.delete(taskId);
            toast.success("Task deleted");
            fetchData();
        } catch (error) {
            console.error("Failed to delete task:", error);
            toast.error("Failed to delete task");
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await tasksApi.update(taskId, { status: newStatus });
            toast.success(newStatus === "done" ? "Task completed!" : "Task moved");
            fetchData();
        } catch (error) {
            console.error("Failed to update task status:", error);
            toast.error("Failed to update task");
        }
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setTaskDialogOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskDialogOpen(true);
    };

    // Filter tasks based on search and priority
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            !searchQuery ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPriority =
            priorityFilter.length === 0 || priorityFilter.includes(task.priority);

        return matchesSearch && matchesPriority;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background" data-testid="app-container">
            {/* Noise overlay for texture */}
            <div className="noise-overlay" />

            <Sidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => {
                    setSelectedCategory(id);
                    setSidebarOpen(false);
                }}
                onCreateCategory={handleCreateCategory}
                stats={stats}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="main-content">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {selectedCategory
                                        ? categories.find((c) => c.id === selectedCategory)?.name
                                        : "All Tasks"}
                                </h1>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>

                        <Button onClick={handleAddTask} data-testid="header-add-task-btn">
                            <Plus className="w-4 h-4 mr-2" />
                            New Task
                        </Button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                                data-testid="search-input"
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" data-testid="filter-btn">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                    {priorityFilter.length > 0 && (
                                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                            {priorityFilter.length}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                    checked={priorityFilter.includes("high")}
                                    onCheckedChange={(checked) => {
                                        setPriorityFilter(
                                            checked
                                                ? [...priorityFilter, "high"]
                                                : priorityFilter.filter((p) => p !== "high")
                                        );
                                    }}
                                >
                                    <span className="text-destructive">High</span>
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={priorityFilter.includes("medium")}
                                    onCheckedChange={(checked) => {
                                        setPriorityFilter(
                                            checked
                                                ? [...priorityFilter, "medium"]
                                                : priorityFilter.filter((p) => p !== "medium")
                                        );
                                    }}
                                >
                                    <span className="text-warning">Medium</span>
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={priorityFilter.includes("low")}
                                    onCheckedChange={(checked) => {
                                        setPriorityFilter(
                                            checked
                                                ? [...priorityFilter, "low"]
                                                : priorityFilter.filter((p) => p !== "low")
                                        );
                                    }}
                                >
                                    <span className="text-success">Low</span>
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Kanban Board */}
                <KanbanBoard
                    tasks={filteredTasks}
                    categories={categories}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                />
            </main>

            {/* Task Dialog */}
            <TaskDialog
                open={taskDialogOpen}
                onOpenChange={setTaskDialogOpen}
                task={editingTask}
                categories={categories}
                onSave={handleSaveTask}
            />

            {/* Toast notifications */}
            <Toaster position="bottom-right" richColors />
        </div>
    );
}

export default App;
