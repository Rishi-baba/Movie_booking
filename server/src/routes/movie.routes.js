import express from 'express';

const router = express.Router();

// TODO: Implement Movie Controller and add actual logic

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Get all movies - Not implemented yet' });
});

router.get('/:id', (req, res) => {
    res.status(200).json({ message: `Get movie ${req.params.id} - Not implemented yet` });
});

router.post('/', (req, res) => {
    res.status(201).json({ message: 'Create new movie - Not implemented yet' });
});

router.put('/:id', (req, res) => {
    res.status(200).json({ message: `Update movie ${req.params.id} - Not implemented yet` });
});

router.delete('/:id', (req, res) => {
    res.status(200).json({ message: `Delete movie ${req.params.id} - Not implemented yet` });
});

export default router;
