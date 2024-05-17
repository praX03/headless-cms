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
    Snackbar
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack'; // Add import for ArrowBack

const EntryEditForm = () => {
    const { entityName, entryId } = useParams();
    const navigate = useNavigate();
    const [entryData, setEntryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarAlert, setSnackbarAlert] = useState(false);
    const { register, handleSubmit } = useForm();

    useEffect(() => {
        const fetchEntry = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/entities/${entityName}/entries/${entryId}`);
                setEntryData(response.data);
            } catch (error) {
                console.error('Error fetching entry:', error);
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntry();
    }, [entityName, entryId]);

    const handleEntrySubmit = async (formData) => {
        const { attributes, ...otherData } = formData;
        const updatedData = { ...otherData, ...attributes };
        try {
            const response = await axios.put(`http://localhost:3000/entities/${entityName}/entries/${entryId}`, updatedData);
            if (response.status === 200) {
                setSnackbarAlert(true);
                navigate(`/entities/${entityName}/entries`); // Redirect to entry list after successful update
            } else {
                toast.error('Error updating entry');
            }
        } catch (error) {
            console.error('Error updating entry:', error);
            toast.error('Error updating entry');
        }
    };

    if (isLoading) {
        return <CircularProgress />; // Show loading indicator
    }

    if (error) {
        return <Alert severity="error">{error.message}</Alert>; // Display error
    }

    return (
        <Container maxWidth="md">
            <Button onClick={() => navigate(-1)} variant="outlined" sx={{ mb: 2, mt: 2}}>
                <ArrowBack /> Back
            </Button>
            <Typography variant="h4" gutterBottom>
                Edit Entry for {entityName} (ID: {entryId})
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit(handleEntrySubmit)}
                noValidate
                sx={{ mt: 1 }}
            >
                {Object.entries(entryData.attributes).map(([attrName, attrValue]) => (
                    <TextField
                        key={attrName}
                        margin="normal"
                        fullWidth
                        label={attrName}
                        defaultValue={attrValue}
                        {...register(`attributes.${attrName}`, { required: true })} // Consider adding validation based on attribute type
                    />
                ))}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    Update Entry
                </Button>
            </Box>
            <Snackbar
    open={snackbarAlert}
    autoHideDuration={6000}
    onClose={() => setSnackbarAlert(false)}
>
    <Alert onClose={() => setSnackbarAlert(false)} severity="success" sx={{ width: '100%' }}>
        Entry updated successfully!
    </Alert>
</Snackbar>
        </Container>
    );
};

export default EntryEditForm;
