import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Snackbar,
    Grid,
    Select,
    MenuItem,
    IconButton,
    FormControl,
    InputLabel,
    DeleteIcon,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack'; 

const EntityEditForm = () => {
    const { entityName } = useParams(); 
    const navigate = useNavigate();
    const [entityData, setEntityData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarAlert, setSnackbarAlert] = useState(false);

    const { register, handleSubmit, setValue, getValues } = useForm();

    useEffect(() => {
        // Fetch the entity data
        const fetchEntity = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/entities/${entityName}`);
                setEntityData(response.data);
                setValue("name", response.data.name);

                // Initialize existing attributes in the form
                Object.entries(response.data.attributes).forEach(([name, type]) => {
                    setValue(`attributes.${name}`, type);
                });
            } catch (error) {
                console.error('Error fetching entity:', error);
                setError(error.message || "An error occured while fetching data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntity();
    }, [entityName, setValue]);

    const handleEntitySubmit = async (data) => {
        try {
            const response = await axios.put(`http://localhost:3000/entities/${entityName}`, data);
            if (response.status === 200) {
                toast.success('Entity updated successfully');
                setSnackbarAlert(true);
                navigate('/'); // Redirect back to the entity list page
            } else {
                toast.error('Error updating entity');
            }
        } catch (error) {
            console.error('Error updating entity:', error);
            toast.error('Error updating entity: ' + (error.response?.data?.error || error.message)); 
        }
    };


    if (isLoading) {
        return <CircularProgress />; // Show loading indicator
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>; // Display error
    }

    return (
        <Container maxWidth="md">
            <Button onClick={() => navigate(-1)} variant="outlined" sx={{ mb: 2 }}>
                <ArrowBack /> Back
            </Button>
            <Typography variant="h4" gutterBottom>
                Edit Entity: {entityName}
            </Typography>

            {/* Entity Editing Form */}
            <Box component="form" onSubmit={handleSubmit(handleEntitySubmit)} sx={{ mt: 3 }}>
                <TextField
                    fullWidth
                    label="Entity Name"
                    {...register("name", { required: 'Entity name is required' })}
                />

                <Typography variant="h6" sx={{ mt: 2 }}>Attributes</Typography>

                <Grid container spacing={2}>
                    {/* Add new attribute section */}
                    
                    {/* Render existing attributes */}
                    {getValues('attributes') &&
                        Object.entries(getValues('attributes')).map(([attrName, attrType]) => (
                            <Grid item xs={12} sm={6} md={4} key={attrName}>
                                <TextField
                                    fullWidth
                                    label="Attribute Name"
                                    {...register(`attributes.${attrName}`)}
                                    defaultValue={attrName}
                                />
                                <FormControl fullWidth>
                                    <InputLabel id={`attrType-label-${attrName}`}>Attribute Type</InputLabel>
                                    <Select
                                        labelId={`attrType-label-${attrName}`}
                                        {...register(`attributes.${attrName}`, { required: 'Attribute type is required' })}
                                        label="Attribute Type"
                                        defaultValue={attrType || ''}
                                    >
                                        <MenuItem value="string">String</MenuItem>
                                        <MenuItem value="number">Number</MenuItem>
                                        <MenuItem value="date">Date</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        ))}
                </Grid>

                <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                    Update Entity
                </Button>
            </Box>

            <Snackbar
                open={snackbarAlert}
                autoHideDuration={6000}
                onClose={() => setSnackbarAlert(false)}
            >
                <Alert onClose={() => setSnackbarAlert(false)} severity="success" sx={{ width: '100%' }}>
                    Entity updated successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EntityEditForm;

