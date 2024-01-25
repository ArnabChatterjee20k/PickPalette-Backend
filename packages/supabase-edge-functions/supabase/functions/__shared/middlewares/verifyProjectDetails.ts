// @deno-types="npm:@types/express"
import {Request,Response,NextFunction} from "npm:express";
export default (req:Request,res:Response,next:NextFunction)=>{
    next()
}