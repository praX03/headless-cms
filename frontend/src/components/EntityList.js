import React, { useState, useEffect } from 'react';
import { fetchEntities } from '../api';
import { useNavigate } from 'react-router-dom';
import EntityForm from './EntityForm';
import axios from 'axios';
import {
    List, Divider,  ListItem, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, ListItemText, Button, Typography, Container, Box
} from '@mui/material';
import {toast } from 'react-toastify';
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entityToDelete, setEntityToDelete] = useState(null);
    const [showEntries, setShowEntries] = useState({}); 

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchEntities();
                setEntities(data);
                toast.success('Entities fetched successfully');
                console.log('Entities fetched successfully:', data); // Log success
            } catch (error) {
                toast.error('Error fetching entities');
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
        toast.error('Error fetching entities, ', error.message);
    }
    const handleShowEntriesClick = (entityName) => {
        navigate(`/entities/${entityName}/entries`);
    };
    const handleEditClick = (entity) => {
        navigate(`/entities/${entity.name}/edit`);
    };
    const handleDeleteClick = (entity) => {
        setEntityToDelete(entity);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        console.log('Deleting entity:', entityToDelete);
        try {
            await axios.delete(`http://localhost:3000/entities/${entityToDelete.name}`);
            setEntities(entities.filter(e => e.name !== entityToDelete.name));
            console.log(entities)
            toast.success('Entity deleted successfully');
        } catch (error) {
            console.error('Error deleting entity:', error);
            toast.error('Error deleting entity');
            // Consider showing an error message to the user
        } finally {
            setDeleteDialogOpen(false);
            setEntityToDelete(null);
        }
    };

    const handleEntitySubmit = async (formData) => {
        try {
            const method = 'POST'; // Use PUT for editing
            const url = 'http://localhost:3000/entities';
            
            const response = await axios({ method, url, data: formData });

        if (response.status === 200 || response.status === 201) {
            toast.success('Entity saved successfully');
            // Success: update UI if needed
            setEntities(prevEntities => {

                    return [...prevEntities, response.data];

            });
            setShowForm(false);
        } else {
            console.error('Error submitting entity:', response);
            toast.error('Error submitting entity');
        }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error submitting entity');
        }
    };
    return (
        <Container maxWidth="md" sx={{mt: 2}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Entity List
            </Typography>
            <Box mr={1} mb={2}>
            <Button onClick={() => {setShowForm(true);}} variant="outlined">
                Add New Entity
            </Button>
            </Box>
            {showForm && (
                <>

                <Button onClick={() => setShowForm(false)} variant="outlined">
                <ArrowBack /> Back
                </Button>

                <EntityForm 
                    mode={'add'} 
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
                                {/* <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(entity)}>
                                    <EditIcon />
                                </IconButton> */}
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(entity)}>
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
