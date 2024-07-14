import { Like } from "../models/Like.model.js";
import { Blog } from "../models/Blog.model.js";
import { User } from "../models/User.model.js";
import { Follower } from "../models/Follower.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


/////
const searchByUsername = AsyncHandler(async (req, res) => {
  const { userN } = req.query;
  const user = req.user?._id;

  const searchedUser = await User.aggregate([
    {
      $match: {
        username: userN
      }
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "followedto",
        as: "followers"
      }
    },
    {
      $addFields: {
        isFollowed: {
          $cond: {
            if: {
              $in: [user, "$followers.followedby"]
            },
            then: true,
            else: false
          }
        },
        followers: {
          $size: "$followers"
        }
      }
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        avatar: 1,
        email: 1,
        isFollowed: 1,
        followers: 1
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, searchedUser, "user Searched"));
});


/////
const searchBySliceUsername = AsyncHandler(async (req, res) => {
  const { userN } = req.query;
  const user = req.user?._id;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 5;
  const skip = (page - 1) * pageSize;

  const searchedUser = await User.aggregate([
    {
        $addFields: {
            slicedUsername: { $substr: ["$username", 0, userN.length] }
        }
    },
    {
        $match: {
            slicedUsername: { $regex: new RegExp(`^${userN}`, "i") }
        }
    },
    {
        $lookup: {
            from: "followers",
            localField: "_id",
            foreignField: "followedto",
            as: "followers"
        }
    },
    {
        $addFields: {
            isFollowed: {
                $cond: {
                    if: { $in: [user, "$followers.followedby"] },
                    then: true,
                    else: false
                }
            },
            followers: { $size: "$followers" }
        }
    },
    {
        $facet: {
            paginatedResults: [
                { $skip: skip },
                { $limit: pageSize },
                {
                    $project: {
                        username: 1,
                        fullname: 1,
                        avatar: 1,
                        email: 1,
                        isFollowed: 1,
                        followers: 1,
                   role:1
                    }
                }
            ],
            totalCount: [
                { $count: "totalUser" }
            ]
        }
    },
    {
        $addFields: {
            totalUser: { $arrayElemAt: ["$totalCount.totalUser", 0] }
        }
    },
    {
        $project: {
            paginatedResults: 1,
            totalUser: 1
        }
    }
]);

const results = searchedUser[0].paginatedResults;
const totalUser = searchedUser[0].totalUser;


  return res
    .status(200)
    .json(new ApiResponse(200,{results,totalUser,page,pageSize}, "user Searched"));
});


/////
const searchByMostFollowed = AsyncHandler(async (req, res) => {
  const user = req.user?._id;

  const searchedResult = await User.aggregate([
    {
      $match: {}
    },
    {
      $lookup: {
        from: "followers",
        foreignField: "followedto",
        localField: "_id",
        as: "followers"
      }
    },
    {
      $addFields: {
        isFollowed: {
          $cond: {
            if: {
              $in: [user, "$followers.followedby"]
            },
            then: true,
            else: false
          }
        },
        followers: {
          $size: "$followers"
        }
      }
    },
    {
      $sort: {
        followers: -1
      }
    },
    {
      $limit: 10
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        avatar: 1,
        email: 1,
        isFollowed: 1,
        followers: 1,
        role: 1
      }
    }
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        searchedResult,
        "Showing top 10 most followed users !"
      )
    );
});


/////
const searchByOwner = AsyncHandler(async (req, res) => {
  const user = req.user?._id;

  const searchedResult = await User.aggregate([
    {
      $match: {
        role: "owner"
      }
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "followedto",
        as: "followers"
      }
    },
    {
      $addFields: {
        isFollowed: {
          $cond: {
            if: { $in: [user, "$followers.followedby"] },
            then: true,
            else: false
          }
        },
        followers: { $size: "$followers" }
      }
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        avatar: 1,
        email: 1,
        isFollowed: 1,
        followers: 1,
        role: 1
      }
    }
  ]);
  
  return res.status(200)
  .json(new ApiResponse(200,searchedResult,"owner fetched"))
  
});




export {
  searchByUsername,
  searchByMostFollowed,
  searchByOwner,
  searchBySliceUsername
};
