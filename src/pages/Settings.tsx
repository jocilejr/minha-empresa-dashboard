import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { usersApi, UserFull } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Pencil, Trash2, Shield, User, Users } from 'lucide-react';

const ROLES = [
  { value: 'admin', label: 'Administrador', description: 'Acesso total ao sistema' },
  { value: 'moderator', label: 'Moderador', description: 'Pode visualizar e editar dados' },
  { value: 'user', label: 'Usuário', description: 'Apenas visualização' },
];

export default function Settings() {
  const [users, setUsers] = useState<UserFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFull | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    active: true,
    roles: [] as string[],
  });

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await usersApi.list();
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar usuários',
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      active: true,
      roles: [],
    });
  };

  const handleCreate = async () => {
    try {
      await usersApi.create(formData);
      toast({
        title: 'Usuário criado',
        description: 'O usuário foi criado com sucesso.',
      });
      setIsCreateOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar usuário',
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      await usersApi.update(editingUser.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        active: formData.active,
        roles: formData.roles,
      });
      toast({
        title: 'Usuário atualizado',
        description: 'O usuário foi atualizado com sucesso.',
      });
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar usuário',
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersApi.delete(id);
      toast({
        title: 'Usuário deletado',
        description: 'O usuário foi removido do sistema.',
      });
      loadUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar usuário',
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  const openEditDialog = (user: UserFull) => {
    setFormData({
      username: user.username,
      password: '',
      name: user.name || '',
      email: user.email || '',
      active: user.active,
      roles: user.roles?.filter(Boolean) || [],
    });
    setEditingUser(user);
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Configurações" subtitle="Gerencie usuários e permissões do sistema" />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>
                  Gerencie os usuários que podem acessar o dashboard
                </CardDescription>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para criar um novo usuário
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username">Nome de Usuário</Label>
                    <Input
                      id="new-username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, username: e.target.value }))
                      }
                      placeholder="Digite o nome de usuário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      placeholder="Digite a senha"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nome Completo</Label>
                    <Input
                      id="new-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Digite o nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="Digite o email"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Permissões</Label>
                    {ROLES.map((role) => (
                      <div key={role.value} className="flex items-center space-x-3">
                        <Checkbox
                          id={`new-role-${role.value}`}
                          checked={formData.roles.includes(role.value)}
                          onCheckedChange={() => toggleRole(role.value)}
                        />
                        <div className="grid gap-0.5">
                          <Label htmlFor={`new-role-${role.value}`} className="font-medium">
                            {role.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate}>Criar Usuário</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {user.username}
                        </div>
                      </TableCell>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles?.filter(Boolean).map((role) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)}>
                              {role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? 'default' : 'secondary'}>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.last_login)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Deletar usuário?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O usuário{' '}
                                    <strong>{user.username}</strong> será removido permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize os dados de <strong>{editingUser?.username}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Digite o nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Digite o email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Nova Senha (deixe em branco para manter)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Digite a nova senha"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
                <Label htmlFor="edit-active">Usuário ativo</Label>
              </div>
              <div className="space-y-3">
                <Label>Permissões</Label>
                {ROLES.map((role) => (
                  <div key={role.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`edit-role-${role.value}`}
                      checked={formData.roles.includes(role.value)}
                      onCheckedChange={() => toggleRole(role.value)}
                    />
                    <div className="grid gap-0.5">
                      <Label htmlFor={`edit-role-${role.value}`} className="font-medium">
                        {role.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
