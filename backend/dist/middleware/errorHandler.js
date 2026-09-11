// Converts unexpected route failures into a consistent JSON response.
export const errorHandler = (error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
};
