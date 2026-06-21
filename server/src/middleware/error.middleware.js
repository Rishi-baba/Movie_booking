export const errorHandler = (err, req, res, next) => {
    // Log the error so it shows up in Vercel logs!
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
