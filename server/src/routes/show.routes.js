import express from 'express';

const router = express.Router();

// TODO: Implement Show Controller and add actual logic

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Get all shows - Not implemented yet' });
});

router.get('/:id', (req, res) => {
    res.status(200).json({ message: `Get show ${req.params.id} - Not implemented yet` });
});

router.post('/', (req, res) => {
    res.status(201).json({ message: 'Create new show - Not implemented yet' });
});

router.put('/:id', (req, res) => {
    res.status(200).json({ message: `Update show ${req.params.id} - Not implemented yet` });
});

router.delete('/:id', (req, res) => {
    res.status(200).json({ message: `Delete show ${req.params.id} - Not implemented yet` });
});

export default router;
