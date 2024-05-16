import React, { useState, useEffect } from 'react';
import { fetchEntities } from '../api';
import { useNavigate } from 'react-router-dom';
import EntityForm from './EntityForm';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    List, Divider,  ListItem, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, ListItemText, Button, Typography, Container, Box
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBack from '@mui/icons-material/ArrowBack';
import DataEntryForm from './DataEntryForm';

const EntityList = () => {
    const navigate = useNavigate(); 
    const [entities, setEntities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingEntity, setEditingEntity] = useState(null); // State to track the entity being edited
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entityToDelete, setEntityToDelete] = useState(null);
    const [showEntries, setShowEntries] = useState({}); 

    const toggleForm = () => {
        setShowForm(!showForm); // Toggle form visibility state
    };
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchEntities();
                setEntities(data);

                console.log('Entities fetched successfully:', data); // Log success
            } catch (error) {
                setError(error);
                console.error('Error fetching entities:', error); // Detailed error 
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []); 
    if (isLoading) {
        return <div>Loading entities...</div>;
    }
    if (error) {
        return <div>Internal Server Error</div>;
    }

    

    const handleShowEntriesClick = (entityName) => {
        navigate(`/entities/${entityName}/entries`);
    };
    const handleEditClick = (entity) => {
        setEditingEntity(entity);
        setShowForm(true);
    };

    const handleDeleteClick = (entity) => {
        setEntityToDelete(entity);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`http://localhost:3000/entities/${entityToDelete}`);
            setEntities(entities.filter(e => e.name !== entityToDelete));
            console.log(entities)
        } catch (error) {
            console.error('Error deleting entity:', error);
            // Consider showing an error message to the user
        } finally {
            setDeleteDialogOpen(false);
            setEntityToDelete(null);
        }
    };
    const handleEntitySubmit = async (formData) => {
        try {
            const method = editingEntity ? 'PUT' : 'POST'; // if you're editing use put else post.
            const url = editingEntity ? `http://localhost:3000/entities/${editingEntity.id}` : 'http://localhost:3000/entities';
            const response = await axios({
                method: method,
                url: url,
                data: formData,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200 || response.status === 201) {
                // Success: update UI if needed
                setEntities(prevEntities => {
                    if (editingEntity) {
                        return prevEntities.map(entity => entity.id === response.data.id ? response.data : entity);
                    } else {
                        return [...prevEntities, response.data];
                    }
                });
                setShowForm(false);
                setEditingEntity(null)
            } else {
                console.error('Error submitting entity:', response);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    return (
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom>
                Entity List
            </Typography>
            <Box mr={1} mb={2}>
            <Button onClick={() => {setShowForm(true); setEditingEntity(null);}} variant="outlined">
                Add New Entity
            </Button>
            </Box>
            {showForm && (
                <>

                <Button onClick={() => setShowForm(false)} variant="outlined">
                <ArrowBack /> Back
                </Button>

                <EntityForm 
                    mode={editingEntity ? 'edit' : 'add'} 
                    entityToEdit={editingEntity} 
                    onSubmit={handleEntitySubmit} 
                />
            </>
            )}
            <Box mt={3}>
                <List>
                    {entities.map((entity) => (
                        <React.Fragment key={entity.id}>
                            <ListItem>
                                <ListItemText primary={entity.name} secondary={
                                        <Typography variant="body2">
                                                Attributes: {Object.keys(entity.attributes).join(', ')}
                                        </Typography>
                                } />
                                {/* Add View Entries button */}
                                <Button
                                    variant="outlined"
                                    onClick={() => handleShowEntriesClick(entity.name)}
                                >
                                    View Entries
                                </Button>

                                {/* Buttons for edit and delete */}
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(entity.name)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(entity.name)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                            <Divider />

                            {/* Render entries only if showEntries is true for this entity */}
                            {showEntries[entity.id] && (
                                <Box pl={4}>
                                    <DataEntryForm entityName={entity.name} />
                                </Box>
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Entity</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this entity? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EntityList;
