import { Save } from "../models/Save.model.js";
import mongoose from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const saveBlog = AsyncHandler(async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    return res.status(409).send(new ApiError(409, "blog id is not defined !"));
  }

  const saved = await Save.create({
    blogid: blogId,
    usersaved: req.user?._id
  });

  return res.status(200).json(new ApiResponse(200, saved, "blog saved !"));
});

const removeSavedBlog = AsyncHandler(async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    return res.status(409).send(new ApiError(409, "blog id is not defined !"));
  }

  const acko = await Save.deleteOne({ blogid: blogId });

  return res.status(200).json(new ApiResponse(200, acko, "blog removed !"));
});

const getSavedBlog = AsyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.pageSize, 10) || 5;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = parseInt(page - 1) * pageSize;

  const result = await Save.aggregate([
    {
      $facet: {
        paginatedResults: [
          { $match: {} },
          { $skip: skip },
          { $limit: pageSize }
        ],
        totalCount: [
          { $match: {} },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]
      }
    }
  ]);

  const blogsId = result[0].paginatedResults;
  const totalBlogs =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
    
   return res
   .status(200)
   .json(
      new ApiResponse(200,{blogsId,totalBlogs},"saved blogs fetched ")
    )
});



export { saveBlog, removeSavedBlog,getSavedBlog };
