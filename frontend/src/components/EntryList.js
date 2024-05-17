import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {toast} from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    IconButton,
    Box
} from '@mui/material';
import { fetchEntities } from '../api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBack from '@mui/icons-material/ArrowBack';

const EntryList = () => {
    const navigate = useNavigate();
    const { entityName } = useParams();
    const [entries, setEntries] = useState([]);
    const [entitySchema, setEntitySchema] = useState(null);
    const [entities, setEntities] = useState([]);
    const [error, setError] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDeleteId, setEntryToDeleteId] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/entities/${entityName}/entries`);
                setEntries(response.data);
                const data = await fetchEntities();
                setEntities(data);
                console.log('Entities fetched successfully:', data); // Log success
                toast.success('Entities fetched successfully');
            
                const schemaResponse = await axios.get(`http://localhost:3000/entities/${entityName}`);
                setEntitySchema(schemaResponse.data);
            } catch (error) {
                console.error('Error fetching entries:', error);
                setError(error);
                toast.error('Error fetching entries');
            }
        };

        if (entityName) {
            fetchData();
        }
    }, [entityName]);
    const handleShowAddEntry = (entityName) => {
        console.log('Adding entry for entity:', entityName);
        navigate(`/entities/${entityName}`); // Navigate to the add entry route
    };
    const handleDeleteConfirm = async (entryToDeleteId) => {
        try {
            console.log(entityName, entryToDeleteId)
            toast.success('Entry deleted successfully');
            await axios.delete(`http://localhost:3000/entities/${entityName}/entries/${entryToDeleteId}`);
            setEntries(entries.filter(entry => entry.id !== entryToDeleteId));
        } catch (error) {
            toast.error('Error deleting entry');
            console.error('Error deleting entry:', error);
          // Consider showing an error snackbar here
        }
        setDeleteDialogOpen(false);
        setEntryToDeleteId(null);
      };
    const handleDeleteClick = (entryId) => {
        console.log('Deleting entry with ID:', entryId);
        setEntryToDeleteId(entryId);
        handleDeleteConfirm(entryId);
        setDeleteDialogOpen(true);
    };
    
      
    const handleEditEntry = (entryId) => {
        navigate(`/entities/${entityName}/entries/${entryId}/edit`);
    };
    
    if (!entitySchema) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    return (
        <Box mt={2}>
        <Button onClick={() => navigate(-1)} variant="outlined" sx={{ mb: 2, mt: 2}}>
                <ArrowBack /> Back
            </Button>
        <Typography variant="h6" sx={{ mt:2, mb:2   }}>{entityName}</Typography>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {Object.keys(entitySchema.attributes).map(attrName => (
                            <TableCell key={attrName}>{attrName}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.map(entry => (
                        <TableRow key={entry.id}>
                            {Object.entries(entry.attributes).map(([attrName, value]) => (
                                console.log(entry.id, entry.attributes, attrName, value),
                                <TableCell key={attrName}>{value}</TableCell>
                            ))}
                            <TableCell>
                        <IconButton onClick={() => handleEditEntry(entry.id)} aria-label="edit" color="primary">
                        <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(entry.id)} aria-label="delete" color="error">
                        <DeleteIcon />
                        </IconButton>
                        </TableCell>
                        </TableRow>
                        
                    ))}
                    <Button
                                    variant="outlined"
                                    onClick={() => handleShowAddEntry(entityName)}
                                    sx={{ ml: 1, mt: 1, mb:1 }} // Add some margin to the left
                                >
                                    Add Entry
                                </Button>
                </TableBody>
            </Table>
            
        </TableContainer>
        </Box>
        
    );
};

export default EntryList;
