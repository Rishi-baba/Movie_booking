import express from 'express';

const router = express.Router();

// TODO: Implement Theatre Controller and add actual logic

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Get all theatres - Not implemented yet' });
});

router.get('/:id', (req, res) => {
    res.status(200).json({ message: `Get theatre ${req.params.id} - Not implemented yet` });
});

router.post('/', (req, res) => {
    res.status(201).json({ message: 'Create new theatre - Not implemented yet' });
});

router.put('/:id', (req, res) => {
    res.status(200).json({ message: `Update theatre ${req.params.id} - Not implemented yet` });
});

router.delete('/:id', (req, res) => {
    res.status(200).json({ message: `Delete theatre ${req.params.id} - Not implemented yet` });
});

export default router;
