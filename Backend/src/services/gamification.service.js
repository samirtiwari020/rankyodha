import User from "../models/User.js";
import Achievement from "../models/Achievement.js";

export const awardPoints = async (userId, pointsToAdd = 0) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { points: pointsToAdd } },
    { new: true }
  );

  if (!user) return null;

  if (user.points >= 100) {
    await Achievement.updateOne(
      { user: userId, code: "POINTS_100" },
      {
        $setOnInsert: {
          user: userId,
          code: "POINTS_100",
          title: "Century",
          description: "Earned 100 points"
        }
      },
      { upsert: true }
    );
  }

  return user;
};
