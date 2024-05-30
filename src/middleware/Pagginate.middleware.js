
const paginationMiddleware =(req, res, next) => {
    const pageNumber = parseInt(req.query.page) || 1; // Get the current page number from the query parameters
    const pageSize = parseInt(req.query.pageSize) || 4
    
    const startIndex = (pageNumber - 1) * pageSize;
    
    const endIndex = startIndex + pageSize;
    
    // Attach pagination data to the request object
    req.pagination = {
      page: pageNumber,
      pageSize: pageSize,
      startIndex,
      endIndex
    };

    next(); // Call the next middleware
 };



export {
  paginationMiddleware
}