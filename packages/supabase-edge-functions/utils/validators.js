import { param, validationResult } from "express-validator";

export const emailValidator = [
  param("email", "Invalid email").isEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, error: errors.array()[0].msg });
    }

    next();
  }
];