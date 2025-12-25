import { useState } from 'react';
import { 
    LayoutDashboard, 
    CheckSquare, 
    Calendar, 
    Settings, 
    Plus, 
    Hash,
    X,
    Menu
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';

const CATEGORY_COLORS = [
    '#8B5CF6', '#10B981', '#F59E0B', '#E11D48', 
    '#3B82F6', '#EC4899', '#14B8A6', '#F97316'
];

export function Sidebar({ 
    categories, 
    selectedCategory, 
    onSelectCategory, 
    onCreateCategory,
    stats,
    isOpen,
    onClose
}) {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleCreateCategory = () => {
        if (newCategoryName.trim()) {
            onCreateCategory({ name: newCategoryName.trim(), color: newCategoryColor });
            setNewCategoryName('');
            setNewCategoryColor(CATEGORY_COLORS[0]);
            setDialogOpen(false);
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}
            
            <aside className={`sidebar ${isOpen ? 'open' : ''}`} data-testid="sidebar">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                                <CheckSquare className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="md:hidden"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <nav className="space-y-1">
                        <button
                            onClick={() => onSelectCategory(null)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                selectedCategory === null 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                            data-testid="nav-all-tasks"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            All Tasks
                            <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                                {stats?.total || 0}
                            </span>
                        </button>
                    </nav>

                    <div className="mt-8">
                        <div className="flex items-center justify-between px-3 mb-3">
                            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Categories
                            </h2>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        data-testid="add-category-btn"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent data-testid="add-category-dialog">
                                    <DialogHeader>
                                        <DialogTitle>Create Category</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <Input
                                            placeholder="Category name"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            data-testid="category-name-input"
                                        />
                                        <div className="space-y-2">
                                            <label className="text-sm text-muted-foreground">Color</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {CATEGORY_COLORS.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setNewCategoryColor(color)}
                                                        className={`w-8 h-8 rounded-full transition-transform ${
                                                            newCategoryColor === color ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : ''
                                                        }`}
                                                        style={{ backgroundColor: color }}
                                                        data-testid={`color-${color}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={handleCreateCategory} 
                                            className="w-full"
                                            data-testid="create-category-submit"
                                        >
                                            Create Category
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="space-y-1">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => onSelectCategory(category.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        selectedCategory === category.id 
                                            ? 'bg-primary/10 text-primary' 
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                    data-testid={`category-${category.id}`}
                                >
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-primary">{stats?.todo || 0}</p>
                            <p className="text-xs text-muted-foreground">To Do</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-success">{stats?.done || 0}</p>
                            <p className="text-xs text-muted-foreground">Done</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export function MobileMenuButton({ onClick }) {
    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onClick}
            data-testid="mobile-menu-btn"
        >
            <Menu className="w-5 h-5" />
        </Button>
    );
}
