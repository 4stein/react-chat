import { Request } from "express";
export default interface IGetUserAuthInfoRequest extends Request {
  user: any; // or any other type
}
