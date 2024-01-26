// @deno-types="npm:@types/express"
import { Request, Response, NextFunction } from "npm:express";
import { body } from "npm:express-validator";
export default [
  body("name").notEmpty(),
  body("description").notEmpty().isLength({ min: 10 }),
];
