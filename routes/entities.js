const express = require('express');
const router = express.Router();
const Entity = require('../models/entity');
const Data = require('../models/data');
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// Inside routes/entities.js 
router.get('/', async (req, res) => {
    try {
        const entities = await Entity.findAll(); 
        console.log(entities)
        const plainEntities = entities.map(entity => entity.toJSON());
        res.json(plainEntities); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, attributes } = req.body;

        // Basic Input Validation
        if (!name || !attributes) {
            return res.status(400).json({ message: 'Name and attributes are required' });  
        }

        const entity = await Entity.create({ name, attributes });
        console.log(entity)
        res.status(201).json(entity);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Inside your routes/entities.js file 
router.get('/:entityName', async (req, res) => {
    const entityName = req.params.entityName;

    try {
        const entity = await Entity.findOne({ 
            where: { name: entityName }
        });

        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        res.json(entity); // Return the full entity data 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.get('/:entityName/entries', async (req, res) => {
    const entityName = req.params.entityName;
  
    try {
      const entries = await Data.findAll({
        where: { entity_name: entityName},
      });
      console.log(entries)
      res.json(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  // Get a specific entry by ID
router.get('/:entityName/entries/:entryId', async (req, res) => {
    const entityName = req.params.entityName;
    const entryId = req.params.entryId;

    try {
        const entry = await DataEntry.findOne({
            where: { id: entryId, entityName: entityName }
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.json(entry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});
// routes/entities.js 
// ... (Existing POST Route for Entities) ...
// Helper function for type validation
function isValidType(value, expectedType) {
    // Type checks
    switch (expectedType) {
        case 'string':  return typeof value === 'string';
        case 'number':  return typeof value === 'number';
        case 'boolean': return typeof value === 'boolean';
        case 'date':    return value instanceof Date; 
        default:        return false; // Handle unknown types
    }
}

// Add Data: POST to /entities/:entityName
router.post('/:entityName', async (req, res) => {
    const entityName = req.params.entityName;
    const data = req.body;
    console.log("data", data)

    try {
        // 1. Fetch entity definition
        const entity = await Entity.findOne({ where: { name: entityName } });
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        // // 2. Basic attribute validation (Make this more advanced later)
        // const entityAttributes = entity.attributes; 
        // console.log("entityattr", entityAttributes)
        // for (const attributeName in data) {
        //     if (!(attributeName in entityAttributes)) {
        //         return res.status(400).json({ message: `Invalid attribute: ${attributeName}` });
        //     }
        //     else {
        //         const attributeType = entityAttributes[attributeName];
        //         const attributeValue = data[attributeName]; 

        //         if (!isValidType(attributeValue, attributeType)) {
        //             return res.status(400).json({
        //                 message: `Invalid type for ${attributeName}. Expected: ${attributeType}`
        //             });
        //         }
        //     }
        // }

        // 3. Insert into 'data' table 
        const result = await sequelize.query(
            `INSERT INTO data (entity_name, attributes) VALUES (?, ?)`,
           {replacements: [entityName, JSON.stringify(data)]}
        );

        res.status(201).json({ message: 'Data added', insertId: result[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.put('/:entityName', async (req, res) => {
    const entityName = req.params.entityName;
    const entryId = req.params.id;
    const updateData = req.body;

    try {
        // 1. Fetch entity definition (for validation)
        const entity = await Entity.findOne({ where: { name: entityName } });
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        // // 2. Basic Attribute Validation 
        // const entityAttributes = entity.attributes; 
        // console.log("entityattr", entityAttributes)
        // for (const attributeName in data) {
        //     if (!(attributeName in entityAttributes)) {
        //         return res.status(400).json({ message: `Invalid attribute: ${attributeName}` });
        //     }
        //     else {
        //         const attributeType = entityAttributes[attributeName];
        //         const attributeValue = data[attributeName]; 

        //         if (!isValidType(attributeValue, attributeType)) {
        //             return res.status(400).json({
        //                 message: `Invalid type for ${attributeName}. Expected: ${attributeType}`
        //             });
        //         }
        //     }
        // }

        // 3. Update the data entry
        const [numberOfAffectedRows, affectedRows] = await sequelize.query(
            `UPDATE data SET attributes = ? WHERE entity_name = ? AND id = ?`,
            { replacements: [JSON.stringify(updateData), entityName, entryId] }
        );

        if (numberOfAffectedRows === 0) {
            return res.status(404).json({ message: 'Data entry not found' });
        }

        res.status(200).json(affectedRows[0]); // Send the updated row data back
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.delete('/:entity_name', async (req, res) => {
    const { entity_name } = req.params;

    try {
        // 1. Delete entries associated with the entity
        const deleteEntriesResult = await Data.destroy({
            where: { entity_name: entity_name },
        });

        console.log("Number of entries deleted:", deleteEntriesResult);

        // 2. Delete the entity itself from 'entities' table
        const deleteEntityResult = await Entity.destroy({
            where: { name: entity_name },
        });
        
        if (deleteEntityResult === 0) {
            return res.status(404).json({ error: 'Entity not found' });
        }

        res.json({ message: 'Entity and associated entries deleted successfully' });
    } catch (error) {
        console.error('Error deleting entity:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.put('/:entity_name/entries/:id', async (req, res) => {
    const entity_name = req.params.entity_name;
    const id = req.params.id;
    const updateData = req.body;

    try {
        // 1. Fetch entity definition (for validation)
        const entry = await Data.findOne({ where: { name: entity_name, id: id } });
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        // 3. Update the data entry
        const [numberOfAffectedRows, affectedRows] = await sequelize.query(
            `UPDATE data SET attributes = ? WHERE entity_name = ? AND id = ?`,
            { replacements: [JSON.stringify(updateData), entity_name, id] }
        );

        if (numberOfAffectedRows === 0) {
            return res.status(404).json({ message: 'Data entry not found' });
        }

        res.status(200).json(affectedRows[0]); // Send the updated row data back
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});


router.delete('/:entity_name/entries/:id', async (req, res) => {
    const { entity_name, id } = req.params;
    console.log(entity_name, id)

    try {
        // 1. Delete entries associated with the entity
        const deleteEntriesResult = await Data.destroy({
            where: { entity_name: entity_name, id: id },
        });

        console.log("Number of entries deleted:", deleteEntriesResult);

        
        
        if (deleteEntriesResult === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// ... Add other routes: GET, PUT, DELETE for data within an entity ...

module.exports = router; 
