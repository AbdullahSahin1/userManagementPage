'use client';

import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, DataGridProps } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Typography, Paper } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { User, UserFormData } from '@/types/user';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/services/userService';

// Client component wrapper
const ClientDataGrid = ({ rows, columns, ...props }: DataGridProps) => {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      {...props}
      sx={{
        border: 'none',
        '& .MuiDataGrid-cell': {
          borderBottom: '1px solid #e2e8f0',
          padding: '16px',
        },
        '& .MuiDataGrid-columnHeader': {
          backgroundColor: '#f8fafc',
          borderBottom: '2px solid #e2e8f0',
          padding: '16px',
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: '#f1f5f9',
        },
      }}
    />
  );
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
    setFilteredUsers(data);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, formData);
      } else {
        await createUser(formData);
      }
      handleCloseDialog();
      await loadUsers();
    } catch (error) {
      console.error('İşlem sırasında hata oluştu:', error);
    }
  };

  const handleDelete = async (user: User) => {
    setUserToDelete(user);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      if (userToDelete) {
        await deleteUser(userToDelete.id);
        setDeleteDialog(false);
        await loadUsers();
      }
    } catch (error) {
      console.error('Silme işlemi sırasında hata oluştu:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Ad Soyad', width: 200 },
    { field: 'email', headerName: 'E-posta', width: 200 },
    { field: 'phone', headerName: 'Telefon', width: 150 },
    { field: 'address', headerName: 'Adres', width: 200 },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton 
            onClick={() => handleOpenDialog(params.row)}
            sx={{ color: 'primary.main' }}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            onClick={() => handleDelete(params.row)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <main className="p-8">
      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            Kullanıcı Yönetimi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kullanıcıları görüntüleyin, ekleyin, düzenleyin ve silin.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <TextField
              label="Kullanıcı Ara"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
            <Button 
              variant="contained" 
              onClick={() => handleOpenDialog()}
              startIcon={<EditIcon />}
            >
              Yeni Kullanıcı Ekle
            </Button>
          </Box>

          <Box sx={{ height: 500 }}>
            <ClientDataGrid
              rows={filteredUsers}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Ad Soyad"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="E-posta"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Adres"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
        <DialogContent>
          {userToDelete && (
            <Typography>
              <strong>{userToDelete.name}</strong> kullanıcısını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialog(false)}>İptal</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}