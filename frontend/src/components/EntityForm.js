import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Typography,
    Box,
    Select,
    MenuItem,
    IconButton,
    FormControl,
    InputLabel,
    Grid,
    Snackbar,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';

import DeleteIcon from '@mui/icons-material/Delete';
import { useForm } from 'react-hook-form'; 

const EntityForm = ({ mode = 'add', entityToEdit, onSubmit }) => {
    const {navigate} = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        trigger,
      } = useForm();
    
    const [newAttributeName, setNewAttributeName] = useState('');
    const [newAttributeType, setNewAttributeType] = useState('string');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    useEffect(() => {
        if (mode === 'edit' && entityToEdit) {
          setValue('name', entityToEdit.name);
    
          Object.entries(entityToEdit.attributes).forEach(([name, type]) => {
            setValue(`attributes.${name}`, type);
          });
        }
      }, [mode, entityToEdit, setValue]);
    
      const handleFormSubmit = (data) => {
        onSubmit(data);
        setOpenSnackbar(true);
      };
    

    const handleAddAttribute = () => {
        // Access existing attributes using getValues
        const currentAttributes = getValues('attributes') || {};
        const newAttributes = { ...currentAttributes, [newAttributeName]: newAttributeType };
        setValue('attributes', newAttributes);
        console.log("newAttributes", newAttributes);
        // Reset input fields after adding
        setNewAttributeName('');
        setNewAttributeType('string');
    };

    const handleDeleteAttribute = (attrName) => {
        const shouldDelete = window.confirm(`Are you sure you want to delete the attribute "${attrName}"?`); // Confirm before deleting
        if (shouldDelete) {
          const currentAttributes = getValues('attributes');
          const updatedAttributes = { ...currentAttributes };
          delete updatedAttributes[attrName]; 
          setValue('attributes', updatedAttributes);
          trigger('attributes'); // Trigger validation after deleting an attribute
        }
    };
    
   
    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 3 }}>
        
          <Typography variant="h6" gutterBottom>
            {mode === 'edit' ? 'Edit Entity' : 'Create Entity'}
          </Typography>
    
          <TextField
            fullWidth
            label="Entity Name"
            {...register("name", { required: 'Entity name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
    
          <Typography variant="h6" sx={{ mt: 2 }}>Attributes</Typography>
    
          <Grid container spacing={2}>
            {/* Add new attribute section */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="New Attribute Name"
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth>
                <InputLabel id="newAttrType-label">Attribute Type</InputLabel>
                <Select
                  labelId="newAttrType-label"
                  value={newAttributeType}
                  label="Attribute Type"
                  onChange={(e) => setNewAttributeType(e.target.value)}
                >
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" onClick={handleAddAttribute} sx={{ mt: 2 }}>
                Add Attribute
              </Button>
            </Grid>
    
            {/* Render existing attributes */}
            {getValues('attributes') &&
            Object.entries(getValues('attributes')).map(([attrName, attrType]) => (
            <Grid item xs={12} sm={6} md={4} key={attrName}>  {/* <-- Grid item for each attribute */}
            <Typography variant="body1">{attrName}</Typography>
                <FormControl fullWidth>
                <InputLabel id={`attrType-label-${attrName}`}>Attribute Type</InputLabel>
                <Select
                    labelId={`attrType-label-${attrName}`}
                    {...register(`attributes.${attrName}`)}
                    label="Attribute Type"
                    defaultValue={attrType || ''}
                >
                    <MenuItem value="string">String</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                </Select>
                </FormControl>
                <IconButton onClick={() => handleDeleteAttribute(attrName)} aria-label="delete" color="error">
                    <DeleteIcon />
                </IconButton>
            </Grid>
            ))}
    </Grid>
    
          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            {mode === 'edit' ? 'Update Entity' : 'Create Entity'}
          </Button>
          <Snackbar
    open={openSnackbar}
    autoHideDuration={6000}
    onClose={() => setOpenSnackbar(false)}
>
    <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
        Entity Added Successfully!
    </Alert>
</Snackbar>
        </Box>
      );
    };

export default EntityForm;
