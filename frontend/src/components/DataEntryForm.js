import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
} from '@mui/material';
const DataEntryForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { entityName } = useParams();
  const [existingEntries, setExistingEntries] = useState([]);
  const [entitySchema, setEntitySchema] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch(`http://localhost:3000/entities/${entityName}`);
        const data = await response.json();
        setEntitySchema(data);

        const entriesResponse = await fetch(`http://localhost:3000/entities/${entityName}/entries`);
        const entriesData = await entriesResponse.json();
        console.log("Entries", entriesData)
        setExistingEntries(entriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setServerError('Error fetching data');
      }
    };

    if (entityName) {
      fetchSchema();
    }
  }, [entityName]);
  if (!entitySchema || existingEntries.length === 0) {
    return null; 
}
  const onSubmit = async (data) => {
    try {
      const url = `http://localhost:3000/entities/${entityName}`
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      data = response.json();
    //   setExistingEntries([...existingEntries, data])
    if (response.ok) {
        setSuccessAlertOpen(true); // Show the success alert
        setExistingEntries([...existingEntries, data]);
    } else {
        const errorData = await response.json();
        setServerError(errorData.error || 'An error occurred');
      }
    } catch (error) {
      setServerError('Network error');
    }
  };

  const renderFormFields = () => {
    if (!entitySchema) return <div>Loading schema...</div>;

    return Object.entries(entitySchema.attributes).map(([name, type]) => (
        <Box key={name} mb={2}>
            <TextField
                fullWidth
                label={`${name} (${type})`}
                {...register(name, {
                    required: true,
                    validate: (value) => validateDataType(value, type),
                })}
                error={!!errors[name]}
                helperText={errors[name] && `Invalid ${type}`}
                type={getInputType(type) === 'boolean' ? 'text' : getInputType(type)} // Disable checkbox functionality for now
                // Handle checkbox state here if needed
            />
        </Box>
    ));
  };

  const validateDataType = (value, type) => {
    switch (type) {
      case 'string': return typeof value === 'string';
      case 'number': return !isNaN(parseFloat(value)) && isFinite(value);
      case 'boolean': return typeof value === 'boolean';
      default: return false;
    }
  };

  const getInputType = (type) => {
    switch (type) {
      case 'string':
      case 'number':
        return type;
      case 'boolean':
        return 'checkbox';
      default:
        return 'text';
    }
  };
  const renderExistingEntries = () => {
    if (existingEntries.length === 0) {
        return null;
    }
    return (
        <Box mb={3}>
        <Typography variant="h6" gutterBottom>Existing Entries:</Typography>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {Object.keys(entitySchema.attributes).map((attribute) => (
                            <TableCell key={attribute}>{attribute}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {existingEntries.map((entry, index) => (
                        <TableRow key={index}>
                            {Object.entries(entry.attributes).map(([attribute, value]) => (
                                <TableCell key={attribute}>{value}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
    );
  };

  return (
    <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Add New Entry for {entityName}
            </Typography>

            {/* Display server error if exists */}
            {serverError && (
                <Alert severity="error" onClose={() => setServerError(null)}>
                    {serverError}
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                {renderFormFields()}
                <Button variant="contained" type="submit">
                    Add New Entry
                </Button>
            </form>
            
            {renderExistingEntries()}
            <Snackbar
                open={successAlertOpen}
                autoHideDuration={6000} // Hide after 6 seconds
                onClose={() => setSuccessAlertOpen(false)}
            >
                <Alert onClose={() => setSuccessAlertOpen(false)} severity="success">
                    Entry Added Successfully!
                </Alert>
            </Snackbar>
        </Container>
        
  );
};
//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       {renderFormFields()}
//       {serverError && <p style={{ color: 'red' }}>{serverError}</p>}
//       <button type="submit">Submit</button>
//     </form>
//   );
// };

export default DataEntryForm;
