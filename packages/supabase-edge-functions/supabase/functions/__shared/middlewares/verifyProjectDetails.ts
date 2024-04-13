// @deno-types="npm:@types/express"
import { Request, Response, NextFunction } from "npm:express";
import { validationResult } from "npm:express-validator";
import { body } from "npm:express-validator";
export const verifyProjectDetailsRules = () => [
  body("name").notEmpty(),
  body("description").notEmpty().isLength({ min: 10 }),
];
interface IError {
  [key: string]: string;
}
export const verifyProjectDetails = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.body);
  if (errors.isEmpty()) return next();
  // console.log({errors})
  const extractedErrors: IError[] = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
  return res.status(422).json({
    errors: extractedErrors,
  });
};
