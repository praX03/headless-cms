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
import ArrowBack from '@mui/icons-material/ArrowBack';
const DataEntryForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { entityName } = useParams();
  const [existingEntries, setExistingEntries] = useState([]);
  const [entitySchema, setEntitySchema] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);

  useEffect(() => {
    const fetchSchemaAndEntries = async () => { // Combined the fetches
      try {

        const [schemaResponse, entriesResponse] = await Promise.all([
          fetch(`http://localhost:3000/entities/${entityName}`),
          fetch(`http://localhost:3000/entities/${entityName}/entries`),
        ]);

        const [schemaData, entriesData] = await Promise.all([
          schemaResponse.json(),
          entriesResponse.json(),
        ]);
        // console.log("Entries", entriesData)
        setEntitySchema(schemaData);
        setExistingEntries(entriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setServerError('Error fetching data');
      }
    };

    if (entityName) {
      fetchSchemaAndEntries(); // Call the combined function
    }
  }, [entityName]);

  if (!entitySchema) {
    return <div>Loading schema...</div>;
  }
//   if (!entitySchema || existingEntries.length === 0) {
//     return null; 
// }
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
    if (response.ok) { // Check if the request was successful
      setSuccessAlertOpen(true);
      const updatedEntries = await fetch(`http://localhost:3000/entities/${entityName}/entries`).then(res=>res.json());
      setExistingEntries(updatedEntries);
      reset(); // Clear the form after successful submission
    } else {
      const errorData = await response.json();
      setServerError(errorData.error || 'An error occurred');
    }
  } catch (error) {
    setServerError('Network error');
  }
  };

  const renderFormFields = () => {
    <Button onClick={() => navigate(-1)} variant="outlined" sx={{ mb: 2, mt: 2}}>
                <ArrowBack /> Back
            </Button>
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
                type={getInputType(type) === 'date' ? 'date' : getInputType(type)} // Disable checkbox functionality for now
                // Handle checkbox state here if needed
            />
        </Box>
    ));
  };

  const validateDataType = (value, type) => {
    switch (type) {
      case 'string': return typeof value === 'string';
      case 'number': return !isNaN(parseFloat(value)) && isFinite(value);
      case 'date': return !isNaN(Date.parse(value));
      default: return false;
    }
  };

  const getInputType = (type) => {
    switch (type) {
      case 'string':
      case 'number':
        return type;
      case 'date':
        return 'date';
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
