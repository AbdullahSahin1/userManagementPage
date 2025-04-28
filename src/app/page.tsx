'use client';

import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, DataGridProps } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
        '& .MuiDataGrid-cell': {
          padding: '8px',
        },
      }}
    />
  );
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
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

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
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
          <IconButton onClick={() => handleOpenDialog(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <main className="p-8">
      <Box sx={{ height: 400, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Yeni Kullanıcı Ekle
          </Button>
        </Box>
        <ClientDataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Ad Soyad"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="E-posta"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Adres"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
        <DialogContent>
          {userToDelete && `"${userToDelete.name}" kullanıcısını silmek istediğinize emin misiniz?`}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>İptal</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}