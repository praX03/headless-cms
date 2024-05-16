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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm } from 'react-hook-form'; 

const EntityForm = ({ mode = 'add', entityToEdit, onSubmit }) => {
    const handleFormSubmit = (event) => {
        console.log('Submitting form with attributes:', attributes);
        event.preventDefault();
        onSubmit({ name, attributes }); 
        // fetch('http://localhost:3000/entities/', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ name, attributes })
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log('Received response from server:', data);
        //     })
        //     .catch(error => {
        //         console.error('Error occurred while submitting form:', error);
        //     });
        setName(''); // Reset name for subsequent usage 
        setAttributes({}); // Reset attributes 
    };
    const { register, handleSubmit, formState: { errors } , reset} = useForm();
    const [name, setName] = useState('');
    const [attributes, setAttributes] = useState({});
    const [newAttributeName, setNewAttributeName] = useState('');
    const [newAttributeType, setNewAttributeType] = useState('string');
    useEffect(() => {
        if (mode === 'edit' && entityToEdit) {
            setName(entityToEdit.name);
            setAttributes(entityToEdit.attributes);
            reset(entityToEdit);
        }
    }, [mode, entityToEdit, reset]);


    const handleAddAttribute = () => {
        console.log('Added attribute:', newAttributeName, newAttributeType);

        setAttributes({ ...attributes, [newAttributeName]: newAttributeType });
        setNewAttributeName(''); 
        setNewAttributeType('string'); 
    };

    const handleDeleteAttribute = (attributeName) => {
        const updatedAttributes = { ...attributes };
        delete updatedAttributes[attributeName]; 
        setAttributes(updatedAttributes);
    };
    
   

    return (
    //     <form onSubmit={handleSubmit}>
    //         <input 
    //             type="text" 
    //             value={name} 
    //             onChange={e => setName(e.target.value)} 
    //             placeholder="Entity Name" 
    //         />
    //         <h2>Attributes</h2> 
    //         {Object.entries(attributes).map(([attrName, attrType]) => (
    //             <div key={attrName}>
    //                 <input 
    //                     type="text" 
    //                     value={attrName} 
    //                     onChange={(e) => setAttributes({ ...attributes, [e.target.value]: attrType })}
    //                 />
    //                 <select value={attrType} onChange={(e) => setAttributes({ ...attributes, [attrName]: e.target.value })}>
    //                     <option value="string">String</option>
    //                     <option value="number">Number</option>
    //                     <option value="boolean">Boolean</option>
    //                 </select>
    //                 <button type="button" onClick={() => handleDeleteAttribute(attrName)}>Delete</button>
    //             </div>
    //         ))}
    //         <div> {/* Container for better styling, if needed */} 
    //     <input 
    //         type="text" 
    //         value={newAttributeName} 
    //         onChange={(e) => setNewAttributeName(e.target.value)}
    //         placeholder="Attribute Name"
    //     />
    //     <select value={newAttributeType} onChange={(e) => setNewAttributeType(e.target.value)}>
    //         <option value="string">String</option>
    //         <option value="number">Number</option>
    //         <option value="boolean">Boolean</option>
    //     </select>
    //     <button type="button" onClick={handleAddAttribute}>Add Attribute</button>
    // </div>
    //         <button type="submit">{mode === 'edit' ? 'Update' : 'Create'}</button>
    //     </form>
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                {mode === 'edit' ? 'Edit Entity' : 'Create Entity'}
            </Typography>

            <TextField
                fullWidth
                label="Entity Name"
                {...register("name", { required: 'Entity name is required' })} // Use register with error message
                error={!!errors.name}
                helperText={errors.name?.message} // Display error message from react-hook-form
            />

            <Typography variant="h6" sx={{ mt: 2 }}>Attributes</Typography>

            {/* Render existing attributes */}
            <Grid container spacing={2}>
                {Object.entries(attributes).map(([attrName, attrType]) => (
                    <Grid item xs={12} sm={6} md={4} key={attrName}>
                        <TextField
                            fullWidth
                            label="Attribute Name"
                            value={attrName}
                            onChange={(e) => setAttributes({ ...attributes, [e.target.value]: attrType })}
                        />
                        <FormControl fullWidth>
                            <InputLabel id={`attrType-label-${attrName}`}>Attribute Type</InputLabel>
                            <Select
                                labelId={`attrType-label-${attrName}`}
                                value={attrType}
                                label="Attribute Type"
                                onChange={(e) => setAttributes({ ...attributes, [attrName]: e.target.value })}
                            >
                                <MenuItem value="string">String</MenuItem>
                                <MenuItem value="number">Number</MenuItem>
                                <MenuItem value="boolean">Boolean</MenuItem>
                            </Select>
                        </FormControl>
                        <IconButton onClick={() => handleDeleteAttribute(attrName)} aria-label="delete" color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                ))}

                {/* Input for new attribute */}
                <Grid item xs={12} sm={6} md={4}>
                    <Box mb={2}>
                    <TextField
                        fullWidth
                        label="New Attribute Name"
                        value={newAttributeName}
                        onChange={(e) => setNewAttributeName(e.target.value)}
                    />
                    </Box>
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
                            <MenuItem value="boolean">Boolean</MenuItem>
                        </Select>
                    </FormControl>
                    <Box mt={2}>
                    <Button variant="outlined" onClick={handleAddAttribute}>
                        Add Attribute
                    </Button>
                    </Box>
                </Grid>
            </Grid>

            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                {mode === 'edit' ? 'Update Entity' : 'Create Entity'}
            </Button>
        </Box>
    );
};

export default EntityForm;
